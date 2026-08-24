/**
 * Adjusts a triple of percentages that must sum to 100. When `index` is set to
 * `value`, the other two entries are redistributed proportionally to their
 * current ratio (or split evenly if both were 0) so the total stays exactly 100.
 */
export function rebalanceTriple(
  current: [number, number, number],
  index: 0 | 1 | 2,
  value: number
): [number, number, number] {
  const clamped = Math.min(Math.max(value, 0), 100);
  const others = ([0, 1, 2] as const).filter((i) => i !== index);
  const remaining = 100 - clamped;
  const otherSum = others.reduce<number>((s, i) => s + current[i], 0);

  const result: [number, number, number] = [0, 0, 0];
  result[index] = clamped;

  if (otherSum <= 0) {
    others.forEach((i) => (result[i] = remaining / others.length));
  } else {
    others.forEach((i) => (result[i] = (current[i] / otherSum) * remaining));
  }

  // Fix any floating point drift so the total is exactly 100.
  const total = result[0] + result[1] + result[2];
  const drift = 100 - total;
  result[others[others.length - 1]] += drift;

  return result.map((v) => Math.round(v * 10) / 10) as [number, number, number];
}
