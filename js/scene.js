const container = document.getElementById('canvas-container');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
container.appendChild(canvas);

const COLOR_BG = '#002395';
const COLOR_CELL = [64, 224, 255];
const GRID_SIZE = 15;
const UPDATE_INTERVAL = 100;
const DRAW_INTERVAL = 33;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let width, height, cols, rows;
let grid, nextGrid;
let lastUpdate = 0;
let lastDraw = 0;
let running = false;
let rafId = null;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    cols = Math.ceil(width / GRID_SIZE);
    rows = Math.ceil(height / GRID_SIZE);

    initGrid();
    if (reducedMotion) draw(0);
}

function initGrid() {
    grid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));
    nextGrid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = Math.random() > 0.85 ? 1 : 0;
        }
    }
}

function updateState() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const state = grid[i][j];

            let neighbors = 0;
            for (let x = -1; x < 2; x++) {
                for (let y = -1; y < 2; y++) {
                    if (x === 0 && y === 0) continue;

                    const col = (i + x + cols) % cols;
                    const row = (j + y + rows) % rows;
                    neighbors += grid[col][row];
                }
            }

            if (state === 0 && neighbors === 3) {
                nextGrid[i][j] = 1;
            } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                nextGrid[i][j] = 0;
            } else {
                nextGrid[i][j] = state;
            }
        }
    }

    [grid, nextGrid] = [nextGrid, grid];
}

function draw(timestamp) {
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] === 1) {
                const flicker = Math.sin(timestamp * 0.005 + i * 0.1 + j * 0.1) * 0.5 + 0.5;
                const alpha = 0.3 + (flicker * 0.7);

                ctx.fillStyle = `rgba(${COLOR_CELL[0]}, ${COLOR_CELL[1]}, ${COLOR_CELL[2]}, ${alpha})`;

                const size = GRID_SIZE * 0.8;
                const offset = (GRID_SIZE - size) / 2;

                ctx.fillRect(
                    i * GRID_SIZE + offset,
                    j * GRID_SIZE + offset,
                    size,
                    size
                );
            }
        }
    }
}

function animate(timestamp) {
    if (!running) return;

    if (timestamp - lastUpdate > UPDATE_INTERVAL) {
        updateState();
        lastUpdate = timestamp;
    }

    if (timestamp - lastDraw > DRAW_INTERVAL) {
        draw(timestamp);
        lastDraw = timestamp;
    }

    rafId = requestAnimationFrame(animate);
}

function start() {
    if (running || reducedMotion) return;
    running = true;
    rafId = requestAnimationFrame(animate);
}

function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
});

canvas.addEventListener('mousemove', (e) => {
    const x = Math.floor(e.clientX / GRID_SIZE);
    const y = Math.floor(e.clientY / GRID_SIZE);

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (grid[x + i] && grid[x + i][y + j] !== undefined) {
                if (Math.random() > 0.5) grid[x + i][y + j] = 1;
            }
        }
    }
});

resize();
start();
