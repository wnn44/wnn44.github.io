class Game {
    constructor() {
        this.board = new Array(16).fill(null);
        this.turn = 'white'; // white goes first
        this.selectedCell = null;
        this.isGameOver = false;
        
        // Forced Evacuation state
        this.whiteMustEvacuateRows = [];
        this.blackMustEvacuateRows = [];
        
        this.forcedValidMoves = null; // { fromIndex: [toIndex, ...], ... }
        this.moveHistory = [];
        this.endgamePlan = null; // Global solver sequence memory
    }

    init() {
        // Setup White (bottom row, 12-15)
        for (let i = 12; i < 16; i++) {
            this.board[i] = new CubeLogic('W' + (i-12), 'white');
        }
        // Setup Black (top row, 0-3)
        for (let i = 0; i < 4; i++) {
            this.board[i] = new CubeLogic('B' + i, 'black');
        }
    }

    getAdjPaths(i) {
        const paths = [];
        const r = Math.floor(i / 4);
        const c = i % 4;
        if (r > 0) paths.push({ to: i - 4, dir: 'N' });
        if (r < 3) paths.push({ to: i + 4, dir: 'S' });
        if (c < 3) paths.push({ to: i + 1, dir: 'E' });
        if (c > 0) paths.push({ to: i - 1, dir: 'W' });
        return paths;
    }

    getRestrictedRows(owner) {
        let threats = 0;
        if (owner === 'white') {
            for(let i=12; i<16; i++) {
                 if (this.board[i] && this.board[i].owner === 'black' && this.board[i].top === FACES.CIRCLE) threats++;
            }
            if (threats >= 2) return [2, 3];
            if (threats >= 1) return [3];
        } else {
            for(let i=0; i<4; i++) {
                 if (this.board[i] && this.board[i].owner === 'white' && this.board[i].top === FACES.CIRCLE) threats++;
            }
            if (threats >= 2) return [0, 1];
            if (threats >= 1) return [0];
        }
        return [];
    }

    getValidMoves(index) {
        if (this.board[index] === null) return [];
        if (this.board[index].owner !== this.turn) return [];
        
        // If strict forced moves exist, ONLY allow those
        if (this.forcedValidMoves) {
            return this.forcedValidMoves[index] || [];
        }

        const valid = [];
        const paths = this.getAdjPaths(index);
        const restricted = this.getRestrictedRows(this.turn);

        for (let p of paths) {
            if (this.board[p.to] === null) {
                const targetRow = Math.floor(p.to / 4);
                if (!restricted.includes(targetRow)) {
                    valid.push(p);
                }
            }
        }
        return valid;
    }

    move(from, to, dir) {
        if (this.board[from] === null || this.board[to] !== null) return false;
        
        // Clear AI plan if player interferes
        if (this.turn === 'white') {
            this.endgamePlan = null;
        }

        this.moveHistory.push({
            turn: this.turn,
            from: from,
            to: to,
            dir: dir
        });

        const cube = this.board[from];
        cube.roll(dir);
        this.board[to] = cube;
        this.board[from] = null;
        
        this.postMoveCheck();
        this.turn = this.turn === 'white' ? 'black' : 'white';
        return true;
    }

    postMoveCheck() {
        // 1. Check Win Condition
        // Winner is the one who gets ALL 4 of their cubes on the opponent's starting row with Circle UP
        let whiteWinCount = 0;
        for(let i=0; i<4; i++) {
            if(this.board[i] && this.board[i].owner === 'white' && this.board[i].top === FACES.CIRCLE) {
                 whiteWinCount++;
            }
        }
        if (whiteWinCount === 4) {
            this.isGameOver = true;
            this.winner = 'white';
            return;
        }

        let blackWinCount = 0;
        for(let i=12; i<16; i++) {
            if(this.board[i] && this.board[i].owner === 'black' && this.board[i].top === FACES.CIRCLE) {
                 blackWinCount++;
            }
        }
        if (blackWinCount === 4) {
            this.isGameOver = true;
            this.winner = 'black';
            return;
        }
    }
}
