const relativeTime = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

export function formatRelativeDate(timestamp, now = Date.now()) {
  const difference = (new Date(timestamp).getTime() - now) / 1000;
  const absolute = Math.abs(difference);

  if (absolute < 60) return relativeTime.format(Math.round(difference), "second");
  if (absolute < 3600) return relativeTime.format(Math.round(difference / 60), "minute");
  if (absolute < 86400) return relativeTime.format(Math.round(difference / 3600), "hour");
  if (absolute < 2592000) return relativeTime.format(Math.round(difference / 86400), "day");
  if (absolute < 31536000) return relativeTime.format(Math.round(difference / 2592000), "month");
  return relativeTime.format(Math.round(difference / 31536000), "year");
}
