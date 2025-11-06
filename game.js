const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.tabIndex = 1000;
canvas.focus();

let player;
let enemies;
let keys = {};
let gameOver = false;
let restartTimer = 0;

function resetGame() {
  player = { x: 400, y: 300, size: 20, speed: 5, health: 100 };
  enemies = [
    { x: 100, y: 100, size: 20, speed: 2, dx: 1, dy: 1 },
    { x: 700, y: 500, size: 20, speed: 3, dx: -1, dy: 1 },
    { x: 400, y: 100, size: 20, speed: 2.5, dx: 1, dy: -1 }
  ];
  gameOver = false;
}

resetGame();

canvas.addEventListener('keydown', e => keys[e.key] = true);
canvas.addEventListener('keyup', e => keys[e.key] = false);

function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnemies() {
  ctx.fillStyle = 'red';
  enemies.forEach(enemy => {
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawHealthBar() {
  ctx.fillStyle = 'black';
  ctx.fillRect(20, 20, 200, 20);
  ctx.fillStyle = 'lime';
  ctx.fillRect(20, 20, 2 * player.health, 20);
  ctx.strokeStyle = 'white';
  ctx.strokeRect(20, 20, 200, 20);
}

function drawGameOver() {
  ctx.fillStyle = 'white';
  ctx.font = '50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
  ctx.font = '20px Arial';
  ctx.fillText('Restarting in 3 seconds...', canvas.width / 2, canvas.height / 2 + 40);
}

function updatePlayer() {
  if (!gameOver) {
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
    if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

    player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
  }
}

function updateEnemies() {
  if (!gameOver) {
    enemies.forEach(enemy => {
      enemy.x += enemy.dx * enemy.speed;
      enemy.y += enemy.dy * enemy.speed;

      if (enemy.x <= enemy.size || enemy.x >= canvas.width - enemy.size) enemy.dx *= -1;
      if (enemy.y <= enemy.size || enemy.y >= canvas.height - enemy.size) enemy.dy *= -1;

      let dx = enemy.x - player.x;
      let dy = enemy.y - player.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < enemy.size + player.size) {
        player.health -= 1;
        if (player.health <= 0) {
          player.health = 0;
          gameOver = true;
          restartTimer = Date.now();
        }
      }
    });
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayer();
  updateEnemies();
  drawPlayer();
  drawEnemies();
  drawHealthBar();

  if (gameOver) {
    drawGameOver();
    if (Date.now() - restartTimer > 3000) resetGame();
  }
}

function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
