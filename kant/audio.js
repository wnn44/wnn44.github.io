class KantAudio {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Мастер-гейн: все звуки проходят через него
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        // Восстанавливаем громкость из localStorage (0..1)
        this._volume = parseFloat(localStorage.getItem('kant_volume') ?? '1');
        if (isNaN(this._volume)) this._volume = 1;
        this._volume = Math.max(0, Math.min(1, this._volume));
        this.masterGain.gain.setValueAtTime(this._volume, this.ctx.currentTime);

        // Хаос тональности: 0 = стандартно, 1 = максимальный разброс (±2 октавы)
        this._pitchChaos = parseFloat(localStorage.getItem('kant_pitch_chaos') ?? '0');
        if (isNaN(this._pitchChaos)) this._pitchChaos = 0;
        this._pitchChaos = Math.max(0, Math.min(1, this._pitchChaos));

        // При сворачивании вкладки глушим звук
        document.addEventListener('visibilitychange', () => {
            if (!this.ctx) return;
            if (document.hidden) {
                if (this.ctx.state === 'running') this.ctx.suspend();
            } else {
                if (this.ctx.state === 'suspended' && this._volume > 0) this.ctx.resume();
            }
        });
    }

    // Инициализация после первого клика пользователя
    init() {
        if (this.ctx.state === 'suspended' && this._volume > 0) {
            this.ctx.resume();
        }
    }

    // ── Громкость ──────────────────────────────────────────────────────────

    get volume() { return this._volume; }

    setVolume(v) {
        this._volume = Math.max(0, Math.min(1, v));
        this.masterGain.gain.setValueAtTime(this._volume, this.ctx.currentTime);
        localStorage.setItem('kant_volume', this._volume);

        if (this._volume === 0) {
            if (this.ctx.state === 'running') this.ctx.suspend();
        } else {
            if (this.ctx.state === 'suspended') this.ctx.resume();
        }
    }

    // Быстрый мьют/анмьют для мобильной кнопки
    get isMuted() { return this._volume === 0; }

    toggle() {
        if (this._volume > 0) {
            this._savedVolume = this._volume; // запоминаем
            this.setVolume(0);
            return true; // теперь замьючено
        } else {
            this.setVolume(this._savedVolume || 0.7);
            return false;
        }
    }

    // ── Хаос тональности ──────────────────────────────────────────────────

    get pitchChaos() { return this._pitchChaos; }

    setPitchChaos(v) {
        this._pitchChaos = Math.max(0, Math.min(1, v));
        localStorage.setItem('kant_pitch_chaos', this._pitchChaos);
    }

    // Применяем случайный сдвиг тона (если chaos > 0)
    _applyPitch(freq) {
        if (this._pitchChaos === 0) return freq;
        // Диапазон: ±2 октавы при chaos=1, ±0 при chaos=0
        // Делаем логарифмический разброс в полутонах: ±24 полутона * chaos
        const maxSemitones = 24 * this._pitchChaos;
        const semitones = (Math.random() * 2 - 1) * maxSemitones;
        return freq * Math.pow(2, semitones / 12);
    }

    // ── Звуки ─────────────────────────────────────────────────────────────

    _playTone(freq, type, duration, vol, ignoreChaos = false) {
        if (!this.ctx) return;
        const osc  = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;

        // Применяем хаос тональности
        const finalFreq = ignoreChaos ? freq : this._applyPitch(freq);
        osc.frequency.setValueAtTime(finalFreq, this.ctx.currentTime);

        // Плавная ADSR-огибающая
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playClick() {
        this._playTone(400, 'sine', 0.15, 0.05);
    }

    playRoll() {
        if (!this.ctx) return;
        const osc  = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const base = this._applyPitch(120);
        osc.frequency.setValueAtTime(base, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(base * 0.67, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playError() {
        if (!this.ctx) return;
        const osc  = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this._applyPitch(150), this.ctx.currentTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playWarning() {
        if (!this.ctx) return;
        this._playTone(600, 'square', 0.1, 0.05);
        setTimeout(() => { this._playTone(600, 'square', 0.1, 0.05); }, 150);
    }

    playWin() {
        if (!this.ctx) return;
        // Красивое торжественное мажорное арпеджио (C major 7)
        const seq = [
            { f: 261.63, d: 100 }, // C4
            { f: 329.63, d: 100 }, // E4
            { f: 392.00, d: 100 }, // G4
            { f: 440.00, d: 100 }, // A4
            { f: 523.25, d: 100 }, // C5
            { f: 659.25, d: 400 }  // E5
        ];
        
        let time = 0;
        seq.forEach(n => {
            setTimeout(() => {
                this._playTone(n.f, 'triangle', n.d / 1000 + 0.3, 0.4, true);
                this._playTone(n.f * 2, 'sine', n.d / 1000 + 0.3, 0.2, true);
            }, time);
            time += n.d;
        });

        // Мощный аккорд в конце
        setTimeout(() => {
            [261.63, 329.63, 392.00, 523.25].forEach(f => {
                this._playTone(f, 'square', 1.0, 0.1, true); 
                this._playTone(f, 'sine', 1.5, 0.2, true);
            });
        }, time - 400);
    }

    playLose() {
        if (!this.ctx) return;
        // Мягкое нисходящее минорное арпеджио (A minor)
        const seq = [
            { f: 440.00, d: 250 }, // A4
            { f: 329.63, d: 250 }, // E4
            { f: 261.63, d: 250 }, // C4
            { f: 220.00, d: 800 }  // A3
        ];
        
        let time = 0;
        seq.forEach(n => {
            setTimeout(() => {
                this._playTone(n.f, 'sine', n.d / 1000 + 0.5, 0.4, true);
                this._playTone(n.f, 'triangle', n.d / 1000 + 0.5, 0.2, true);
            }, time);
            time += n.d;
        });
    }
}

window.audio = new KantAudio();
