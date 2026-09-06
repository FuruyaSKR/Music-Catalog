import assert from "node:assert/strict";
import test from "node:test";
import { formatRelativeDate } from "../src/updates.js";

test("formata atividade relativa em português", () => {
  const now = new Date("2026-09-05T00:00:00.000Z").getTime();

  assert.equal(formatRelativeDate("2026-09-01T00:00:00.000Z", now), "há 4 dias");
  assert.equal(formatRelativeDate("2026-09-05T00:00:00.000Z", now), "agora");
});
