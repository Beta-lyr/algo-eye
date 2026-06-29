export interface ChallengeResult {
  userSwaps: number;
  userTimeMs: number;
  algoSwaps: number;
  algoCompares: number;
}

export function isSorted(arr: number[]): boolean {
  return arr.every((v, idx) => idx === 0 || v >= arr[idx - 1]);
}

export function buildChallengeResult(
  userSwaps: number,
  userTimeMs: number,
  algoSwaps: number,
  algoCompares: number,
): ChallengeResult {
  return { userSwaps, userTimeMs, algoSwaps, algoCompares };
}
