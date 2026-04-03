import test from "node:test";
import assert from "node:assert/strict";

import {
  DIRECTIONS,
  createInitialState,
  placeFood,
  setDirection,
  stepState
} from "../src/game-core.mjs";

test("stepState: snake moves one cell forward", () => {
  const state = createInitialState({
    cols: 10,
    rows: 10,
    initialSnake: [{ x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }],
    initialDirection: DIRECTIONS.right
  });

  const next = stepState(state, () => 0);
  assert.deepEqual(next.snake, [{ x: 5, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 4 }]);
  assert.equal(next.status, "running");
});

test("setDirection: cannot reverse while snake length > 1", () => {
  const state = createInitialState({
    cols: 10,
    rows: 10,
    initialSnake: [{ x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }],
    initialDirection: DIRECTIONS.right
  });

  const next = setDirection(state, DIRECTIONS.left);
  assert.equal(next.pendingDirection, null);
});

test("stepState: hits wall and ends game", () => {
  const state = createInitialState({
    cols: 5,
    rows: 5,
    initialSnake: [{ x: 4, y: 2 }, { x: 3, y: 2 }],
    initialDirection: DIRECTIONS.right
  });

  const next = stepState(state, () => 0);
  assert.equal(next.status, "gameover");
});

test("stepState: eating food grows snake and increases score", () => {
  const state = {
    cols: 10,
    rows: 10,
    snake: [{ x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }],
    direction: DIRECTIONS.right,
    pendingDirection: null,
    food: { x: 5, y: 4 },
    score: 0,
    status: "running"
  };

  const next = stepState(state, () => 0);
  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.equal(next.status, "running");
});

test("placeFood: generated food never overlaps snake", () => {
  const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
  const food = placeFood(snake, 4, 4, () => 0);

  assert.ok(food);
  assert.equal(snake.some((part) => part.x === food.x && part.y === food.y), false);
});
