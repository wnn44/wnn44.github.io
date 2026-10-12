// i18n.js — Локализация для КАНТ 3D

const TRANSLATIONS = {
    ru: {
        title:           'КАНТ',
        pageTitle:       'КАНТ — 3D Стратегическая игра онлайн | Играть бесплатно',
        pageDesc:        'КАНТ — уникальная 3D стратегическая настольная игра с кубиками. Управляй ориентацией кубов, переворачивай их и выстраивай армию на линии противника. Играй бесплатно в браузере на ПК и телефоне!',
        turnWhite:       'Ход',
        turnBlack:       'Ход',
        playerWins:      'ПОБЕДА!',
        computerWins:    'КОМПЬЮТЕР ПОБЕДИЛ!',
        playAgain:       'ИГРАТЬ СНОВА',
        showRules:       'ПОКАЗАТЬ ПРАВИЛА',
        rulesTitle:      'ПРАВИЛА ИГРЫ',
        rulesClose:      'ПОНЯТНО',
        mobRules:        '📖 Правила',
        mobStats:        '🏆 Рекорды',
        mobMute:         '🔊',
        mobSettings:     '⚙️ Настройки',
        settingsTitle:   '⚙️ Настройки',
        themeLabel:      'Тема:',
        themePrefix:     'Тема',
        physics:         'Физика (3D Прыжки)',
        liveBg:          'Живой фон (Магия)',
        volume:          'Громкость',
        pitchChaos:      '🎲 Хаос тона',
        warningTitle:    'ВНИМАНИЕ!',
        warningText:     (n) => `Кружков противника на вашей линии: ${n}!<br>Вы ОБЯЗАНЫ защититься кратчайшим путем!`,
        aiPanel:         '[ СИСТЕМА АНАЛИЗА ИИ ]',
        aiThinking:      'Сбор данных о противнике...',
        statsTitle:      '🏆 МОИ РЕКОРДЫ',
        statsEmpty:      'Сыграй первую партию, чтобы увидеть статистику!',
        statsWins:       'Победы',
        statsLosses:     'Поражения',
        statsGames:      'Партий',
        statsStreak:     'Серия',
        statsBest:       'Рекорд серии',
        statsFastest:    'Быстрейшая победа',
        statsWinrate:    'Процент побед',
        statsReset:      '♻️ СБРОСИТЬ СТАТИСТИКУ',
        statsResetConfirm: 'Сбросить всю статистику? Это действие нельзя отменить.',
        statsClose:      'ЗАКРЫТЬ',
        confirmOk:       'СБРОСИТЬ',
        confirmCancel:   'ОТМЕНА',
        rulesGoal:       '<strong>Цель игры</strong> — первым выстроить свои кубики на исходной горизонтали противника. Причем ориентированы кубики должны быть кругами вверх, как и в исходном состоянии.',
        rulesLabel:      '<strong>Правила:</strong>',
        rule1:           'После того как один из игроков устанавливает на исходной горизонтали противника один свой кубик кругом вверх, противник обязан последующими ходами вывести с этой горизонтали все свои кубики быстрейшим по числу ходов способом.<br><br>В случае, если освободить горизонталь пока невозможно, игрок-противник выбирает ходы по своему усмотрению до тех пор, пока в ходе игры не появится такая возможность.',
        rule2:           'Если одному из игроков удается установить на исходной горизонтали противника два своих кубика кругами вверх, то противник ходит в соответствии с правилом 1 с той лишь разницей, что теперь он должен освободить и следующую за исходной горизонталь.',
        rule3:           'После того как игрок устанавливает на исходной горизонтали противника три кубика кругом вверх, противник обязан немедленно освободить последний, четвертый кубик своего партнера, если этот кубик находится в окружении.',
        rule4:           'Если все кубики одного из игроков блокированы кубиками противника так, что он не может сделать ни одного хода, то противнику засчитывается поражение.',
        openStats:       '🏆 РЕКОРДЫ',
    },
    en: {
title:           'КАНТ',
        pageTitle:       'KANT — 3D Strategic Online Board Game | Play Free',
        turnWhite:       'Move',
        turnBlack:       'Move',
        playerWins:      'YOU WIN!',
        computerWins:    'COMPUTER WINS!',
        playAgain:       'PLAY AGAIN',
        showRules:       'SHOW RULES',
        rulesTitle:      'RULES',
        rulesClose:      'GOT IT',
        mobRules:        '📖 Rules',
        mobStats:        '🏆 Records',
        mobMute:         '🔊',
        mobSettings:     '⚙️ Settings',
        settingsTitle:   '⚙️ Settings',
        themeLabel:      'Theme:',
        themePrefix:     'Theme',
        physics:         'Physics (3D Jumps)',
        liveBg:          'Animated Background',
        volume:          'Volume',
        pitchChaos:      '🎲 Pitch Chaos',
        warningTitle:    'WARNING!',
        warningText:     (n) => `Opponent has ${n} Circle(s) on your line!<br>You MUST defend by shortest path!`,
        aiPanel:         '[ AI ANALYSIS SYSTEM ]',
        aiThinking:      'Gathering intel on opponent...',
        statsTitle:      '🏆 MY RECORDS',
        statsEmpty:      'Play your first game to see stats!',
        statsWins:       'Wins',
        statsLosses:     'Losses',
        statsGames:      'Games',
        statsStreak:     'Streak',
        statsBest:       'Best Streak',
        statsFastest:    'Fastest Win',
        statsWinrate:    'Win Rate',
        statsReset:      '♻️ RESET STATS',
        statsResetConfirm: 'Reset all stats? This cannot be undone.',
        statsClose:      'CLOSE',
        confirmOk:       'RESET',
        confirmCancel:   'CANCEL',
        rulesGoal:       '<strong>Goal</strong> — Be the first to line up your cubes on the opponent\'s home row. Cubes must be oriented with circles facing up, just like in the starting position.',
        rulesLabel:      '<strong>Rules:</strong>',
        rule1:           'Once a player places one cube with the circle facing up on the opponent\'s home row, the opponent must use subsequent moves to remove all their cubes from that row by the shortest route.<br><br>If clearing the row is temporarily impossible, the opponent plays freely until it becomes possible.',
        rule2:           'If a player places two cubes with circles up on the opponent\'s home row, the opponent must also clear the next row behind it.',
        rule3:           'When a player places three cubes with circles up on the opponent\'s home row, the opponent must immediately free the fourth cube if it is surrounded.',
        rule4:           'If all of a player\'s cubes are blocked so they cannot make any move, the opponent loses.',
        openStats:       '🏆 RECORDS',
    },
    tr: {
title:           'КАНТ',
        pageTitle:       'KANT — 3D Strateji Online Masa Oyunu | Ücretsiz Oyna',
        turnWhite:       'Hamle',
        turnBlack:       'Hamle',
        playerWins:      'KAZANDIN!',
        computerWins:    'BİLGİSAYAR KAZANDI!',
        playAgain:       'TEKRAR OYNA',
        showRules:       'KURALLARI GÖSTER',
        rulesTitle:      'OYUN KURALLARI',
        rulesClose:      'TAMAM',
        mobRules:        '📖 Kurallar',
        mobStats:        '🏆 Rekorlar',
        mobMute:         '🔊',
        mobSettings:     '⚙️ Ayarlar',
        settingsTitle:   '⚙️ Ayarlar',
        themeLabel:      'Tema:',
        themePrefix:     'Tema',
        physics:         'Fizik (3D Zıplama)',
        liveBg:          'Canlı Arka Plan',
        volume:          'Ses',
        pitchChaos:      '🎲 Ton Kaos',
        warningTitle:    'DİKKAT!',
        warningText:     (n) => `Hattınızda ${n} rakip dairesi var!<br>En kısa yoldan savunun!`,
        aiPanel:         '[ YAPAY ZEKA SİSTEMİ ]',
        aiThinking:      'Rakip analiz ediliyor...',
        statsTitle:      '🏆 REKORLARIM',
        statsEmpty:      'İstatistikleri görmek için ilk oyununuzu oynayın!',
        statsWins:       'Galibiyet',
        statsLosses:     'Mağlubiyet',
        statsGames:      'Oyun',
        statsStreak:     'Seri',
        statsBest:       'En İyi Seri',
        statsFastest:    'En Hızlı Galibiyet',
        statsWinrate:    'Kazanma Oranı',
        statsReset:      '♻️ İSTATİSTİKLERİ SIFIRLA',
        statsResetConfirm: 'Tüm istatistikler silinsin mi? Bu işlem geri alınamaz.',
        statsClose:      'KAPAT',
        confirmOk:       'SIFIRLA',
        confirmCancel:   'VAZGEÇ',
        rulesGoal:       '<strong>Amaç</strong> — Küplerinizi rakibin başlangıç sırasına daireler yukarı bakacak şekilde ilk dizen olmak.',
        rulesLabel:      '<strong>Kurallar:</strong>',
        rule1:           'Bir oyuncu rakibin başlangıç sırasına dairesi yukarı bakan bir küp yerleştirdiğinde, rakip sonraki hamlelerinde tüm küplerini en kısa yoldan bu sıradan çıkarmak zorundadır.<br><br>Sırayı boşaltmak geçici olarak mümkün değilse, rakip mümkün olana kadar serbestçe oynar.',
        rule2:           'Bir oyuncu rakibin başlangıç sırasına daireleri yukarı bakan iki küp yerleştirirse, rakip arkasındaki sırayı da boşaltmak zorundadır.',
        rule3:           'Bir oyuncu rakibin başlangıç sırasına daireleri yukarı bakan üç küp yerleştirdiğinde, rakip çevrilmişse dördüncü küpü derhal serbest bırakmak zorundadır.',
        rule4:           'Bir oyuncunun tüm küpleri rakibin küpleri tarafından bloke edilirse ve hiçbir hamle yapamıyorsa, rakip kaybeder.',
        openStats:       '🏆 REKORLAR',
    },
    de: {
title:           'КАНТ',
        pageTitle:       'KANT — 3D Strategiespiel online | Kostenlos spielen',
        turnWhite:       'Zug',
        turnBlack:       'Zug',
        playerWins:      'SIEG!',
        computerWins:    'COMPUTER GEWINNT!',
        playAgain:       'NOCHMAL SPIELEN',
        showRules:       'REGELN ZEIGEN',
        rulesTitle:      'SPIELREGELN',
        rulesClose:      'VERSTANDEN',
        mobRules:        '📖 Regeln',
        mobStats:        '🏆 Rekorde',
        mobMute:         '🔊',
        mobSettings:     '⚙️ Einstellungen',
        settingsTitle:   '⚙️ Einstellungen',
        themeLabel:      'Thema:',
        themePrefix:     'Thema',
        physics:         'Physik (3D Sprünge)',
        liveBg:          'Lebendiger Hintergrund',
        volume:          'Lautstärke',
        pitchChaos:      '🎲 Tonhöhe-Chaos',
        warningTitle:    'ACHTUNG!',
        warningText:     (n) => `Gegner hat ${n} Kreis(e) auf deiner Linie!<br>Du MUSST dich auf kürzestem Weg verteidigen!`,
        aiPanel:         '[ KI-ANALYSESYSTEM ]',
        aiThinking:      'Gegner wird analysiert...',
        statsTitle:      '🏆 MEINE REKORDE',
        statsEmpty:      'Spiele dein erstes Spiel, um Statistiken zu sehen!',
        statsWins:       'Siege',
        statsLosses:     'Niederlagen',
        statsGames:      'Spiele',
        statsStreak:     'Serie',
        statsBest:       'Beste Serie',
        statsFastest:    'Schnellster Sieg',
        statsWinrate:    'Gewinnrate',
        statsReset:      '♻️ STATISTIK ZURÜCKSETZEN',
        statsResetConfirm: 'Alle Statistiken löschen? Dies kann nicht rückgängig gemacht werden.',
        statsClose:      'SCHLIEßEN',
        confirmOk:       'ZURÜCKSETZEN',
        confirmCancel:   'ABBRECHEN',
        rulesGoal:       '<strong>Ziel</strong> — Stelle als Erster deine Würfel auf der Grundlinie des Gegners auf. Die Würfel müssen mit den Kreisen nach oben zeigen, wie in der Ausgangsstellung.',
        rulesLabel:      '<strong>Regeln:</strong>',
        rule1:           'Sobald ein Spieler einen Würfel mit dem Kreis nach oben auf der Grundlinie des Gegners platziert, muss der Gegner in den folgenden Zügen alle seine Würfel auf dem kürzesten Weg von dieser Linie entfernen.<br><br>Falls das Räumen vorübergehend unmöglich ist, spielt der Gegner frei, bis es möglich wird.',
        rule2:           'Platziert ein Spieler zwei Würfel mit Kreisen nach oben auf der Grundlinie des Gegners, muss der Gegner auch die nächste Reihe dahinter räumen.',
        rule3:           'Wenn ein Spieler drei Würfel mit Kreisen nach oben auf der Grundlinie des Gegners platziert, muss der Gegner den vierten Würfel sofort befreien, falls er umzingelt ist.',
        rule4:           'Wenn alle Würfel eines Spielers blockiert sind und er keinen Zug machen kann, verliert der Gegner.',
        openStats:       '🏆 REKORDE',
    },
};

const FALLBACK_LANG = 'ru';

function getLang(preferredLang) {
    const raw = preferredLang || (typeof localStorage !== 'undefined' && localStorage.getItem('kant_lang')) || (typeof navigator !== 'undefined' ? navigator.language : null) || FALLBACK_LANG;
    const code = raw.toLowerCase().split('-')[0];
    return TRANSLATIONS[code] ? code : FALLBACK_LANG;
}

// Названия тем по языкам
const THEME_NAMES = {
    ru: {
        classic: 'Классическое стекло', neon: 'Киберпанк неон', wood: 'Дерево и сланец',
        hologram: 'Голограмма', candy: 'Матовые конфеты', luxury: 'Золото и сапфир',
        retro: 'Ретро 8-бит', acid: 'Кислотный трип', gothic: 'Кровь и кость',
        steampunk: 'Стимпанк', synthwave: 'Синтвейв', elements: 'Лёд и пламя',
        void: 'Контрастная пустота', toxic: 'Токсичная зона', phantom: 'Призрак',
    },
    en: {
        classic: 'Classic Glass', neon: 'Cyberpunk Neon', wood: 'Wood & Slate',
        hologram: 'Sci-Fi Hologram', candy: 'Matte Candy', luxury: 'Gold & Sapphire',
        retro: 'Retro 8-bit', acid: 'Acid Trip', gothic: 'Blood & Bone',
        steampunk: 'Steampunk', synthwave: 'Synthwave', elements: 'Ice & Fire',
        void: 'High Contrast Void', toxic: 'Toxic Biohazard', phantom: 'Ghost / Phantom',
    },
    tr: {
        classic: 'Klasik Cam', neon: 'Siberpunk Neon', wood: 'Ahşap ve Kayrak',
        hologram: 'Hologram', candy: 'Mat Şeker', luxury: 'Altın ve Safir',
        retro: 'Retro 8-bit', acid: 'Asit Yolculuğu', gothic: 'Kan ve Kemik',
        steampunk: 'Steampunk', synthwave: 'Synthwave', elements: 'Buz ve Ateş',
        void: 'Yüksek Kontrast', toxic: 'Toksik Bölge', phantom: 'Hayalet',
    },
    de: {
        classic: 'Klassisches Glas', neon: 'Cyberpunk Neon', wood: 'Holz und Schiefer',
        hologram: 'Hologramm', candy: 'Matte Bonbons', luxury: 'Gold und Saphir',
        retro: 'Retro 8-Bit', acid: 'Säure-Trip', gothic: 'Blut und Knochen',
        steampunk: 'Steampunk', synthwave: 'Synthwave', elements: 'Eis und Feuer',
        void: 'Hoher Kontrast', toxic: 'Toxische Zone', phantom: 'Phantom',
    },
};

function applyLocale(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS[FALLBACK_LANG];
    window._t = t;
    document.documentElement.lang = lang;

    const set = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
    const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    // === Заголовок ===
    const h1 = document.querySelector('#ui h1');
    if (h1) {
        h1.innerText = t.title;
    }

    // === Заголовок вкладки и SEO-мета (п.8.2.3) ===
    if (t.pageTitle) document.title = t.pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t.pageDesc) metaDesc.setAttribute('content', t.pageDesc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && t.pageTitle) ogTitle.setAttribute('content', t.pageTitle);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle && t.pageTitle) twTitle.setAttribute('content', t.pageTitle);

    // === Подсказки кнопок верхней панели ===
    const btnTitles = {
        'open-rules-btn':      t.showRules,
        'open-stats-btn':      t.openStats,
        'mute-btn':            t.volume,
        'settings-toggle-btn': t.settingsTitle,
    };
    for (const id in btnTitles) {
        const btn = document.getElementById(id);
        if (btn) btn.title = btnTitles[id];
    }

    // === Верхняя панель (top-bar) ===
    set('turn-text',       t.turnWhite);
    set('ai-thoughts',     t.aiThinking);

    // Панель AI
    const aiPanelTitle = document.querySelector('#ai-tracker-panel > div');
    if (aiPanelTitle) aiPanelTitle.innerText = t.aiPanel;

    // Лейблы настроек (desktop)
    const physLabel = document.querySelector('#physics-toggle')?.closest('label');
    if (physLabel) { physLabel.innerHTML = `<input type="checkbox" id="physics-toggle" checked style="margin-right: 5px; cursor: pointer;"> ${t.physics}`; }
    const bgLabel = document.querySelector('#bg-toggle')?.closest('label');
    if (bgLabel) { bgLabel.innerHTML = `<input type="checkbox" id="bg-toggle" style="margin-right: 5px; cursor: pointer;"> ${t.liveBg}`; }

    // Громкость и хаос (desktop)
    const volLabel = document.querySelector('#volume-slider')?.closest('.audio-slider-row')?.querySelector('span:nth-child(2)');
    if (volLabel) volLabel.innerText = t.volume;
    const pitchLabel = document.querySelector('#pitch-slider')?.closest('.audio-slider-row')?.querySelector('span:first-child');
    if (pitchLabel) pitchLabel.innerText = t.pitchChaos;

    // === Темы (dropdown) — переведённые названия ===
    const themeNames = THEME_NAMES[lang] || THEME_NAMES['en'];
    document.querySelectorAll('#theme-selector option, #mob-theme-selector option').forEach(opt => {
        const name = themeNames[opt.value];
        if (name) opt.innerText = name;
    });

    // === Мобильный бар ===
    set('mob-rules-btn',    t.mobRules);
    set('mob-stats-btn',    t.mobStats);
    set('mob-settings-btn', t.mobSettings);

    // === Мобильный drawer ===
    const drawerTitle = document.querySelector('#mobile-drawer-content > div > span');
    if (drawerTitle) drawerTitle.innerText = t.settingsTitle;
    const mobThemeLabel = document.querySelector('#mobile-drawer-content > label');
    if (mobThemeLabel) mobThemeLabel.innerText = t.themeLabel;

    // Лейблы чекбоксов в drawer
    const mobPhysLabel = document.querySelector('#mob-physics-toggle')?.closest('label');
    if (mobPhysLabel) { mobPhysLabel.innerHTML = `<input type="checkbox" id="mob-physics-toggle" checked style="width:18px;height:18px;cursor:pointer;"> ${t.physics}`; }
    const mobBgLabel = document.querySelector('#mob-bg-toggle')?.closest('label');
    if (mobBgLabel) { mobBgLabel.innerHTML = `<input type="checkbox" id="mob-bg-toggle" style="width:18px;height:18px;cursor:pointer;"> ${t.liveBg}`; }

    // Громкость и хаос (drawer)
    const mobVolLabel = document.querySelector('#mob-volume-slider')?.closest('.audio-slider-row')?.querySelector('span:nth-child(2)');
    if (mobVolLabel) mobVolLabel.innerText = t.volume;
    const mobPitchLabel = document.querySelector('#mob-pitch-slider')?.closest('.audio-slider-row')?.querySelector('span:first-child');
    if (mobPitchLabel) mobPitchLabel.innerText = t.pitchChaos;

    // === Правила (Modal) ===
    const rulesH2 = document.querySelector('#rules-modal h2');
    if (rulesH2) rulesH2.innerText = t.rulesTitle;
    set('close-rules', t.rulesClose);

    const rulesText = document.querySelector('#rules-modal .rules-text');
    if (rulesText) {
        rulesText.innerHTML = `
            <p>${t.rulesGoal}</p>
            <div style="margin-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">${t.rulesLabel}</div>
            <ol>
                <li>${t.rule1}</li>
                <li>${t.rule2}</li>
                <li>${t.rule3}</li>
                <li>${t.rule4}</li>
            </ol>`;
    }

    // === Статистика (Modal) ===
    const statsH2 = document.querySelector('#stats-modal h2');
    if (statsH2) statsH2.innerText = t.statsTitle;
    set('close-stats',     t.statsClose);
    set('reset-stats-btn', t.statsReset);

    const winrateLabel = document.querySelector('.winrate-bar-label span:first-child');
    if (winrateLabel) winrateLabel.innerText = t.statsWinrate;

    // === Подтверждение сброса статистики ===
    set('confirm-title',  t.statsReset);
    set('confirm-text',   t.statsResetConfirm);
    set('confirm-ok',     t.confirmOk);
    set('confirm-cancel', t.confirmCancel);

    // === Кнопка "Играть снова" ===
    const playAgainBtn = document.querySelector('#game-over button');
    if (playAgainBtn) playAgainBtn.innerText = t.playAgain;

    console.log(`[i18n] Language applied: ${lang}`);
}
