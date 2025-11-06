// 🎮 Setup canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 🧍 Player
let player = { x: 400, y: 300, size: 20, speed: 5, health: 100 };

// 👾 Enemies
let enemies = [];
for (let i = 0; i < 5; i++) {
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 20,
    speed: 2
  });
}

// 🎹 Keyboard input
let keys = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true; });
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

// ❤️ Draw health bar
function drawHealthBar() {
  ctx.fillStyle = 'red';
  ctx.fillRect(20, 20, 100, 10);
  ctx.fillStyle = 'lime';
  ctx.fillRect(20, 20, player.health, 10);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(20, 20, 100, 10);
}

// 🧍 Draw player
function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

// 👾 Draw enemies
function drawEnemies() {
  ctx.fillStyle = 'red';
  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 💥 Update game
function update() {
  // Move player
  if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
  if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
  if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
  if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

  // Stay inside screen
  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

  // Move enemies toward player
  enemies.forEach(e => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.hypot(dx, dy);
    e.x += (dx / dist) * e.speed;
    e.y += (dy / dist) * e.speed;

    // Collision damage
    if (dist < e.size + player.size) {
      player.health -= 0.5;
    }
  });

  // Check Game Over
  if (player.health <= 0) {
    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 120, canvas.height / 2);
    setTimeout(() => location.reload(), 2000); // restart game after 2 sec
    return false;
  }

  return true;
}

// 🕹️ Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (update()) {
    drawPlayer();
    drawEnemies();
    drawHealthBar();
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();

// 🎵 Background Music
const music = new Audio('music.mp3');
music.loop = true;
music.volume = 0.6;

music.play().catch(() => {
  console.log('Autoplay blocked — click anywhere to start music');
  document.body.addEventListener('click', () => music.play(), { once: true });
});
