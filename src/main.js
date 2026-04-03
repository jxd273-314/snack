import {
  DIRECTIONS,
  createInitialState,
  createRandomInt,
  setDirection,
  stepState,
  togglePause
} from "./game-core.mjs";

const GRID_COLS = 20;
const GRID_ROWS = 20;
const TICK_MS = 140;

const canvas = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const touchPad = document.querySelector(".touch-pad");

const ctx = canvas.getContext("2d");
const randomInt = createRandomInt();

let state = createInitialState(
  {
    cols: GRID_COLS,
    rows: GRID_ROWS
  },
  randomInt
);

function statusText(status) {
  if (status === "paused") {
    return "状态：已暂停";
  }
  if (status === "gameover") {
    return "状态：游戏结束";
  }
  return "状态：进行中";
}

function restartGame() {
  state = createInitialState(
    {
      cols: GRID_COLS,
      rows: GRID_ROWS
    },
    randomInt
  );
  render();
}

function setDirectionByName(name) {
  const direction = DIRECTIONS[name];
  if (!direction) {
    return;
  }
  state = setDirection(state, direction);
}

function drawGrid(cellW, cellH) {
  ctx.strokeStyle = "#efefef";
  ctx.lineWidth = 1;
  for (let x = 0; x <= GRID_COLS; x += 1) {
    const px = x * cellW;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= GRID_ROWS; y += 1) {
    const py = y * cellH;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvas.width, py);
    ctx.stroke();
  }
}

function render() {
  const cellW = canvas.width / GRID_COLS;
  const cellH = canvas.height / GRID_ROWS;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(cellW, cellH);

  if (state.food) {
    ctx.fillStyle = "#d32f2f";
    ctx.fillRect(state.food.x * cellW, state.food.y * cellH, cellW, cellH);
  }

  ctx.fillStyle = "#2e7d32";
  for (const part of state.snake) {
    ctx.fillRect(part.x * cellW, part.y * cellH, cellW, cellH);
  }

  scoreEl.textContent = String(state.score);
  statusEl.textContent = statusText(state.status);
  pauseBtn.textContent = state.status === "paused" ? "继续" : "暂停";
}

function gameLoop() {
  state = stepState(state, randomInt);
  render();
}

setInterval(gameLoop, TICK_MS);

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") {
    event.preventDefault();
    setDirectionByName("up");
  } else if (key === "arrowdown" || key === "s") {
    event.preventDefault();
    setDirectionByName("down");
  } else if (key === "arrowleft" || key === "a") {
    event.preventDefault();
    setDirectionByName("left");
  } else if (key === "arrowright" || key === "d") {
    event.preventDefault();
    setDirectionByName("right");
  } else if (key === " ") {
    event.preventDefault();
    state = togglePause(state);
  } else if (key === "r") {
    restartGame();
  }
});

pauseBtn.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartBtn.addEventListener("click", () => {
  restartGame();
});

if (touchPad) {
  const onTouchInput = (event) => {
    const target = event.target.closest("button[data-dir]");
    if (!target) {
      return;
    }
    event.preventDefault();
    const dir = target.getAttribute("data-dir");
    setDirectionByName(dir);
  };

  touchPad.addEventListener("touchstart", onTouchInput, { passive: false });
  touchPad.addEventListener("click", onTouchInput);
}

render();
