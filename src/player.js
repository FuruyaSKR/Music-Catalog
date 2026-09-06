export function clampTime(value, duration) {
  return Math.min(Math.max(Number(value) || 0, 0), Math.max(duration, 0));
}

export function formatTime(seconds) {
  const total = Math.floor(clampTime(seconds, Number.MAX_SAFE_INTEGER));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
