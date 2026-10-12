const FACES = {
    CIRCLE: 'circle',
    CROSS: 'cross',
    ARROW: 'arrow'
};

class CubeLogic {
    constructor(id, owner) {
        this.id = id;
        this.owner = owner; // 'white' (player) or 'black' (AI)
        
        // Initial logical faces
        this.top = FACES.CIRCLE;
        this.bottom = FACES.CROSS;
        this.north = FACES.ARROW;
        this.south = FACES.ARROW;
        this.east = FACES.ARROW;
        this.west = FACES.ARROW;
    }

    roll(dir) {
        const oldTop = this.top, oldBottom = this.bottom, oldNorth = this.north, oldSouth = this.south, oldEast = this.east, oldWest = this.west;
        if (dir === 'N') {
            this.top = oldSouth; this.bottom = oldNorth; this.north = oldTop; this.south = oldBottom;
        } else if (dir === 'S') {
            this.top = oldNorth; this.bottom = oldSouth; this.north = oldBottom; this.south = oldTop;
        } else if (dir === 'E') {
            this.top = oldWest; this.bottom = oldEast; this.east = oldTop; this.west = oldBottom;
        } else if (dir === 'W') {
            this.top = oldEast; this.bottom = oldWest; this.east = oldBottom; this.west = oldTop;
        }
    }

    clone() {
        const c = new CubeLogic(this.id, this.owner);
        c.top = this.top; c.bottom = this.bottom; c.north = this.north; c.south = this.south; c.east = this.east; c.west = this.west;
        return c;
    }
}

// Visual Helper to compute global rotations for DOMMatrix
function createRotationMatrix(dir) {
    const mat = new DOMMatrix();
    if (dir === 'N') mat.rotateSelf(90, 0, 0);       // rotate around global X
    else if (dir === 'S') mat.rotateSelf(-90, 0, 0);
    else if (dir === 'E') mat.rotateSelf(0, 90, 0);   // rotate around global Y
    else if (dir === 'W') mat.rotateSelf(0, -90, 0);
    return mat;
}
