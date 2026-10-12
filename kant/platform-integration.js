// platform-integration.js — связь игры КАНТ с платформой NEON ARCADE
// Счёт = (победы − поражения), хранится в Supabase через Leaderboard API.

(function () {
    'use strict';

    const GAME_ID = 'kant-3d';

    class PlatformIntegration {
        constructor() {
            this.player = null;
            this.remoteScore = 0;   // wins - losses с сервера
            this.synced = false;
        }

async init() {
    // 1) Определяем игрока
    this.player = (typeof Auth !== 'undefined' && Auth.get) ? Auth.get() : null;

    // 2) Имя в шапке
    const userChip = document.getElementById('userChip');
    if (userChip) {
        userChip.textContent = this.player ? `👤 ${this.player}` : 'ГОСТЬ';
    }

    // 3) 🏆 ЛИДЕРЫ
    document.getElementById('lbHeaderBtn')?.addEventListener('click', () => {
        if (window.LeaderboardUI && LeaderboardUI.open) LeaderboardUI.open(GAME_ID);
    });

    // 4) ◀ МЕНЮ
    document.getElementById('menuBtn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // 5) ⚙️ НАСТРОЙКИ — открывает игровое меню (бывшая кнопка #settings-toggle-btn)
    const configBtn = document.getElementById('config');
    const settingsPanel = document.getElementById('settings-panel');

    configBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel?.classList.toggle('open');
    });

    // Клик вне панели — закрываем
    document.addEventListener('click', (e) => {
        if (!settingsPanel || !settingsPanel.classList.contains('open')) return;
        if (settingsPanel.contains(e.target)) return;
        if (e.target.closest('#config')) return; // клик по самой кнопке обрабатывается выше
        settingsPanel.classList.remove('open');
    });

    // 6) Рекорды с сервера ДО первой партии
    await this.loadScore();

    // 7) Обновление лидерборда
    window.addEventListener('leaderboard-updated', () => this.loadScore());
}

        // Загрузка счёта игрока из Supabase (через локальный кэш Leaderboard)
        async loadScore() {
            if (!this.player || typeof Leaderboard === 'undefined') return;
            try {
                // getPlayerBest синхронный — берёт из локального кэша leaderboard.js,
                // который сам обновляется из Supabase при старте платформы.
                const best = Leaderboard.getPlayerBest(GAME_ID, this.player);
                this.remoteScore = Number.isFinite(best) ? best : 0;
                this.synced = true;
                console.log(`[KANT] Загружен счёт игрока ${this.player}: ${this.remoteScore}`);
            } catch (e) {
                console.warn('[KANT] Не удалось загрузить счёт:', e);
                this.remoteScore = 0;
            }
        }

        // Обновление счёта после партии: +1 за победу, -1 за поражение
        async recordResult(winner, movesCount) {
            // Локальная статистика ведётся всегда
            if (window.stats && window.stats.recordResult) {
                window.stats.recordResult(winner, movesCount);
            }

            if (!this.player) return null;
            if (typeof Leaderboard === 'undefined' || !Leaderboard.submit) return null;

            const delta = winner === 'white' ? +1 : -1;
            const newScore = this.remoteScore + delta;

            try {
                await Leaderboard.submit(GAME_ID, this.player, newScore);
                this.remoteScore = newScore;
                console.log(`[KANT] Счёт обновлён: ${newScore} (Δ${delta >= 0 ? '+' : ''}${delta})`);
                return newScore;
            } catch (e) {
                console.warn('[KANT] Ошибка отправки счёта:', e);
                return null;
            }
        }

        get currentScore() { return this.remoteScore; }
        get isGuest()      { return !this.player; }
    }

    window.PlatformIntegration = new PlatformIntegration();
})();