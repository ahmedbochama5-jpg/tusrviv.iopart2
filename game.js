// 🎵 Background Music
const music = new Audio('music.mp3');
music.loop = true; // continuous play
music.volume = 0.5; // sound level
music.play().catch(() => {
  console.log('Autoplay blocked — click to start music');
  document.body.addEventListener('click', () => music.play(), { once: true });
});

// 🎮 Game Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 400, y: 300, size: 20, speed: 5, health: 100 };
let enemies = [];
let keys = {};
let gameOver = false;

// 🎯 Spawn enemies randomly
function spawnEnemy() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  enemies.push({ x, y, size: 15, speed: 2 });
}

// ⌨️ Track keyboard input
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// 🧍 Draw Player
function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

// 💀 Draw Enemies
function drawEnemies() {
  ctx.fillStyle = 'red';
  enemies.forEach(enemy => {
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ❤️ Draw Health Bar
function drawHealthBar() {
  ctx.fillStyle = 'gray';
  ctx.fillRect(10, 10, 200, 20);
  ctx.fillStyle = 'lime';
  ctx.fillRect(10, 10, (player.health / 100) * 200, 20);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(10, 10, 200, 20);
}

// 💥 Collision check
function checkCollision(p, e) {
  const dx = p.x - e.x;
  const dy = p.y - e.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < p.size + e.size;
}

// 🔄 Update Game
function update() {
  if (gameOver) return;

  // Move player
  if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
  if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
  if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
  if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

  // Keep inside canvas
  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

  // Move enemies
  enemies.forEach(enemy => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed;
      enemy.y += (dy / dist) * enemy.speed;
    }

    if (checkCollision(player, enemy)) {
      player.health -= 0.5;
      if (player.health <= 0) {
        gameOver = true;
        showGameOver();
      }
    }
  });

  // Draw everything
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawEnemies();
  drawHealthBar();
}

// 💀 Game Over message
function showGameOver() {
  ctx.fillStyle = 'black';
  ctx.globalAlpha = 0.7;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  ctx.fillText('GAME OVER', canvas.width / 2 - 140, canvas.height / 2);
  ctx.font = '20px Arial';
  ctx.fillText('Restarting in 3 seconds...', canvas.width / 2 - 130, canvas.height / 2 + 40);

  setTimeout(resetGame, 3000);
}

// 🔁 Reset Game
function resetGame() {
  player = { x: 400, y: 300, size: 20, speed: 5, health: 100 };
  enemies = [];
  gameOver = false;
}

// 🔁 Main Loop
function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

// 🧠 Start game
setInterval(spawnEnemy, 2000);
gameLoop();
