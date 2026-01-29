const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.getElementById('canvas-container').appendChild(canvas);

// Configuration
const COLOR_BG = '#002395';
const COLOR_CELL = [64, 224, 255]; // R, G, B (Cyan/Electric Blue)
const GRID_SIZE = 15; // Pixel size of each cell
const UPDATE_INTERVAL = 100; // ms between generations

let width, height, cols, rows;
let grid, nextGrid;
let lastUpdate = 0;

// Resize handling
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    cols = Math.ceil(width / GRID_SIZE);
    rows = Math.ceil(height / GRID_SIZE);
    
    initGrid();
}

function initGrid() {
    grid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));
    nextGrid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));
    
    // Seed random noise
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // 20% chance of life
            grid[i][j] = Math.random() > 0.85 ? 1 : 0;
        }
    }
}

function updateState() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const state = grid[i][j];
            
            // Count neighbors
            let neighbors = 0;
            for (let x = -1; x < 2; x++) {
                for (let y = -1; y < 2; y++) {
                    if (x === 0 && y === 0) continue;
                    
                    const col = (i + x + cols) % cols;
                    const row = (j + y + rows) % rows;
                    neighbors += grid[col][row];
                }
            }
            
            // Rules
            if (state === 0 && neighbors === 3) {
                nextGrid[i][j] = 1;
            } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                nextGrid[i][j] = 0;
            } else {
                nextGrid[i][j] = state;
            }
        }
    }
    
    // Swap
    [grid, nextGrid] = [nextGrid, grid];
}

function draw(timestamp) {
    // Clear background
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, width, height);
    
    // Draw cells
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] === 1) {
                // Futuristic Glimmer Calculation
                // Mix of sine waves based on position and time
                const flicker = Math.sin(timestamp * 0.005 + i * 0.1 + j * 0.1) * 0.5 + 0.5;
                const alpha = 0.3 + (flicker * 0.7); // Opacity between 0.3 and 1.0
                
                ctx.fillStyle = `rgba(${COLOR_CELL[0]}, ${COLOR_CELL[1]}, ${COLOR_CELL[2]}, ${alpha})`;
                
                // Draw slight glowing square (smaller than grid for "chip" look)
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
    if (timestamp - lastUpdate > UPDATE_INTERVAL) {
        updateState();
        lastUpdate = timestamp;
    }
    
    draw(timestamp);
    requestAnimationFrame(animate);
}

// Interaction
window.addEventListener('resize', resize);
canvas.addEventListener('mousemove', (e) => {
    // Add life under mouse
    const x = Math.floor(e.clientX / GRID_SIZE);
    const y = Math.floor(e.clientY / GRID_SIZE);
    
    // Brush size
    for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
            if (grid[x+i] && grid[x+i][y+j] !== undefined) {
                if(Math.random() > 0.5) grid[x+i][y+j] = 1;
            }
        }
    }
});

// Start
resize();
requestAnimationFrame(animate);
