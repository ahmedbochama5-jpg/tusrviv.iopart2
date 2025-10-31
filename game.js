const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player setup
let player = { x: 400, y: 300, size: 20, speed: 5, health: 100 };
let keys = {};

// Enemies setup
let enemies = [
  { x: 100, y: 100, size: 20, speed: 2, dx: 1, dy: 1 },
  { x: 700, y: 500, size: 20, speed: 3, dx: -1, dy: 1 }
];

// Listen for keyboard input
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Draw the player
function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

// Draw enemies
function drawEnemies() {
  ctx.fillStyle = 'red';
  enemies.forEach(enemy => {
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Draw health bar
function drawHealthBar() {
  ctx.fillStyle = 'black';
  ctx.fillRect(20, 20, 200, 20); // background
  ctx.fillStyle = 'lime';
  ctx.fillRect(20, 20, 2 * player.health, 20); // current health
  ctx.strokeStyle = 'white';
  ctx.strokeRect(20, 20, 200, 20); // border
}

// Update player position
function updatePlayer() {
  if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
  if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
  if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
  if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

  // Keep player inside canvas
  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
}

// Update enemies position
function updateEnemies() {
  enemies.forEach(enemy => {
    enemy.x += enemy.dx * enemy.speed;
    enemy.y += enemy.dy * enemy.speed;

    // Bounce off canvas edges
    if (enemy.x <= enemy.size || enemy.x >= canvas.width - enemy.size) enemy.dx *= -1;
    if (enemy.y <= enemy.size || enemy.y >= canvas.height - enemy.size) enemy.dy *= -1;

    // Check collision with player
    let dx = enemy.x - player.x;
    let dy = enemy.y - player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < enemy.size + player.size) {
      player.health -= 1; // decrease health on collision
      if (player.health < 0) player.health = 0;
    }
  });
}

// Main update function
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayer();
  updateEnemies();
  drawPlayer();
  drawEnemies();
  drawHealthBar();
}

// Game loop
function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
