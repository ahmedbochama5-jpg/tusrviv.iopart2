game.js const canvas = document.getElementById('gameCanvas');
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
