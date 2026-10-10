'use strict';

/**
 * Leaderboard — Централизованное локальное хранилище рекордов NEON ARCADE.
 *
 * Архитектура:
 * 1. Скачивает ВСЮ таблицу рекордов с Supabase ровно 1 запросом.
 * 2. Раскладывает данные по местам в localStorage.
 * 3. Поддерживает алиасы названий игр (например, neon-match3 = neon-balls3).
 * 4. Все игры и экраны читают данные МГНОВЕННО (0 мс) из локального хранилища.
 * 5. При обновлении данных отправляет событие 'leaderboard-updated',
 *    чтобы все карточки и экраны обновились автоматически.
 */
const Leaderboard = (() => {
  const SUPABASE_URL = 'https://ovoacfpdgupfdrdmomgp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_wt0MIOGgL0V_qbOCOudyJw_CiG19rO1';
  const DB_CACHE_KEY = 'neon_arcade_db_v1';
  const LAST_SYNC_KEY = 'neon_arcade_last_sync';
  const SYNC_INTERVAL_MS = 120000;

  // Алиасы для игр с разными вариантами ID
  const ALIAS_MAP = {
    'neon-match3': 'neon-balls3',
    'neon-balls3': 'neon-match3',
    'bubble_strike': 'neon_bubble_shooter',
    'neon_bubble_shooter': 'bubble_strike'
  };

  function isSameGame(id1, id2) {
    if (!id1 || !id2) return false;
    if (id1 === id2) return true;
    return ALIAS_MAP[id1] === id2 || ALIAS_MAP[id2] === id1;
  }

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

  function loadLocalDb() {
    try {
      const data = localStorage.getItem(DB_CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveLocalDb(records) {
    try {
      localStorage.setItem(DB_CACHE_KEY, JSON.stringify(records));
      localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    } catch {}
  }

  let db = loadLocalDb();
  let isSyncing = false;

  function notifyUpdated() {
    try {
      window.dispatchEvent(new CustomEvent('leaderboard-updated', { detail: db }));
    } catch {}
  }

  async function sync(force = false) {
    const lastSync = Number(localStorage.getItem(LAST_SYNC_KEY) || 0);
    const isFresh = (Date.now() - lastSync < SYNC_INTERVAL_MS) && db.length > 0;

    if (!force && isFresh) {
      notifyUpdated();
      return db;
    }

    if (isSyncing) return db;
    isSyncing = true;

    try {
      const client = sb();
      if (!client) return db;

      const { data, error } = await client
        .from('leaderboards')
        .select('game_id, username, score')
        .order('score', { ascending: false });

      if (error) throw error;

      if (data && Array.isArray(data)) {
        db = data;
        saveLocalDb(db);
        notifyUpdated();
      }
    } catch (e) {
      console.warn('⚠️ Leaderboard sync warn:', e.message);
    } finally {
      isSyncing = false;
    }
    return db;
  }

  if (db.length === 0) {
    sync(true);
  } else {
    setTimeout(() => sync(false), 300);
  }

  return {
    sync,

    /** Топ игроков для игры */
    getTop(gameId, limit = 50) {
      const filtered = db.filter(r => isSameGame(r.game_id, gameId));
      filtered.sort((a, b) => b.score - a.score);
      return filtered.slice(0, limit);
    },

    /** Все рекорды игрока по всем играм */
    getAllPlayerBests(username) {
      if (!username) return {};
      const uLower = username.toLowerCase();
      const map = {};
      for (const item of db) {
        if (item.username && item.username.toLowerCase() === uLower) {
          const gId = item.game_id;
          if (!map[gId] || item.score > map[gId]) {
            map[gId] = item.score;
          }
          // Также записываем в алиас
          if (ALIAS_MAP[gId]) {
            const alias = ALIAS_MAP[gId];
            if (!map[alias] || item.score > map[alias]) {
              map[alias] = item.score;
            }
          }
        }
      }
      return map;
    },

    /** Личный рекорд игрока */
    getPlayerBest(gameId, username) {
      if (!username) return 0;
      const uLower = username.toLowerCase();
      let best = 0;
      for (const item of db) {
        if (isSameGame(item.game_id, gameId) && item.username && item.username.toLowerCase() === uLower) {
          if (item.score > best) best = item.score;
        }
      }
      return best;
    },

    /** Мировой рекорд для игры */
    getGlobalRecord(gameId) {
      const top = this.getTop(gameId, 1);
      return top.length > 0
        ? { username: top[0].username, score: top[0].score }
        : { username: '—', score: 0 };
    },

    /** Позиция игрока в рейтинге */
    getPlayerRank(gameId, username) {
      if (!username) return null;
      const top = this.getTop(gameId, 500);
      const uLower = username.toLowerCase();
      const idx = top.findIndex(e => e.username && e.username.toLowerCase() === uLower);
      return idx >= 0 ? idx + 1 : null;
    },

    /** Отправить результат */
    async submit(gameId, username, score) {
      if (!username || !score || score <= 0) return false;

      const uLower = username.toLowerCase();
      let existing = db.find(r => isSameGame(r.game_id, gameId) && r.username.toLowerCase() === uLower);
      if (existing) {
        if (score > existing.score) existing.score = score;
      } else {
        db.push({ game_id: gameId, username, score });
      }
      saveLocalDb(db);
      notifyUpdated();

      try {
        const client = sb();
        if (!client) return true;

        const { data: remoteData, error: selErr } = await client
          .from('leaderboards')
          .select('id, score')
          .eq('game_id', gameId)
          .eq('username', username)
          .maybeSingle();

        if (selErr) throw selErr;

        if (remoteData) {
          if (score > remoteData.score) {
            await client
              .from('leaderboards')
              .update({ score, date: new Date().toISOString() })
              .eq('id', remoteData.id);
          }
        } else {
          await client
            .from('leaderboards')
            .insert({ game_id: gameId, username, score });
        }

        setTimeout(() => sync(true), 600);
        return true;
      } catch (e) {
        console.warn('⚠️ Background score submit warn:', e.message);
        return true;
      }
    },
  };
})();

window.Leaderboard = Leaderboard;
