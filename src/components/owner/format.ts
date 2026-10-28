/** Percentage of `part` in `whole`, rounded; 0 when `whole` is 0. */
export function percent(part: number, whole: number): number {
  return whole ? Math.round((100 * part) / whole) : 0;
}

/** Direction and size of a change, or null when both values are 0. */
export function formatChange(cur: number, prev: number): { up: boolean; text: string } | null {
  if (prev === 0 && cur === 0) return null;
  const up = cur >= prev;
  const text = prev === 0 ? "New" : `${Math.abs(Math.round(((cur - prev) / prev) * 100))}%`;
  return { up, text };
}
