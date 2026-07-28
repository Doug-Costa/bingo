/**
 * Generates a random number between 1 and 75 that is not in the excluded list.
 * Returns null if all numbers from 1 to 75 have been drawn.
 */
export function generateRandomBall(excluded: number[]): number | null {
  const available: number[] = [];
  for (let i = 1; i <= 75; i++) {
    if (!excluded.includes(i)) {
      available.push(i);
    }
  }
  if (available.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}
