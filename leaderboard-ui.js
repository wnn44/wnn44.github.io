'use strict';

/**
 * LeaderboardUI — UI-компонент модалки таблицы лидеров.
 * Создаёт модалку динамически при первом вызове open().
 *
 * Зависимости: Auth, Leaderboard, common.css (стили .lb-modal-*)
 */
const LeaderboardUI = (() => {
  let modal = null;
  let currentGameId = null;

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function createModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'lb-modal hidden';
    modal.innerHTML = `
      <div class="lb-modal-box">
        <div class="lb-modal-title">🏆 ТАБЛИЦА ЛИДЕРОВ</div>
        <button class="lb-modal-refresh">🔄 ОБНОВИТЬ</button>
        <div class="lb-modal-list"></div>
        <div style="margin-top:20px">
          <button class="lb-modal-close">ЗАКРЫТЬ</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.lb-modal-close').addEventListener('click', close);
    modal.querySelector('.lb-modal-refresh').addEventListener('click', () => {
      if (currentGameId) open(currentGameId);
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  }

  async function open(gameId) {
    createModal();
    currentGameId = gameId;
    modal.classList.remove('hidden');

    const list = modal.querySelector('.lb-modal-list');
    list.innerHTML = '<div class="lb-modal-loading">⏳ Загрузка таблицы...</div>';

    try {
      const data = await Leaderboard.getTop(gameId, 50);

      if (!data || data.length === 0) {
        list.innerHTML = '<div class="lb-modal-empty">Пока нет рекордов. Сыграйте первую игру!</div>';
        return;
      }

      const player = Auth.get();
      list.innerHTML = data.map((entry, i) => {
        const isMe = player && entry.username.toLowerCase() === player.toLowerCase();
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
        return `<div class="lb-row${isMe ? ' me' : ''}">
          <div class="lb-rank">${medal}</div>
          <div class="lb-name">${escapeHtml(entry.username)}${isMe ? ' (вы)' : ''}</div>
          <div class="lb-score">${Number(entry.score).toLocaleString()}</div>
        </div>`;
      }).join('');
    } catch (err) {
      console.error('❌ Leaderboard UI error:', err);
      list.innerHTML = '<div class="lb-modal-empty">Ошибка загрузки данных.</div>';
    }
  }

  function close() {
    if (modal) modal.classList.add('hidden');
    currentGameId = null;
  }

  return { open, close };
})();

window.LeaderboardUI = LeaderboardUI;
