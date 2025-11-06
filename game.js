const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// Background Music
const music = new Audio('music.mp3');
music.loop = true;
music.volume = 0.5;

// Player setup
let player = { x: 400, y: 300, size: 20, speed: 5 };
let keys = {};

// Keyboard controls
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Draw player
function drawPlayer() {
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

// Update player movement
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

// Game loop
function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

// Start game and music
startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  canvas.style.display = 'block';
  music.play();
  gameLoop();
});
