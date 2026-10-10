'use strict';

/**
 * Leaderboard — единый модуль для работы с таблицей рекордов (Supabase).
 * Оптимизирован против шторма сетевых запросов:
 *  - 1 пакетный запрос getAllPlayerBests() вместо N отдельных вызовов для каждой игры
 *  - In-memory & LocalStorage кэширование повторных вызовов getTop (кеш 60 секунд)
 *  - Безопасные асинхронные вызовы с таймаутом
 */
const Leaderboard = (() => {
  const SUPABASE_URL = 'https://ovoacfpdgupfdrdmomgp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_wt0MIOGgL0V_qbOCOudyJw_CiG19rO1';
  const NETWORK_TIMEOUT_MS = 8000;
  const CACHE_TTL_MS = 60000; // 1 минута жизни кэша для топов

  let _sb = null;
  function sb() {
    if (!_sb) {
      if (!window.supabase) {
        console.warn('⚠️ Supabase SDK не загружен');
        return null;
      }
      _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return _sb;
  }

  // Кэш в памяти браузера для убирания спама повторных запросов
  const memCache = new Map();

  function getCache(key) {
    // 1. Проверяем быструю память
    if (memCache.has(key)) {
      const entry = memCache.get(key);
      if (Date.now() - entry.time < CACHE_TTL_MS) {
        return entry.value;
      }
    }
    // 2. Проверяем localStorage
    try {
      const item = localStorage.getItem(`neon_cache_${key}`);
      if (item !== null) {
        const parsed = JSON.parse(item);
        memCache.set(key, { value: parsed, time: Date.now() });
        return parsed;
      }
    } catch {}
    return null;
  }

  function setCache(key, value) {
    memCache.set(key, { value, time: Date.now() });
    try {
      localStorage.setItem(`neon_cache_${key}`, JSON.stringify(value));
    } catch {}
  }

  /** Выполнить асинхронную функцию с таймаутом сети */
  async function fetchWithTimeout(asyncFn, ms = NETWORK_TIMEOUT_MS) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });
    try {
      const res = await Promise.race([asyncFn(), timeoutPromise]);
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  return {
    /** Топ игроков для игры. Возвращает [{username, score}, ...] */
    async getTop(gameId, limit = 50) {
      const cacheKey = `top_${gameId}_${limit}`;
      const cached = getCache(cacheKey);
      if (cached) return cached; // Отдаем мгновенно если кэшировано

      try {
        const res = await fetchWithTimeout(async () => {
          return await sb()
            .from('leaderboards')
            .select('username, score')
            .eq('game_id', gameId)
            .order('score', { ascending: false })
            .limit(limit);
        });

        if (res.error) throw res.error;
        const result = res.data || [];
        setCache(cacheKey, result);
        return result;
      } catch (e) {
        console.warn(`⚠️ getTop fetch failed (${e.message}).`);
        return cached || [];
      }
    },

    /** ОДИН пакетный запрос для получения всех рекордов игрока по всем играм сразу! */
    async getAllPlayerBests(username) {
      if (!username) return {};
      const cacheKey = `all_bests_${username.toLowerCase()}`;
      const cached = getCache(cacheKey);

      try {
        const res = await fetchWithTimeout(async () => {
          return await sb()
            .from('leaderboards')
            .select('game_id, score')
            .eq('username', username);
        });

        if (res.error) throw res.error;
        const map = {};
        if (res.data) {
          for (const item of res.data) {
            if (!map[item.game_id] || item.score > map[item.game_id]) {
              map[item.game_id] = item.score;
            }
          }
        }
        setCache(cacheKey, map);
        return map;
      } catch (e) {
        console.warn(`⚠️ getAllPlayerBests network failed (${e.message}).`);
        return cached || {};
      }
    },

    /** Лучший результат игрока. Возвращает число. */
    async getPlayerBest(gameId, username) {
      if (!username) return 0;
      const cacheKey = `best_${gameId}_${username.toLowerCase()}`;
      const cached = getCache(cacheKey);
      if (typeof cached === 'number') return cached;

      try {
        const res = await fetchWithTimeout(async () => {
          return await sb()
            .from('leaderboards')
            .select('score')
            .eq('game_id', gameId)
            .eq('username', username)
            .maybeSingle();
        });

        if (res.error) throw res.error;
        const score = (res.data && typeof res.data.score === 'number') ? res.data.score : 0;
        setCache(cacheKey, score);
        return score;
      } catch (e) {
        console.warn(`⚠️ getPlayerBest fetch failed (${e.message}).`);
        return typeof cached === 'number' ? cached : 0;
      }
    },

    /** Мировой рекорд. Возвращает {username, score}. */
    async getGlobalRecord(gameId) {
      const cacheKey = `global_${gameId}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

      try {
        const res = await fetchWithTimeout(async () => {
          return await sb()
            .from('leaderboards')
            .select('username, score')
            .eq('game_id', gameId)
            .order('score', { ascending: false })
            .limit(1);
        });

        if (res.error) throw res.error;
        const result = (res.data && res.data[0])
          ? { username: res.data[0].username, score: res.data[0].score }
          : { username: '—', score: 0 };
        setCache(cacheKey, result);
        return result;
      } catch (e) {
        console.warn(`⚠️ getGlobalRecord fetch failed (${e.message}).`);
        return cached || { username: '—', score: 0 };
      }
    },

    /** Отправить результат (upsert). */
    async submit(gameId, username, score) {
      if (!username || !score || score <= 0) return false;

      // Сбрасываем кэш для этой игры
      memCache.delete(`best_${gameId}_${username.toLowerCase()}`);
      memCache.delete(`top_${gameId}_50`);
      memCache.delete(`top_${gameId}_100`);

      try {
        const res = await fetchWithTimeout(async () => {
          const { data: existing, error: selErr } = await sb()
            .from('leaderboards')
            .select('id, score')
            .eq('game_id', gameId)
            .eq('username', username)
            .maybeSingle();
          if (selErr) throw selErr;

          if (existing) {
            if (score > existing.score) {
              const { error } = await sb()
                .from('leaderboards')
                .update({ score, date: new Date().toISOString() })
                .eq('id', existing.id);
              if (error) throw error;
            }
          } else {
            const { error } = await sb()
              .from('leaderboards')
              .insert({ game_id: gameId, username, score });
            if (error) throw error;
          }
          return true;
        }, 10000);

        return res === true;
      } catch (e) {
        console.error('❌ Score submit error:', e.message);
        return false;
      }
    },

    /** Позиция игрока в рейтинге (1-based) или null если не в топе. */
    async getPlayerRank(gameId, username) {
      if (!username) return null;
      try {
        const top = await this.getTop(gameId, 50);
        const idx = top.findIndex(
          e => e.username.toLowerCase() === username.toLowerCase()
        );
        return idx >= 0 ? idx + 1 : null;
      } catch (e) {
        return null;
      }
    },
  };
})();

window.Leaderboard = Leaderboard;
