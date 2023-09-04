const scoreEl = document.querySelector('.score');
const highScoreEl = document.querySelector('.high-score');
const gameOverEl = document.querySelector('.game-over');
const playAgainBtn = document.querySelector('.play-again');

const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');

cvs.style.border = '1px solid #fff';

const width = cvs.width,
  height = cvs.height;

const FPS = 1000 / 10;
let gameLoop;
const squareSize = 20;
let gameStarted = false;

let boardColor = '#000000',
  headColor = '#FFF',
  bodyColor = '#999';

let currentDirection = '';
let directionsQueue = [];
const directions = {
  RIGHT: 'ArrowRight',
  LEFT: 'ArrowLeft',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
};

function drawBoard() {
  ctx.fillStyle = boardColor;
  ctx.fillRect(0, 0, width, height);
}

function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    x * squareSize,
    y * squareSize,
    squareSize,
    squareSize
  );

  ctx.strokeStyle = boardColor;
  ctx.strokeRect(
    x * squareSize,
    y * squareSize,
    squareSize,
    squareSize
  );
}

let snake = [
  { x: 2, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 0 },
];
function drawSnake() {
  snake.forEach((square, index) => {
    const color = index === 0 ? headColor : bodyColor;
    drawSquare(square.x, square.y, color);
  });
}
function moveSnake() {
  if (!gameStarted) return;

  const head = { ...snake[0] };

  if (directionsQueue.length) {
    currentDirection = directionsQueue.shift();
  }

  switch (currentDirection) {
    case directions.RIGHT:
      head.x += 1;
      break;
    case directions.LEFT:
      head.x -= 1;
      break;
    case directions.UP:
      head.y -= 1;
      break;
    case directions.DOWN:
      head.y += 1;
      break;
  }

  if (hasEatenFood()) {
    food = createFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);
}
function hasEatenFood() {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
}

document.addEventListener('keyup', setDirection);
function setDirection(event) {
  const newDirection = event.key;
  const oldDirection = currentDirection;

  if (
    (newDirection === directions.LEFT &&
      oldDirection !== directions.RIGHT) ||
    (newDirection === directions.RIGHT &&
      oldDirection !== directions.LEFT) ||
    (newDirection === directions.UP &&
      oldDirection !== directions.DOWN) ||
    (newDirection === directions.DOWN &&
      oldDirection !== directions.UP)
  ) {
    if (!gameStarted) {
      gameStarted = true;
      gameLoop = setInterval(frame, FPS);
    }
    directionsQueue.push(newDirection);
  }
}

const horizontalSq = width / squareSize;
const verticalSq = height / squareSize; 

let food = createFood();
function createFood() {
  let food = {
    x: Math.floor(Math.random() * horizontalSq),
    y: Math.floor(Math.random() * verticalSq),
  };

  while (
    snake.some((square) => square.x === food.x && square.y === food.y)
  ) {
    food = {
      x: Math.floor(Math.random() * horizontalSq),
      y: Math.floor(Math.random() * verticalSq),
    };
  }
  return food;
}
function drawFood() {
  drawSquare(food.x, food.y, '#F95700');
}

const initialSnakeLength = snake.length;
let score = 0;
let highScore = localStorage.getItem('high-score') || 0;
function renderScore() {
  score = snake.length - initialSnakeLength;
  scoreEl.innerHTML = `⭐ ${score}`;
  highScoreEl.innerHTML = `🏆 ${highScore}`;
}

function hitWall() {
  const head = snake[0];

  return (
    head.x < 0 ||
    head.x >= horizontalSq ||
    head.y < 0 ||
    head.y >= verticalSq
  );
}

function hitSelf() {
  const snakeBody = [...snake];
  const head = snakeBody.shift();

  return snakeBody.some(
    (square) => square.x === head.x && square.y === head.y
  );
}

function gameOver() {
  const scoreEl = document.querySelector('.game-over-score .current');
  const highScoreEl = document.querySelector(
    '.game-over-score .high'
  );

  highScore = Math.max(score, highScore);
  localStorage.setItem('high-score', highScore);

  scoreEl.innerHTML = `⭐ ${score}`;
  highScoreEl.innerHTML = `🏆 ${highScore}`;

  gameOverEl.classList.remove('hide');
}

function frame() {
  drawBoard();
  drawFood();
  moveSnake();
  drawSnake();
  renderScore();
  if (hitWall() || hitSelf()) {
    clearInterval(gameLoop);
    gameOver();
  }
}
frame();

playAgainBtn.addEventListener('click', restartGame);
function restartGame() {

  snake = [
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ];

  currentDirection = '';
  directionsQueue = [];

  gameOverEl.classList.add('hide');

  gameStarted = false;

  frame();
}
