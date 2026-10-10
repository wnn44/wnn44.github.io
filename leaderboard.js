'use strict';

/**
 * Leaderboard — Централизованное локальное хранилище рекордов NEON ARCADE.
 *
 * Принцип работы:
 * 1. При запуске подтягивает 1 ЕДИНСТВЕННЫЙ слепок базы Supabase и сохраняет в localStorage.
 * 2. Все игры и UI мгновенно (0 мс) читают топы, рекорды и ранги из локального хранилища.
 * 3. При установке нового рекорда очки мгновенно пишутся локально, а фоном отправляются в Supabase.
 * 4. Никаких сетевых задержек в играх и на главной странице!
 */
const Leaderboard = (() => {
  const SUPABASE_URL = 'https://ovoacfpdgupfdrdmomgp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_wt0MIOGgL0V_qbOCOudyJw_CiG19rO1';
  const DB_CACHE_KEY = 'neon_arcade_db_v1';
  const LAST_SYNC_KEY = 'neon_arcade_last_sync';
  const SYNC_INTERVAL_MS = 180000; // 3 минуты фонового синка

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

  // Загрузить локальный слепок из localStorage
  function loadLocalDb() {
    try {
      const data = localStorage.getItem(DB_CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Сохранить локальный слепок в localStorage
  function saveLocalDb(records) {
    try {
      localStorage.setItem(DB_CACHE_KEY, JSON.stringify(records));
      localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    } catch {}
  }

  let db = loadLocalDb(); // Внутреннее локальное хранилище записей [{game_id, username, score}, ...]
  let isSyncing = false;

  /**
   * Скачать свежий слепок всей таблицы leaderboards с Supabase за 1 запрос
   */
  async function sync(force = false) {
    const lastSync = Number(localStorage.getItem(LAST_SYNC_KEY) || 0);
    if (!force && Date.now() - lastSync < SYNC_INTERVAL_MS && db.length > 0) {
      return db; // Данные свежие, сеть не мучаем
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

      if (data) {
        db = data;
        saveLocalDb(db);
      }
    } catch (e) {
      console.warn('⚠️ Leaderboard background sync warn:', e.message);
    } finally {
      isSyncing = false;
    }
    return db;
  }

  // Запускаем фоновую синхронизацию при подключении скрипта
  setTimeout(() => sync(), 100);

  return {
    /** Сделать синхронизацию с сетью (по кнопке или принудительно) */
    sync,

    /** Топ игроков для игры (мгновенно 0 мс из локальной БД) */
    getTop(gameId, limit = 50) {
      const filtered = db.filter(r => r.game_id === gameId);
      filtered.sort((a, b) => b.score - a.score);
      return filtered.slice(0, limit);
    },

    /** Все рекорды данного игрока по всем играм (мгновенно 0 мс из локальной БД) */
    getAllPlayerBests(username) {
      if (!username) return {};
      const uLower = username.toLowerCase();
      const map = {};
      for (const item of db) {
        if (item.username && item.username.toLowerCase() === uLower) {
          if (!map[item.game_id] || item.score > map[item.game_id]) {
            map[item.game_id] = item.score;
          }
        }
      }
      return map;
    },

    /** Лучший результат игрока в конкретной игре (мгновенно 0 мс из локальной БД) */
    getPlayerBest(gameId, username) {
      if (!username) return 0;
      const uLower = username.toLowerCase();
      let best = 0;
      for (const item of db) {
        if (item.game_id === gameId && item.username && item.username.toLowerCase() === uLower) {
          if (item.score > best) best = item.score;
        }
      }
      return best;
    },

    /** Мировой рекорд для игры (мгновенно 0 мс из локальной БД) */
    getGlobalRecord(gameId) {
      const top = this.getTop(gameId, 1);
      return top.length > 0
        ? { username: top[0].username, score: top[0].score }
        : { username: '—', score: 0 };
    },

    /** Позиция игрока в рейтинге (1-based) или null (мгновенно 0 мс) */
    getPlayerRank(gameId, username) {
      if (!username) return null;
      const top = this.getTop(gameId, 500);
      const uLower = username.toLowerCase();
      const idx = top.findIndex(e => e.username && e.username.toLowerCase() === uLower);
      return idx >= 0 ? idx + 1 : null;
    },

    /** Отправить результат (мгновенно обновляет локально, фоном отправляет на Supabase) */
    async submit(gameId, username, score) {
      if (!username || !score || score <= 0) return false;

      // 1. Мгновенно обновляем локальный слепок
      const uLower = username.toLowerCase();
      let existing = db.find(r => r.game_id === gameId && r.username.toLowerCase() === uLower);
      if (existing) {
        if (score > existing.score) {
          existing.score = score;
        }
      } else {
        db.push({ game_id: gameId, username, score });
      }
      saveLocalDb(db);

      // 2. Фоном отправляем запрос на Supabase
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

        // Обновляем базу принудительно фоном после записи
        setTimeout(() => sync(true), 500);
        return true;
      } catch (e) {
        console.warn('⚠️ Background score submit warn:', e.message);
        return true; // Локально всё равно сохранилось
      }
    },
  };
})();

window.Leaderboard = Leaderboard;
