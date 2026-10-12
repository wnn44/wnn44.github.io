class AIEngine {
    static getEvacuationMoves(board, owner, enemyThreats, targetEnemyCubeIdx) {
        if (enemyThreats === 0) return null;

        const startState = board.map(c => c ? c.owner : null);
        
        const rowsToClear = [];
        if (owner === 'white') {
             if (enemyThreats >= 1) rowsToClear.push(3);
             if (enemyThreats >= 2) rowsToClear.push(2);
        } else {
             if (enemyThreats >= 1) rowsToClear.push(0);
             if (enemyThreats >= 2) rowsToClear.push(1);
        }

        const isCleared = (st) => {
             if (enemyThreats === 1 || enemyThreats === 2) {
                 for(let r of rowsToClear) {
                     for(let c=0; c<4; c++) {
                         if(st[r*4 + c] === owner) return false;
                     }
                 }
                 return true;
             } else if (enemyThreats === 3) {
                 const i = targetEnemyCubeIdx;
                 if (i === null || i === undefined) return true; 
                 const r = Math.floor(i / 4);
                 const c = i % 4;
                 if(r > 0 && st[i-4] === null) return true;
                 if(r < 3 && st[i+4] === null) return true;
                 if(c > 0 && st[i-1] === null) return true;
                 if(c < 3 && st[i+1] === null) return true;
                 return false;
             }
             return true;
        };

        if (isCleared(startState)) return null;

        const queue = [{ state: startState, firstMove: null, depth: 0 }];
        const visited = new Set();
        visited.add(startState.join(','));
        
        let shortestDepth = Infinity;
        const validFirstMoves = {};

        while(queue.length > 0) {
            const { state, firstMove, depth } = queue.shift();
            
            if (depth > shortestDepth) break; 
            
            if (isCleared(state)) {
                shortestDepth = depth;
                if (firstMove) {
                    if(!validFirstMoves[firstMove.from]) validFirstMoves[firstMove.from] = [];
                    if(!validFirstMoves[firstMove.from].some(m => m.to === firstMove.to)) {
                        validFirstMoves[firstMove.from].push({ to: firstMove.to, dir: firstMove.dir });
                    }
                }
                continue; 
            }
            
            for(let i=0; i<16; i++) {
                if(state[i] === owner) {
                    const r = Math.floor(i / 4);
                    const c = i % 4;
                    const adjs = [];
                    if(r > 0) adjs.push({to: i-4, dir:'N'});
                    if(r < 3) adjs.push({to: i+4, dir:'S'});
                    if(c > 0) adjs.push({to: i-1, dir:'W'});
                    if(c < 3) adjs.push({to: i+1, dir:'E'});
                    
                    for(let adj of adjs) {
                        if(state[adj.to] === null) {
                            const newState = [...state];
                            newState[adj.to] = owner;
                            newState[i] = null;
                            const stateHash = newState.join(',');
                            if(!visited.has(stateHash)) {
                                visited.add(stateHash); 
                                queue.push({
                                    state: newState,
                                    firstMove: depth === 0 ? { from: i, to: adj.to, dir: adj.dir } : firstMove,
                                    depth: depth + 1
                                });
                            }
                        }
                    }
                }
            }
        }
        
        if (Object.keys(validFirstMoves).length > 0) return validFirstMoves;
        return null; 
    }

    static getRestrictedRowsForState(board, owner) {
        let threats = 0;
        if (owner === 'white') {
            for(let i=12; i<16; i++) {
                 if (board[i] && board[i].owner === 'black' && board[i].top === 'circle') threats++;
            }
            if (threats >= 2) return [2, 3];
            if (threats >= 1) return [3];
        } else {
            for(let i=0; i<4; i++) {
                 if (board[i] && board[i].owner === 'white' && board[i].top === 'circle') threats++;
            }
            if (threats >= 2) return [0, 1];
            if (threats >= 1) return [0];
        }
        return [];
    }

    static getDistToWin(board, originalIndex, isBlack) {
        const startCube = board[originalIndex];
        const queue = [{ idx: originalIndex, cube: startCube.clone(), dist: 0 }];
        const visited = new Set();
        
        const getHash = (idx, c) => `${idx}-${c.top}-${c.north}`;
        visited.add(getHash(originalIndex, startCube));

        const targetRow = isBlack ? 3 : 0;
        const restricted = AIEngine.getRestrictedRowsForState(board, isBlack ? 'black' : 'white');
        const startRow = Math.floor(originalIndex / 4);
        const isStartRestricted = restricted.includes(startRow);

        while(queue.length > 0) {
            let curr = queue.shift();
            let r = Math.floor(curr.idx / 4);
            
            if (r === targetRow && curr.cube.top === 'circle') return curr.dist;

            let c = curr.idx % 4;
            let adjs = [];
            if(r > 0) adjs.push({to: curr.idx-4, dir:'N'});
            if(r < 3) adjs.push({to: curr.idx+4, dir:'S'});
            if(c > 0) adjs.push({to: curr.idx-1, dir:'W'});
            if(c < 3) adjs.push({to: curr.idx+1, dir:'E'});

            for(let adj of adjs) {
                const targetRowStep = Math.floor(adj.to / 4);
                if (!isStartRestricted && restricted.includes(targetRowStep)) continue;

                // Crucial fix: Treat own pieces as passable for the HEURISTIC calculation 
                // so the AI doesn't think siblings are permanent solid walls, causing it to refuse advancing.
                if (board[adj.to] === null || board[adj.to].owner === startCube.owner || adj.to === originalIndex) {
                     let nextCube = curr.cube.clone();
                     nextCube.roll(adj.dir);
                     let hash = getHash(adj.to, nextCube);
                     if (!visited.has(hash)) {
                         visited.add(hash);
                         queue.push({ idx: adj.to, cube: nextCube, dist: curr.dist + 1 });
                     }
                }
            }
        }
        return Infinity;
    }

    static analyzeUserPatterns(history) {
        const humanMoves = history.filter(m => m.turn === 'white');
        let report = "";
        let patterns = { preferredCol: null };
        if (humanMoves.length < 3) {
            report = "Анализ ходов: Собираю данные о стиле игрока...";
            return { patterns, report };
        }
        
        let cols = {0:0, 1:0, 2:0, 3:0};
        humanMoves.forEach(m => cols[m.to % 4]++);
        
        let maxCol = -1, maxVal = 0;
        for (let c in cols) {
            if (cols[c] > maxVal) { maxVal = cols[c]; maxCol = parseInt(c); }
        }
        
        const colNames = {0:'Левый фланг', 1:'Слева по центру', 2:'Справа по центру', 3:'Правый фланг'};
        
        if (maxVal >= humanMoves.length * 0.4 && humanMoves.length > 5) {
            patterns.preferredCol = maxCol;
            report = `Паттерн найден: Игрок давит через [${colNames[maxCol]}]. Усиливаем защиту фланга и готовимся перекрывать линии.`;
        } else {
            report = "Паттерн: Игрок играет сбалансировано. Переключаюсь на агрессивное продавливание.";
        }
        
        return { patterns, report };
    }

    static getValidMovesForState(board, turn) {
        let blackThreats = 0, whiteThreats = 0;
        let lastBlackCube = null, lastWhiteCube = null;

        for(let i=0; i<16; i++) {
            if (board[i]) {
                if (board[i].owner === 'black') {
                    if (Math.floor(i/4) === 3 && board[i].top === 'circle') blackThreats++;
                    else lastBlackCube = i;
                } else {
                    if (Math.floor(i/4) === 0 && board[i].top === 'circle') whiteThreats++;
                    else lastWhiteCube = i;
                }
            }
        }

        let forcedMoves = null;
        if (turn === 'white' && blackThreats > 0) {
            forcedMoves = this.getEvacuationMoves(board, 'white', blackThreats, lastBlackCube);
        } else if (turn === 'black' && whiteThreats > 0) {
            forcedMoves = this.getEvacuationMoves(board, 'black', whiteThreats, lastWhiteCube);
        }

        let possibleMoves = [];
        if (forcedMoves && Object.keys(forcedMoves).length > 0) {
            for(let from in forcedMoves) {
                for(let m of forcedMoves[from]) {
                    possibleMoves.push({from: parseInt(from), to: m.to, dir: m.dir});
                }
            }
            return possibleMoves;
        }

        let restricted = this.getRestrictedRowsForState(board, turn);

        for(let i=0; i<16; i++) {
            if (board[i] && board[i].owner === turn) {
                const r = Math.floor(i/4);
                const c = i%4;
                const adjs = [];
                if(r > 0) adjs.push({to: i-4, dir:'N'});
                if(r < 3) adjs.push({to: i+4, dir:'S'});
                if(c > 0) adjs.push({to: i-1, dir:'W'});
                if(c < 3) adjs.push({to: i+1, dir:'E'});
                
                for(let adj of adjs) {
                    const targetRow = Math.floor(adj.to / 4);
                    if (!restricted.includes(targetRow) && board[adj.to] === null) {
                        possibleMoves.push({from: i, to: adj.to, dir: adj.dir});
                    }
                }
            }
        }
        return possibleMoves;
    }

    static applyMove(board, move) {
        const clone = board.map(c => c ? c.clone() : null);
        clone[move.to] = clone[move.from];
        clone[move.from] = null;
        clone[move.to].roll(move.dir);
        return clone;
    }

    static evaluateBoard(board, patterns) {
        let score = 0;
        let whiteDists = [];
        let blackDists = [];

        for(let i=0; i<16; i++) {
            if (board[i]) {
                if (board[i].owner === 'black') {
                    blackDists.push(this.getDistToWin(board, i, true));
                    if (patterns && patterns.preferredCol !== null) {
                        if (i % 4 === patterns.preferredCol) score += 10; 
                    }
                } else {
                    whiteDists.push(this.getDistToWin(board, i, false));
                }
            }
        }

        // PURE SHORTEST PATH SEARCH (Greedy Gradient)
        for (let dist of blackDists) {
            if (dist !== Infinity) {
                // Absolute penalty for every step away from the goal. 
                // Maximizing this strictly minimizes the total steps to win.
                score -= dist * 1000; 
                // Small tie-breakers to prioritize finishing almost-won cubes over advancing distant ones
                if (dist === 1) score += 500;
                else if (dist === 2) score += 200;
            }
            else score -= 99999; 
        }

        for (let dist of whiteDists) {
            if (dist !== Infinity) {
                score += dist * 10; // Extremely mild penalty for White's distance, meaning Black mostly ignores it
                
                // UNLESS White is literally at the finish line! Then DROP EVERYTHING and block!
                if (dist === 1) score -= 50000; 
                else if (dist === 2) score -= 5000;
            } else {
                score += 50; 
            }
        }

        return score;
    }

    static isEndgameReady(board) {
        let blackCount = 0;
        for (let i=8; i<16; i++) {
            if (board[i]) {
                if (board[i].owner === 'black') blackCount++;
                if (board[i].owner === 'white') return false; 
            }
        }
        return blackCount === 4;
    }

    static getGlobalDist(boardArray) {
        let sum = 0;
        for (let i=8; i<16; i++) {
            if (boardArray[i] && boardArray[i].owner === 'black') {
                let d = this.getDistToWin(boardArray, i, true);
                if (d === Infinity) return Infinity;
                sum += d;
            }
        }
        return sum;
    }

    static solveEndgame(board) {
        const encodeState = (b) => {
            let s = "";
            for (let i=8; i<16; i++) {
                if (b[i] && b[i].owner === 'black') s += `B-${b[i].top}-${b[i].north}|`;
                else s += "0|";
            }
            return s;
        };

        const startScore = this.getGlobalDist(board);
        if (startScore === 0 || startScore === Infinity) return null;

        const pq = [];
        pq.push({ board: board, g: 0, h: startScore, path: [] });
        
        const visited = new Set();
        visited.add(encodeState(board));
        
        let attempts = 0;
        while(pq.length > 0 && attempts < 2000) {
            attempts++;
            pq.sort((a, b) => (a.g + a.h) - (b.g + b.h) || b.g - a.g);
            let curr = pq.shift();
            
            if (curr.h === 0) return curr.path; 

            let moves = this.getValidMovesForState(curr.board, 'black');
            
            for (let m of moves) {
                if (m.to < 8) continue; 

                let nextBoard = this.applyMove(curr.board, m);
                let hash = encodeState(nextBoard);
                
                if (!visited.has(hash)) {
                    visited.add(hash);
                    let h = this.getGlobalDist(nextBoard);
                    if (h !== Infinity) {
                        pq.push({ board: nextBoard, g: curr.g + 1, h: h, path: [...curr.path, m] });
                    }
                }
            }
        }
        return null;
    }

    static minimax(board, depth, alpha, beta, isMaximizing, lastTurnMove, patterns) {
        if (depth === 0) {
            return { score: this.evaluateBoard(board, patterns) };
        }
        
        const turn = isMaximizing ? 'black' : 'white';
        let moves = this.getValidMovesForState(board, turn);
        
        if (moves.length === 0) {
            return { score: isMaximizing ? -999999 : 999999 };
        }

        if (moves.length > 1 && lastTurnMove && depth === 3) {
            const filtered = moves.filter(m => !(m.from === lastTurnMove.to && m.to === lastTurnMove.from));
            if (filtered.length > 0) moves = filtered;
        }

        moves.sort(() => Math.random() - 0.5);

        let bestMove = null;
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let m of moves) {
                 let childBoard = this.applyMove(board, m);
                 
                 let blackWinCount = 0;
                 childBoard.forEach((c, idx) => { if(c && c.owner === 'black' && c.top === 'circle' && Math.floor(idx/4)===3) blackWinCount++; });
                 if (blackWinCount === 4) return { score: 999999 + depth, move: m }; 

                 let sim = this.minimax(childBoard, depth - 1, alpha, beta, false, m, patterns);
                 let finalScore = sim.score;
                 
                 if (lastTurnMove && m.from === lastTurnMove.to) {
                     finalScore += 25; // Momentum bias: prefer continuing with the same piece
                 }

                 if (finalScore > maxEval) {
                     maxEval = finalScore;
                     bestMove = m;
                 }
                 alpha = Math.max(alpha, finalScore);
                 if (beta <= alpha) break;
            }
            if (bestMove === null) bestMove = moves[0];
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (let m of moves) {
                 let childBoard = this.applyMove(board, m);

                 let whiteWinCount = 0;
                 childBoard.forEach((c, idx) => { if(c && c.owner === 'white' && c.top === 'circle' && Math.floor(idx/4)===0) whiteWinCount++; });
                 if (whiteWinCount === 4) return { score: -999999 - depth, move: m };

                 let sim = this.minimax(childBoard, depth - 1, alpha, beta, true, m, patterns);
                 if (sim.score < minEval) {
                     minEval = sim.score;
                     bestMove = m;
                 }
                 beta = Math.min(beta, sim.score);
                 if (beta <= alpha) break;
            }
            if (bestMove === null) bestMove = moves[0];
            return { score: minEval, move: bestMove };
        }
    }

    static computeAIMove(game) {
        if (!game.moveHistory) game.moveHistory = [];
        const trackerPanel = document.getElementById('ai-thoughts');
        
        if (game.endgamePlan && game.endgamePlan.length > 0) {
            let nextMove = game.endgamePlan.shift(); 
            if (trackerPanel) trackerPanel.innerText = `Эндшпиль! Выполняю заготовленный идеальный маршрут (осталось шагов: ${game.endgamePlan.length + 1})`;
            game.lastAIMove = nextMove;
            return nextMove;
        }

        if (this.isEndgameReady(game.board)) {
            if (trackerPanel) trackerPanel.innerText = "Цель близка! Запускаю глобальный синхронный просчет (Global A*)...";
            let plan = this.solveEndgame(game.board);
            if (plan && plan.length > 0) {
                game.endgamePlan = plan;
                let nextMove = game.endgamePlan.shift();
                game.lastAIMove = nextMove;
                if (trackerPanel) trackerPanel.innerText = `План найден! Точное количество шагов до победы: ${plan.length + 1}`;
                return nextMove;
            }
        }

        const analysis = this.analyzeUserPatterns(game.moveHistory);
        if (trackerPanel) trackerPanel.innerText = analysis.report;
        
        const res = this.minimax(game.board, 3, -Infinity, Infinity, true, game.lastAIMove, analysis.patterns);
        
        if (res.move) {
            game.lastAIMove = res.move;
            return res.move;
        }
        return null;
    }
}
