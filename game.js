const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 400, y: 300, size: 20, speed: 5 };

function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
}

function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player object
let player = { x: 400, y: 300, size: 20, speed: 5 };

// To track keyboard keys
let keys = {};

// Listen to key press events
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

// Listen to key release events
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Function to draw the player
function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

// Update game state
function update() {
  // Move player according to keys pressed
  if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
  if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
  if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
  if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

  // Keep player inside canvas
  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

  // Clear canvas and redraw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
}

// Game loop
function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
