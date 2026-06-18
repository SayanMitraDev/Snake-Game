const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const restartBtn = document.getElementById('restartBtn');
const controlButtons = document.querySelectorAll('[data-direction]');

const gridSize = 20;
const tileCount = 30;
const gameSpeed = 120;

let snake = [{ x: 14, y: 15 }];
let velocity = { x: 0, y: 0 };
let apple = { x: 8, y: 10 };
let running = false;
let gameLoopId = null;
let lastFrameTime = performance.now();

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function paint() {
  ctx.fillStyle = '#081229';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i++) {
    const coord = (canvas.width / tileCount) * i;
    ctx.beginPath();
    ctx.moveTo(coord, 0);
    ctx.lineTo(coord, canvas.height);
    ctx.moveTo(0, coord);
    ctx.lineTo(canvas.width, coord);
    ctx.stroke();
  }

  ctx.fillStyle = '#ff6b6b';
  drawRoundedRect(
    apple.x * gridSize + 2,
    apple.y * gridSize + 2,
    gridSize - 4,
    gridSize - 4,
    8
  );

  snake.forEach((segment, index) => {
    const hue = index === 0 ? 190 : 190 + index * 3;
    ctx.fillStyle = index === 0 ? '#65d6ff' : `hsl(${hue % 360}, 85%, 55%)`;
    drawRoundedRect(
      segment.x * gridSize + 4,
      segment.y * gridSize + 4,
      gridSize - 8,
      gridSize - 8,
      6
    );
  });
}

function update() {
  if (!running) return;

  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    ScoreBoard.addScore(10);
    placeApple();
    AudioManager.playEatSound();
  } else {
    snake.pop();
  }

  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    endGame();
  } else {
    paint();
  }
}

function placeApple() {
  let newApple;
  do {
    newApple = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some(segment => segment.x === newApple.x && segment.y === newApple.y));
  apple = newApple;
}

function startGame() {
  snake = [{ x: 14, y: 15 }];
  velocity = { x: 0, y: 0 };
  ScoreBoard.setScore(0);
  placeApple();
  overlay.classList.add('hidden');
  running = true;
  AudioManager.playBackgroundMusic();
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  lastFrameTime = performance.now();
  animate(lastFrameTime);
}

function endGame() {
  running = false;
  overlayTitle.textContent = 'Game Over';
  overlayMessage.textContent = 'Your score has been recorded. Press play again to restart.';
  overlay.classList.remove('hidden');
  ScoreBoard.updateLeaderboard(ScoreBoard.getScore());
  AudioManager.stopBackgroundMusic();
  AudioManager.playGameOverSound();
}

function animate(timestamp) {
  if (!running) return;
  gameLoopId = requestAnimationFrame(animate);
  if (timestamp - lastFrameTime < gameSpeed) return;
  lastFrameTime = timestamp;
  update();
}

function mapKey(direction) {
  if (direction === 'ArrowUp' && velocity.y === 1) return;
  if (direction === 'ArrowDown' && velocity.y === -1) return;
  if (direction === 'ArrowLeft' && velocity.x === 1) return;
  if (direction === 'ArrowRight' && velocity.x === -1) return;

  velocity = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  }[direction] || velocity;
}

restartBtn.addEventListener('click', startGame);
controlButtons.forEach(button => {
  button.addEventListener('click', () => {
    mapKey(button.dataset.direction);
  });
});

document.addEventListener('keydown', event => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (!running) startGame();
    return;
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    mapKey(event.key);
  }
});

canvas.addEventListener('click', () => {
  if (!running) startGame();
});

ScoreBoard.initLeaderboard();
ScoreBoard.setScore(0);
paint();
