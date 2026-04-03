export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

function samePoint(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isOpposite(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

function inBounds(point, cols, rows) {
  return point.x >= 0 && point.x < cols && point.y >= 0 && point.y < rows;
}

export function createRandomInt(rng = Math.random) {
  return (max) => Math.floor(rng() * max);
}

export function placeFood(snake, cols, rows, randomInt = createRandomInt()) {
  const freeCells = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const occupied = snake.some((part) => part.x === x && part.y === y);
      if (!occupied) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = randomInt(freeCells.length);
  return freeCells[index];
}

export function createInitialState(
  {
    cols = 20,
    rows = 20,
    initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    initialDirection = DIRECTIONS.right
  } = {},
  randomInt = createRandomInt()
) {
  const food = placeFood(initialSnake, cols, rows, randomInt);
  return {
    cols,
    rows,
    snake: initialSnake.map((part) => ({ ...part })),
    direction: { ...initialDirection },
    pendingDirection: null,
    food,
    score: 0,
    status: "running"
  };
}

export function setDirection(state, direction) {
  if (!direction || state.status !== "running") {
    return state;
  }

  const activeDirection = state.pendingDirection ?? state.direction;
  if (samePoint(direction, activeDirection)) {
    return state;
  }

  if (state.snake.length > 1 && isOpposite(direction, activeDirection)) {
    return state;
  }

  return {
    ...state,
    pendingDirection: { ...direction }
  };
}

export function togglePause(state) {
  if (state.status === "running") {
    return { ...state, status: "paused" };
  }
  if (state.status === "paused") {
    return { ...state, status: "running" };
  }
  return state;
}

export function stepState(state, randomInt = createRandomInt()) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.pendingDirection ?? state.direction;
  const currentHead = state.snake[0];
  const newHead = {
    x: currentHead.x + direction.x,
    y: currentHead.y + direction.y
  };

  if (!inBounds(newHead, state.cols, state.rows)) {
    return {
      ...state,
      direction,
      pendingDirection: null,
      status: "gameover"
    };
  }

  const hitsFood = state.food && samePoint(newHead, state.food);
  const bodyToCheck = hitsFood ? state.snake : state.snake.slice(0, -1);
  const selfCollision = bodyToCheck.some((part) => samePoint(part, newHead));
  if (selfCollision) {
    return {
      ...state,
      direction,
      pendingDirection: null,
      status: "gameover"
    };
  }

  const snake = [newHead, ...state.snake];
  if (!hitsFood) {
    snake.pop();
  }

  let food = state.food;
  let score = state.score;
  let status = state.status;
  if (hitsFood) {
    score += 1;
    food = placeFood(snake, state.cols, state.rows, randomInt);
    if (!food) {
      status = "gameover";
    }
  }

  return {
    ...state,
    snake,
    direction,
    pendingDirection: null,
    food,
    score,
    status
  };
}
