// platform-integration.js — связь игры КАНТ с платформой NEON ARCADE
// Счёт = (победы − поражения), хранится в Supabase через Leaderboard API.

(function () {
    'use strict';

    const GAME_ID = 'kant-3d';

    class PlatformIntegration {
        constructor() {
            this.player = null;
            this.remoteScore = 0;
            this.synced = false;
            this._wired = false;
        }

        async init() {
            if (this._wired) return;      // защита от двойного вызова
            this._wired = true;

            const $ = (id) => document.getElementById(id);

            // 1) Игрок платформы
            try {
                this.player = (typeof Auth !== 'undefined' && typeof Auth.get === 'function')
                    ? Auth.get()
                    : null;
            } catch (e) {
                console.warn('[KANT] Auth.get() недоступен:', e);
                this.player = null;
            }

            // 2) Имя в шапке
            const userChip = $('userChip');
            if (userChip) {
                userChip.textContent = this.player ? `👤 ${this.player}` : 'ГОСТЬ';
            }

            // 3) 🏆 ЛИДЕРЫ
            const lbBtn = $('lbHeaderBtn');
            if (lbBtn) {
                lbBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                        if (window.LeaderboardUI && typeof window.LeaderboardUI.open === 'function') {
                            window.LeaderboardUI.open(GAME_ID);
                        } else {
                            console.warn('[KANT] LeaderboardUI недоступен');
                        }
                    } catch (err) {
                        console.error('[KANT] Ошибка LeaderboardUI.open:', err);
                    }
                });
            }

            // 4) ◀ МЕНЮ
            const menuBtn = $('menuBtn');
            if (menuBtn) {
                menuBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = '../index.html';
                });
            }

            // 5) ⚙️ НАСТРОЙКИ — popup на десктопе, drawer на мобиле
            const configBtn = $('config');
            const settingsPanel = $('settings-panel');

            if (configBtn) {
                configBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isMobile = window.innerWidth <= 768;
                    if (isMobile && typeof window.openMobileDrawer === 'function') {
                        window.openMobileDrawer();
                    } else if (settingsPanel) {
                        settingsPanel.classList.toggle('open');
                    }
                });

                // не даём событиям клика «утечь» на canvas-сцену
                configBtn.addEventListener('mousedown',  e => e.stopPropagation());
                configBtn.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
            }

            // Закрытие по клику вне панели
            document.addEventListener('click', (e) => {
                if (!settingsPanel || !settingsPanel.classList.contains('open')) return;
                if (settingsPanel.contains(e.target)) return;
                if (e.target.closest('#config')) return;
                settingsPanel.classList.remove('open');
            });

            // 6) Рекорды с сервера до первой партии
            await this.loadScore();

            // 7) Подписка на обновления лидерборда
            window.addEventListener('leaderboard-updated', () => this.loadScore());

            console.log('[KANT] PlatformIntegration готов. Игрок:', this.player || 'гость');
        }

        async loadScore() {
            if (!this.player) return;
            if (typeof Leaderboard === 'undefined' || typeof Leaderboard.getPlayerBest !== 'function') {
                console.warn('[KANT] Leaderboard.getPlayerBest недоступен');
                return;
            }
            try {
                const best = Leaderboard.getPlayerBest(GAME_ID, this.player);
                this.remoteScore = Number.isFinite(best) ? best : 0;
                this.synced = true;
                console.log(`[KANT] Счёт игрока ${this.player}: ${this.remoteScore}`);
            } catch (e) {
                console.warn('[KANT] Не удалось загрузить счёт:', e);
                this.remoteScore = 0;
            }
        }

        async recordResult(winner, movesCount) {
            if (window.stats && typeof window.stats.recordResult === 'function') {
                window.stats.recordResult(winner, movesCount);
            }

            if (!this.player) return null;
            if (typeof Leaderboard === 'undefined' || typeof Leaderboard.submit !== 'function') {
                return null;
            }

            const delta = winner === 'white' ? +1 : -1;
            const newScore = this.remoteScore + delta;

            try {
                await Leaderboard.submit(GAME_ID, this.player, newScore);
                this.remoteScore = newScore;
                console.log(`[KANT] Счёт обновлён: ${newScore} (${delta >= 0 ? '+' : ''}${delta})`);
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