class Main {
    constructor() {
        this.game = new Game();
        this.game.init();
        this.selectedIdx = null;
        this.cubeDOMMap = {}; // index -> HTMLELement
        this.cubeMeshMatrixMap = {}; // index -> DOMMatrix
        
        // Adaptive zoom based on screen size
        this.calcZoomLimits();
        this.currentZoom = parseFloat(localStorage.getItem('kant_zoom')) || this.baseZoom;
        this.currentZoom = Math.max(this.minZoom, Math.min(this.currentZoom, this.maxZoom));
        this.rotX = parseFloat(localStorage.getItem('kant_rotX')) || 0;
        this.rotZ = parseFloat(localStorage.getItem('kant_rotZ')) || 0;
        this.rotX = Math.max(-60, Math.min(this.rotX, 60)); // clamp saved rotation
        
        this.boardContainer = document.getElementById('grid');
        this.statusText = document.getElementById('turn-text');
        this.warningText = document.getElementById('warning');
        this.movesCount = 0; // Счётчик ходов за партию
        this.aiThinking = false; // Guard: prevents double AI scheduling
        
        this.renderBoard();
        this.bindEvents();
        this.updateStatus();
        this.clearSelection();
    }

    // Calculate zoom limits from screen size
    calcZoomLimits() {
        const topBarH = 50;
        const mobileBarH = window.innerWidth <= 768 ? 60 : 0;
        const availH = window.innerHeight - topBarH - mobileBarH - 40; // 40px padding
        const availW = window.innerWidth - 40;
        const boardSize = 320;
        const fitScale = Math.min(availH, availW) / boardSize;
        this.baseZoom = Math.max(0.5, Math.min(fitScale * 0.85, 3.0));
        this.minZoom = this.baseZoom * 0.6;
        this.maxZoom = this.baseZoom * 1.4;
    }

    renderBoard() {
        this.boardContainer.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.idx = i;
            this.boardContainer.appendChild(cell);
        }

        for (let i = 0; i < 16; i++) {
            const logic = this.game.board[i];
            if (logic) {
                const wrapper = document.createElement('div');
                wrapper.className = `cube-wrapper ${logic.owner}`;
                
                const pivot = document.createElement('div');
                pivot.className = 'cube-pivot';
                
                const mesh = document.createElement('div');
                mesh.className = 'cube-mesh';
                ['top', 'bottom', 'front', 'back', 'left', 'right'].forEach(f => {
                    const face = document.createElement('div');
                    face.className = `face ${f}`;
                    mesh.appendChild(face);
                });
                
                pivot.appendChild(mesh);
                wrapper.appendChild(pivot);

                this.boardContainer.appendChild(wrapper);
                
                // Track internally
                this.cubeDOMMap[i] = wrapper;
                this.cubeMeshMatrixMap[i] = new DOMMatrix();
                
                this.updateCubePosition(i);
            }
        }
    }

    updateCubePosition(idx) {
        const dom = this.cubeDOMMap[idx];
        if (!dom) return;
        const r = Math.floor(idx / 4);
        const c = idx % 4;
        // Base translation managed by the 'translate' CSS property to free up 'transform' for jump animations
        dom.style.translate = `${c * 80 + 10}px ${r * 80 + 10}px 30px`;
    }

    bindEvents() {
        window.addEventListener('click', () => window.audio.init(), { once: true });
        
        // Theme selector logic
        const themeSelect = document.getElementById('theme-selector');
        if (themeSelect) {
            const savedTheme = localStorage.getItem('kant_theme');
            if (savedTheme) themeSelect.value = savedTheme;
            document.body.dataset.theme = themeSelect.value;
            
            themeSelect.addEventListener('change', (e) => {
                document.body.dataset.theme = e.target.value;
                localStorage.setItem('kant_theme', e.target.value);
            });
        }

        // Live Background toggle logic
        const bgToggle = document.getElementById('bg-toggle');
        if (bgToggle) {
            const savedBg = localStorage.getItem('kant_bg');
            if (savedBg !== null) bgToggle.checked = (savedBg === 'true');
            
            bgToggle.addEventListener('change', (e) => {
                if (e.target.checked) document.body.classList.add('animated-bg');
                else document.body.classList.remove('animated-bg');
                localStorage.setItem('kant_bg', e.target.checked);
            });
            if (bgToggle.checked) document.body.classList.add('animated-bg');
        }

        // Physics toggle save logic
        const physToggle = document.getElementById('physics-toggle');
        if (physToggle) {
            const savedPhys = localStorage.getItem('kant_physics');
            if (savedPhys !== null) physToggle.checked = (savedPhys === 'true');
            physToggle.addEventListener('change', (e) => {
                localStorage.setItem('kant_physics', e.target.checked);
            });
        }

        // Rules Modal logic
        const openRulesBtn = document.getElementById('open-rules-btn');
        const closeRulesBtn = document.getElementById('close-rules');
        const rulesModal = document.getElementById('rules-modal');
        
        if (openRulesBtn && rulesModal) {
            openRulesBtn.addEventListener('click', () => {
                rulesModal.style.display = 'flex';
                void rulesModal.offsetWidth; // trigger reflow
                rulesModal.classList.add('show');
            });
        }
        if (closeRulesBtn && rulesModal) {
            closeRulesBtn.addEventListener('click', () => {
                rulesModal.classList.remove('show');
                setTimeout(() => rulesModal.style.display = 'none', 300);
            });
        }

        // Scale on zoom-wrapper, rotation on board-container (preserve-3d)
        const scene = document.getElementById('scene');
        const zoomWrapper = document.getElementById('zoom-wrapper');
        const boardOuter = document.getElementById('board-container');
        zoomWrapper.style.transform = `scale(${this.currentZoom})`;
        boardOuter.style.transform = `rotateX(${this.rotX}deg) rotateZ(${this.rotZ}deg)`;
        
		window.addEventListener('wheel', (e) => {
			if (e.target.closest('header') ||               // <-- ДОБАВЬ ЭТО
				e.target.closest('#game-over') ||
				e.target.closest('#settings-panel')) return;
            if (e.deltaY < 0) {
                this.currentZoom *= 1.08;
            } else {
                this.currentZoom /= 1.08;
            }
            this.currentZoom = Math.max(this.minZoom, Math.min(this.currentZoom, this.maxZoom));
            zoomWrapper.style.transform = `scale(${this.currentZoom})`;
            localStorage.setItem('kant_zoom', this.currentZoom);
        });

        // Recalculate zoom limits on resize
        window.addEventListener('resize', () => {
            this.calcZoomLimits();
            this.currentZoom = Math.max(this.minZoom, Math.min(this.currentZoom, this.maxZoom));
            zoomWrapper.style.transform = `scale(${this.currentZoom})`;
        });

        // 3D Scene Drag & Touch Rotation + Pinch Zoom
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        let initialPinchDist = null;
        let initialZoom = this.currentZoom;
        this.dragDist = 0;

        let startInteractionX = 0;
        let startInteractionY = 0;
        this.isTrueDrag = false;




		const startInteraction = (x, y, e) => {
			if (e.target.closest('header') ||              // <-- ДОБАВЬ ЭТО
				e.target.closest('#game-over') ||
				e.target.closest('#settings-panel') ||
				e.target.closest('#mobile-drawer') ||
				e.target.closest('.modal-overlay')) return;
            this.isTrueDrag = false; // reset
            startInteractionX = x;
            startInteractionY = y;
            
            // Absolutely CRITICAL: 
            // Prevent default on touchstart universally stops the browser from trying
            // to be smart with scrolling or generating delayed native clicks.
            // This is the #1 reason mobile browsers "drop" clicks!
            if (e.cancelable) e.preventDefault(); 
            
            isDragging = true;
            lastX = x;
            lastY = y;
            if (e.type !== 'touchstart') document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        };

        const moveInteraction = (x, y) => {
            if (!isDragging) return;
            if (Math.hypot(x - startInteractionX, y - startInteractionY) > 10) {
                this.isTrueDrag = true;
            }
            const dx = x - lastX;
            const dy = y - lastY;
            this.rotZ += dx * 0.5;
            this.rotX -= dy * 0.5;
            this.rotX = Math.max(-60, Math.min(this.rotX, 60)); // clamped ±60°
            boardOuter.style.transform = `rotateX(${this.rotX}deg) rotateZ(${this.rotZ}deg)`;
            localStorage.setItem('kant_rotX', this.rotX);
            localStorage.setItem('kant_rotZ', this.rotZ);
            lastX = x;
            lastY = y;
        };

        const stopDrag = (e) => { 
            // If dragging stopped and it wasn't a true drag, it's a synthetic CLICK!
            if (e && !this.isTrueDrag && isDragging) {
                let hitX = startInteractionX;
                let hitY = startInteractionY;
                if (e.type.includes('touch') && e.changedTouches && e.changedTouches.length > 0) {
                    hitX = e.changedTouches[0].clientX;
                    hitY = e.changedTouches[0].clientY;
                } else if (e.clientX !== undefined) {
                    hitX = e.clientX;
                    hitY = e.clientY;
                }
                this.executeClick(hitX, hitY);
            }
            isDragging = false; 
            initialPinchDist = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        // Mouse Events
        window.addEventListener('mousedown', (e) => startInteraction(e.clientX, e.clientY, e), { passive: false });
        window.addEventListener('mousemove', (e) => moveInteraction(e.clientX, e.clientY));
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('mouseleave', stopDrag);

        // Touch Events
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startInteraction(e.touches[0].clientX, e.touches[0].clientY, e);
            } else if (e.touches.length === 2) {
                isDragging = false; // Stop rotating on pinch
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                initialPinchDist = Math.sqrt(dx*dx + dy*dy);
                initialZoom = this.currentZoom;
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && isDragging) {
                // Prevent scrolling only when actually trying to rotate a lot
                if (e.cancelable && this.isTrueDrag) e.preventDefault();
                moveInteraction(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2 && initialPinchDist) {
                if (e.cancelable) e.preventDefault(); // Stop native zoom
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const scale = dist / initialPinchDist;
                
                this.currentZoom = Math.max(this.minZoom, Math.min(initialZoom * scale, this.maxZoom));
                zoomWrapper.style.transform = `scale(${this.currentZoom})`;
                localStorage.setItem('kant_zoom', this.currentZoom);
            }
        }, { passive: false });
        
        window.addEventListener('touchend', stopDrag);
        window.addEventListener('touchcancel', stopDrag);

        // Double click/tap anywhere empty to snap perfectly flat
			const resetRotation = (e) => {
				if (e.target.closest('.cube-wrapper') ||
					e.target.closest('header') ||               // <-- ДОБАВЬ ЭТО (вместо #ui)
					e.target.closest('#game-over')) return;
            this.rotX = 0;
            this.rotZ = 0;
            const bc = document.getElementById('board-container');
            bc.style.transition = 'transform 0.4s ease';
            bc.style.transform = `rotateX(0deg) rotateZ(0deg)`;
            localStorage.setItem('kant_rotX', 0);
            localStorage.setItem('kant_rotZ', 0);
            setTimeout(() => bc.style.transition = 'none', 450);
        };
        window.addEventListener('dblclick', resetRotation);
        
        // Synthetic click is handled in stopDrag now!
    }

    executeClick(clientX, clientY) {
        if (this.game.isGameOver) return;
        if (this.game.turn !== 'white') return;
        if (this.aiThinking) return; // AI is still processing

        // Используем elementsFromPoint: лучевой тест через все слои!
        const hitElements = document.elementsFromPoint(clientX, clientY);

        // 1. Приоритет: Голограмма хода (Ghost Cube) 
        for (let el of hitElements) {
            const ghost = el.closest('.ghost-cube');
            if (ghost) {
                this.executeMove(this.selectedIdx, parseInt(ghost.dataset.toIdx));
                return;
            }
        }

        // 2. Вторичный приоритет: Выбор другого белого куба
        for (let el of hitElements) {
            const wrapper = el.closest('.cube-wrapper');
            if (wrapper && wrapper.classList.contains('white')) {
                let clickIdx = -1;
                for (let i = 0; i < 16; i++) {
                    if (this.cubeDOMMap[i] === wrapper) clickIdx = i;
                }
                if (clickIdx > -1) {
                    this.selectCube(clickIdx);
                    return;
                }
            }
        }

        // 3. Клик в пустоту - снимаем выделение
        let hitAnyCube = false;
        for (let el of hitElements) {
            if (el.closest('.cube-wrapper')) {
                hitAnyCube = true; break;
            }
        }
        if (!hitAnyCube) {
            this.clearSelection();
        }
    }

    selectCube(idx) {
        this.clearSelection();
        
        // Если есть чётко вынужденные ходы и этот кубик в них не входит — ошибка
        if (this.game.forcedValidMoves) {
            if (!this.game.forcedValidMoves[idx]) {
                window.audio.playError();
                // Visual shake
                this.cubeDOMMap[idx].style.animation = 'shake 0.3s';
                setTimeout(() => this.cubeDOMMap[idx].style.animation = '', 300);
                return;
            }
        }

        window.audio.playClick();
        this.selectedIdx = idx;
        this.cubeDOMMap[idx].classList.add('selected');
        
        const moves = this.game.getValidMoves(idx);
        moves.forEach(m => {
            const wrapper = document.createElement('div');
            wrapper.className = 'cube-wrapper ghost-cube';
            wrapper.dataset.toIdx = m.to;
            
            const pivot = document.createElement('div');
            pivot.className = 'cube-pivot';
            const mesh = document.createElement('div');
            mesh.className = 'cube-mesh';
            
            ['top', 'bottom', 'front', 'back', 'left', 'right'].forEach(f => {
                const face = document.createElement('div');
                face.className = `face ${f}`;
                mesh.appendChild(face);
            });
            pivot.appendChild(mesh);
            wrapper.appendChild(pivot);
            
            const r = Math.floor(m.to / 4);
            const c = m.to % 4;
            // Ghost cube is at standard Z offset (30px center)
            wrapper.style.translate = `${c * 80 + 10}px ${r * 80 + 10}px 30px`;
            
            // Make them float rhythmically
            wrapper.style.animation = 'ghost-float 2s infinite ease-in-out';
            
            this.boardContainer.appendChild(wrapper);
        });
    }

    clearSelection() {
        if (this.selectedIdx !== null && this.cubeDOMMap[this.selectedIdx]) {
             this.cubeDOMMap[this.selectedIdx].classList.remove('selected');
        }
        this.selectedIdx = null;
        document.querySelectorAll('.ghost-cube').forEach(el => el.remove());
    }

    executeMove(from, to) {
        this.clearSelection();
        
        const dirObj = this.game.getAdjPaths(from).find(p => p.to === to);
        const dir = dirObj.dir;
        
        // DOM Animations
        const wrapperDOM = this.cubeDOMMap[from];
        const pivotDOM = wrapperDOM.querySelector('.cube-pivot');
        const meshDOM = wrapperDOM.querySelector('.cube-mesh');
        
        // Animate Pivot
        pivotDOM.style.transform = `rotate3d(${dir==='N'||dir==='S'?1:0}, ${dir==='E'||dir==='W'?1:0}, 0, ${dir==='N'||dir==='E'?90:-90}deg)`;
        
        // Move wrapper XY
        const oldDomRef = this.cubeDOMMap[from];
        this.cubeDOMMap[to] = oldDomRef;
        this.cubeDOMMap[from] = null;
        this.updateCubePosition(to);

        // Apply physical jump if enabled
        const toggle = document.getElementById('physics-toggle');
        if (toggle && toggle.checked) {
            wrapperDOM.style.animation = 'none';
            void wrapperDOM.offsetWidth; // trigger reflow
            wrapperDOM.style.animation = 'jump-arc 0.4s forwards';
        }

        const currentMeshMatrix = this.cubeMeshMatrixMap[from];
        this.cubeMeshMatrixMap[to] = this.cubeMeshMatrixMap[from];
        this.cubeMeshMatrixMap[from] = null;

        // Подсчитываем ходы обоих игроков
        this.movesCount++;

        // Perform Logical Move
        this.game.move(from, to, dir);
        window.audio.playRoll();
        
        setTimeout(() => {
            // Apply matrix immediately and reset pivot
            const rotMat = createRotationMatrix(dir);
            const newMatrix = rotMat.multiply(currentMeshMatrix);
            this.cubeMeshMatrixMap[to] = newMatrix;
            
            pivotDOM.style.transition = 'none';
            pivotDOM.style.transform = 'none';
            meshDOM.style.transform = newMatrix.toString();
            
            // force reflow
            void pivotDOM.offsetWidth;
            pivotDOM.style.transition = 'transform 0.4s ease-in-out';
            
            this.postMoveHook();
        }, 400); // Wait for transition
    }

    postMoveHook() {
        if (this.game.isGameOver) {
            this.triggerVictoryScreen(this.game.winner);
            return;
        }

        this.switchTurn();
    }

    switchTurn() {
        this.evalForcedMoves();
        this.updateStatus();

        if (this.game.turn === 'black' && !this.aiThinking) {
            this.aiThinking = true;
            document.getElementById('grid').classList.add('ai-turn');
            setTimeout(() => this.playAI(), 500);
        } else if (this.game.turn === 'white') {
            this.aiThinking = false;
            document.getElementById('grid').classList.remove('ai-turn');
            this.clearSelection();
        }
    }

    evalForcedMoves() {
        this.game.forcedValidMoves = null;
        this.warningText.style.display = 'none';
        
        // Count threats
        let blackThreats = 0;
        let lastBlackCube = null;
        for(let i=0; i<16; i++) {
            if (this.game.board[i] && this.game.board[i].owner === 'black') {
                if (Math.floor(i/4) === 3 && this.game.board[i].top === FACES.CIRCLE) blackThreats++;
                else lastBlackCube = i;
            }
        }
        
        let whiteThreats = 0;
        let lastWhiteCube = null;
        for(let i=0; i<16; i++) {
            if (this.game.board[i] && this.game.board[i].owner === 'white') {
                if (Math.floor(i/4) === 0 && this.game.board[i].top === FACES.CIRCLE) whiteThreats++;
                else lastWhiteCube = i;
            }
        }

        if (this.game.turn === 'white' && blackThreats > 0) {
            const moves = AIEngine.getEvacuationMoves(this.game.board, 'white', blackThreats, lastBlackCube);
            if (moves) {
                this.game.forcedValidMoves = moves;
                this.warningText.style.display = 'block';
                this.warningText.innerHTML = `<span class="warning-pulse">${(window._t && window._t.warningTitle) || 'ВНИМАНИЕ!'}</span><br/>${window._t && window._t.warningText ? window._t.warningText(blackThreats) : 'Кружков противника на вашей линии: ' + blackThreats + '!<br/>Вы ОБЯЗАНЫ защититься кратчайшим путем!'}`;
                if (window.audio && window.audio.playWarning) window.audio.playWarning();
            }
        }
        
        if (this.game.turn === 'black' && whiteThreats > 0) {
            const moves = AIEngine.getEvacuationMoves(this.game.board, 'black', whiteThreats, lastWhiteCube);
            if (moves) this.game.forcedValidMoves = moves;
        }
    }

    playAI() {
        if (this.game.turn !== 'black') {
            this.aiThinking = false;
            return; // Safety: don't play if it's not AI's turn
        }
        const move = AIEngine.computeAIMove(this.game);
        if (move) {
            this.executeMove(move.from, move.to);
        } else {
            // No moves? Lost.
            this.game.isGameOver = true;
            this.game.winner = 'white';
            this.triggerVictoryScreen('white');
        }
    }

triggerVictoryScreen(winner) {
    // Записываем результат: локально + отправляем на NEON ARCADE (wins - losses)
    const scoreLine = document.getElementById('score-change-line');

    (async () => {
        if (window.PlatformIntegration) {
            const newScore = await window.PlatformIntegration.recordResult(winner, this.movesCount);
            if (scoreLine) {
                if (winner === 'white') {
                    scoreLine.textContent = newScore !== null
                        ? `🏆 Счёт NEON ARCADE: ${newScore} (${newScore >= 0 ? '+' : ''}${newScore})`
                        : '🏆 Победа записана!';
                } else {
                    scoreLine.textContent = newScore !== null
                        ? `💀 Счёт NEON ARCADE: ${newScore}`
                        : 'Сыграй ещё — отыграешься!';
                }
            }
        } else if (window.stats) {
            window.stats.recordResult(winner, this.movesCount);
        }
    })();

    window.audio.playWin();
    document.getElementById('grid').style.pointerEvents = 'none';

    for (let i = 0; i < 16; i++) {
        const cubeData = this.game.board[i];
        const dom = this.cubeDOMMap[i];
        if (dom && cubeData) {
            if (cubeData.owner === winner) dom.classList.add('victory-dance');
            else dom.classList.add('loser-fade');
        }
    }

    this.boardContainer.style.transition = 'transform 3s cubic-bezier(0.25, 1, 0.5, 1)';
    this.boardContainer.style.transform = `rotateX(-60deg) rotateZ(${winner === 'white' ? 45 : 225}deg)`;

    setTimeout(() => {
        const go = document.getElementById('game-over');
        go.style.display = 'flex';
        void go.offsetWidth;
        go.classList.add('show');
        document.getElementById('winner-text').innerText = winner === 'white'
            ? (window._t && window._t.playerWins)   || 'ПОБЕДА!'
            : (window._t && window._t.computerWins) || 'КОМПЬЮТЕР ПОБЕДИЛ!';
    }, 1500);
}

    updateStatus() {
        if (!this.statusText) this.statusText = document.getElementById('turn-text');
        const t = window._t || {};
        const turnCube = document.getElementById('turn-cube');
        
        if (this.game.turn === 'white') {
            this.statusText.innerText = t.turnWhite || 'Ход';
            this.statusText.style.color = '#fff';
            this.statusText.style.textShadow = '0 0 10px rgba(255,255,255,0.8)';
            if (turnCube) { turnCube.classList.remove('black'); turnCube.classList.add('white'); }
        } else {
            this.statusText.innerText = t.turnBlack || 'Ход';
            this.statusText.style.color = '#ff3366';
            this.statusText.style.textShadow = '0 0 15px rgba(255,51,102,0.8)';
            if (turnCube) { turnCube.classList.remove('white'); turnCube.classList.add('black'); }
        }
    }
}
