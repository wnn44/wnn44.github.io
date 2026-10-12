// stats.js — Система статистики и сохранений для КАНТ 3D
// Хранилище: localStorage

class StatsManager {
    constructor() {
        this.LOCAL_KEY = 'kant_stats_v2';

        // Дефолтная структура
        this._defaults = {
            gamesPlayed:  0,
            wins:         0,
            losses:       0,
            winStreak:    0,
            bestStreak:   0,
            fastestWin:   null, // число ходов, null если ещё нет победы
            totalMoves:   0,
            lastPlayed:   null,
        };

        this.data = this._load();
    }

    // ── Загрузка ─────────────────────────────────────────────────────────────

    _load() {
        try {
            const raw = localStorage.getItem(this.LOCAL_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return Object.assign({}, this._defaults, parsed);
            }
        } catch (e) {
            console.warn('[StatsManager] localStorage read error:', e);
        }
        return Object.assign({}, this._defaults);
    }

    // ── Сохранение ────────────────────────────────────────────────────────────

    _save() {
        try {
            localStorage.setItem(this.LOCAL_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('[StatsManager] localStorage write error:', e);
        }
    }

    // ── Запись результата ─────────────────────────────────────────────────────

    recordResult(winner, movesCount) {
        this.data.gamesPlayed += 1;
        this.data.totalMoves  += movesCount;
        this.data.lastPlayed   = new Date().toISOString();

        if (winner === 'white') {
            // Победа игрока
            this.data.wins += 1;
            this.data.winStreak += 1;
            if (this.data.winStreak > this.data.bestStreak) {
                this.data.bestStreak = this.data.winStreak;
            }
            // Быстрейшая победа
            if (this.data.fastestWin === null || movesCount < this.data.fastestWin) {
                this.data.fastestWin = movesCount;
            }
        } else {
            // Поражение
            this.data.losses   += 1;
            this.data.winStreak = 0; // обрываем серию
        }

        this._save();
    }

    // ── Сброс ─────────────────────────────────────────────────────────────────

    reset() {
        this.data = Object.assign({}, this._defaults);
        this._save();
    }

    // ── Геттеры ───────────────────────────────────────────────────────────────

    get gamesPlayed()  { return this.data.gamesPlayed; }
    get wins()         { return this.data.wins; }
    get losses()       { return this.data.losses; }
    get winRate()      { return this.data.gamesPlayed > 0 ? Math.round(this.data.wins / this.data.gamesPlayed * 100) : 0; }
    get winStreak()    { return this.data.winStreak; }
    get bestStreak()   { return this.data.bestStreak; }
    get fastestWin()   { return this.data.fastestWin; }
    get totalMoves()   { return this.data.totalMoves; }

    isEmpty() {
        return this.data.gamesPlayed === 0;
    }
}

// Глобальный экземпляр
window.stats = new StatsManager();
