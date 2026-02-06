/**
 * Format milliseconds into a human-readable duration string.
 * e.g. "1h 23m", "45m 12s", "8s"
 */
export function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

/**
 * Format milliseconds as decimal hours (e.g. "1.5h")
 */
export function formatDecimalHours(ms) {
  const hours = ms / (1000 * 60 * 60);
  if (hours < 0.1) return '0.0h';
  return hours.toFixed(1) + 'h';
}

/**
 * Round ms to nearest 15-minute increment as decimal hours.
 * Anything >0 but <15min rounds UP to 0.25.
 */
export function roundTo15Min(ms) {
  if (ms <= 0) return 0;
  const hours = ms / (1000 * 60 * 60);
  const rounded = Math.round(hours * 4) / 4;
  // If there's any time at all but it rounded to 0, bump to 0.25
  return rounded === 0 ? 0.25 : rounded;
}

/**
 * Format ms as "rounded (exact)" decimal string, e.g. "1.25 (1.23)"
 */
export function formatRoundedDecimal(ms) {
  if (ms <= 0) return '0.00';
  const exact = ms / (1000 * 60 * 60);
  const rounded = roundTo15Min(ms);
  return `${rounded.toFixed(2)} (${exact.toFixed(2)})`;
}

/**
 * Format an ISO timestamp to a short time string (e.g. "8:30 AM")
 */
export function formatTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get the duration of an entry in ms. Uses Date.now() for running entries.
 */
export function getEntryDuration(entry) {
  const start = new Date(entry.startTime).getTime();
  const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now();
  return Math.max(0, end - start);
}

/**
 * Calculate total time without double-counting overlapping intervals.
 * Merges overlapping [start, end] intervals, then sums.
 */
export function calculateSmartTotal(entries) {
  if (!entries.length) return 0;

  const intervals = entries.map(e => ({
    start: new Date(e.startTime).getTime(),
    end: e.endTime ? new Date(e.endTime).getTime() : Date.now(),
  }));

  // Sort by start time
  intervals.sort((a, b) => a.start - b.start);

  // Merge overlapping intervals
  const merged = [{ ...intervals[0] }];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i].start <= last.end) {
      last.end = Math.max(last.end, intervals[i].end);
    } else {
      merged.push({ ...intervals[i] });
    }
  }

  return merged.reduce((sum, iv) => sum + (iv.end - iv.start), 0);
}

/**
 * Generate a deterministic HSL color for a category string.
 * Uses golden-angle hue distribution for maximum visual separation.
 * Returns both light and dark mode variants.
 */
export function getCategoryColor(category) {
  if (!category) return null;

  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Golden angle (~137.5°) gives best hue distribution
  const hue = (Math.abs(hash) * 137.508) % 360;
  return {
    bg: `hsl(${hue} 55% 93%)`,
    darkBg: `hsla(${hue} 60% 25% / 0.2)`,
    text: `hsl(${hue} 65% 35%)`,
    darkText: `hsl(${hue} 70% 75%)`,
    border: `hsl(${hue} 45% 82%)`,
    darkBorder: `hsl(${hue} 40% 25%)`,
    dot: `hsl(${hue} 60% 50%)`,
    darkDot: `hsl(${hue} 65% 65%)`,
  };
}
