// Experience duration helpers. Kept free of asset imports so client scripts can use them.

/** First professional role (internship at PT PSM). */
export const careerStart = { year: 2025, month: 1 };
export const devopsStart = { year: 2026, month: 1 };

/** Months between a start month and a date, counting both ends (LinkedIn style). */
export function monthsSince(start: { year: number; month: number }, now = new Date()) {
  return (now.getFullYear() - start.year) * 12 + (now.getMonth() + 1 - start.month) + 1;
}

export function formatDuration(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} yr${y > 1 ? 's' : ''}`);
  if (m) parts.push(`${m} mo${m > 1 ? 's' : ''}`);
  return parts.join(' ') || '0 mos';
}
