const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 400, y: 300, size: 20, speed: 5 };
let keys = {};

document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup', e => { keys[e.key] = false; });

function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

function update() {
  if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
  if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
  if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
  if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
}

function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
