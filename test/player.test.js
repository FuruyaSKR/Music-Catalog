import assert from "node:assert/strict";
import test from "node:test";
import { clampTime, formatTime } from "../src/player.js";

test("formata e limita a posição do player", () => {
  assert.equal(formatTime(178.965), "2:58");
  assert.equal(formatTime(89.825), "1:29");
  assert.equal(clampTime(-10, 100), 0);
  assert.equal(clampTime(120, 100), 100);
});
