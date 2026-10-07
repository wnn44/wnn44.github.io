'use strict';

/**
 * Leaderboard — единый модуль для работы с таблицей рекордов (Supabase).
 * Подключается на всех страницах вместо дублированного кода.
 *
 * Зависимости: supabase-js SDK (подключить до этого скрипта).
 */
const Leaderboard = (() => {
  const SUPABASE_URL = 'https://ovoacfpdgupfdrdmomgp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_wt0MIOGgL0V_qbOCOudyJw_CiG19rO1';

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

  return {
    /** Топ игроков для игры. Возвращает [{username, score}, ...] */
    async getTop(gameId, limit = 50) {
      try {
        const { data, error } = await sb()
          .from('leaderboards')
          .select('username, score')
          .eq('game_id', gameId)
          .order('score', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.warn('⚠️ Leaderboard fetch error:', e);
        return [];
      }
    },

    /** Лучший результат игрока. Возвращает число. */
    async getPlayerBest(gameId, username) {
      if (!username) return 0;
      try {
        const { data, error } = await sb()
          .from('leaderboards')
          .select('score')
          .eq('game_id', gameId)
          .eq('username', username)
          .maybeSingle();
        if (error) throw error;
        return (data && typeof data.score === 'number') ? data.score : 0;
      } catch (e) {
        console.warn('⚠️ Player best fetch error:', e);
        return 0;
      }
    },

    /** Мировой рекорд. Возвращает {username, score}. */
    async getGlobalRecord(gameId) {
      try {
        const { data, error } = await sb()
          .from('leaderboards')
          .select('username, score')
          .eq('game_id', gameId)
          .order('score', { ascending: false })
          .limit(1);
        if (error) throw error;
        return data && data[0]
          ? { username: data[0].username, score: data[0].score }
          : { username: '—', score: 0 };
      } catch (e) {
        console.warn('⚠️ Global record fetch error:', e);
        return { username: '—', score: 0 };
      }
    },

    /** Отправить результат (upsert — обновляет если новый score выше). */
    async submit(gameId, username, score) {
      if (!username || !score || score <= 0) return false;
      try {
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
      } catch (e) {
        console.error('❌ Score submit error:', e);
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
