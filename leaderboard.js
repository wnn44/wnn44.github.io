'use strict';

/**
 * Leaderboard — единый модуль для работы с таблицей рекордов (Supabase).
 * Содержит:
 *  - Таймауты запросов (макс 3.5 сек), чтобы UI не зависал при лагах сети
 *  - Стратегию Stale-While-Revalidate (кэширование в localStorage для мгновенного отклика 0 мс)
 */
const Leaderboard = (() => {
  const SUPABASE_URL = 'https://ovoacfpdgupfdrdmomgp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_wt0MIOGgL0V_qbOCOudyJw_CiG19rO1';
  const REQUEST_TIMEOUT_MS = 3500; // 3.5 секунды максимум на сетевой запрос

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

  /**
   * Обертка над асинхронной функцией с таймаутом
   */
  function withTimeout(promise, ms = REQUEST_TIMEOUT_MS) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: Supabase didn't respond in ${ms}ms`)), ms)
      )
    ]);
  }

  /**
   * Помощники локального кэша (localStorage)
   */
  function getCache(key) {
    try {
      const item = localStorage.getItem(`neon_cache_${key}`);
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  }

  function setCache(key, value) {
    try {
      localStorage.setItem(`neon_cache_${key}`, JSON.stringify(value));
    } catch {}
  }

  return {
    /** Топ игроков для игры. Возвращает [{username, score}, ...] */
    async getTop(gameId, limit = 50) {
      const cacheKey = `top_${gameId}_${limit}`;
      const cached = getCache(cacheKey);

      try {
        const queryPromise = sb()
          .from('leaderboards')
          .select('username, score')
          .eq('game_id', gameId)
          .order('score', { ascending: false })
          .limit(limit);

        const { data, error } = await withTimeout(queryPromise);
        if (error) throw error;
        const result = data || [];
        setCache(cacheKey, result);
        return result;
      } catch (e) {
        console.warn(`⚠️ Leaderboard getTop fetch failed (${e.message}), using cache.`);
        return cached || [];
      }
    },

    /** Лучший результат игрока. Возвращает число. */
    async getPlayerBest(gameId, username) {
      if (!username) return 0;
      const cacheKey = `best_${gameId}_${username.toLowerCase()}`;
      const cached = getCache(cacheKey);

      try {
        const queryPromise = sb()
          .from('leaderboards')
          .select('score')
          .eq('game_id', gameId)
          .eq('username', username)
          .maybeSingle();

        const { data, error } = await withTimeout(queryPromise);
        if (error) throw error;
        const score = (data && typeof data.score === 'number') ? data.score : 0;
        setCache(cacheKey, score);
        return score;
      } catch (e) {
        console.warn(`⚠️ getPlayerBest fetch failed (${e.message}), using cache.`);
        return typeof cached === 'number' ? cached : 0;
      }
    },

    /** Мировой рекорд. Возвращает {username, score}. */
    async getGlobalRecord(gameId) {
      const cacheKey = `global_${gameId}`;
      const cached = getCache(cacheKey);

      try {
        const queryPromise = sb()
          .from('leaderboards')
          .select('username, score')
          .eq('game_id', gameId)
          .order('score', { ascending: false })
          .limit(1);

        const { data, error } = await withTimeout(queryPromise);
        if (error) throw error;
        const res = (data && data[0])
          ? { username: data[0].username, score: data[0].score }
          : { username: '—', score: 0 };
        setCache(cacheKey, res);
        return res;
      } catch (e) {
        console.warn(`⚠️ getGlobalRecord fetch failed (${e.message}), using cache.`);
        return cached || { username: '—', score: 0 };
      }
    },

    /** Отправить результат (upsert — обновляет если новый score выше). */
    async submit(gameId, username, score) {
      if (!username || !score || score <= 0) return false;

      // Обновляем локальный кэш рекорда мгновенно
      const bestCacheKey = `best_${gameId}_${username.toLowerCase()}`;
      const currentBest = getCache(bestCacheKey) || 0;
      if (score > currentBest) {
        setCache(bestCacheKey, score);
      }

      try {
        const queryPromise = (async () => {
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
        })();

        return await withTimeout(queryPromise, 5000); // 5 сек на отправку
      } catch (e) {
        console.error('❌ Score submit error:', e.message);
        return false;
      }
    },

    /** Позиция игрока в рейтинге (1-based) или null если не в топе. */
    async getPlayerRank(gameId, username) {
      if (!username) return null;
      try {
        const top = await this.getTop(gameId, 100);
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
