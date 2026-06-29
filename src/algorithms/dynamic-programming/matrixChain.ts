import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

function dpSnap(
  dpGrid: (number | null)[][],
  dpGridStates: Record<string, ElementState>,
  dpLabels: Record<string, string>,
  arrayData: number[] = [],
): Snapshot {
  return {
    kind: 'dp-grid',
    data: arrayData,
    states: {},
    dpGrid: dpGrid.map((r) => [...r]),
    dpGridStates: { ...dpGridStates },
    dpLabels: { ...dpLabels },
  };
}

function* generate(dims: number[]): Generator<Step> {
  const n = dims.length - 1; // matrix count
  const m: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
  const states: Record<string, ElementState> = {};
  const labels: Record<string, string> = {};

  // 初始化 m[i][i] = 0
  for (let i = 0; i < n; i++) {
    m[i][i] = 0;
    states[`${i},${i}`] = 'visit';
    labels[`${i},${i}`] = '0';
    yield { type: 'compare', indices: [i, i], line: 1, snapshot: dpSnap(m, states, labels, dims), message: `初始化对角线 m[${i}][${i}]=0` };
  }

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      let min = Infinity;
      let bestK = -1;
      labels[`${i},${j}`] = '?';
      states[`${i},${j}`] = 'compare';

      for (let k = i; k < j; k++) {
        const cost = (m[i][k] ?? 0) + (m[k + 1][j] ?? 0) + dims[i] * dims[k + 1] * dims[j + 1];

        yield {
          type: 'compare',
          indices: [i, k, j],
          line: 2,
          snapshot: dpSnap(m, states, labels, dims),
          message: `计算 m[${i}][${j}]: 尝试 k=${k}, cost=m[${i}][${k}]+m[${k+1}][${j}]+${dims[i]}×${dims[k+1]}×${dims[j+1]}=${m[i][k] ?? 0}+${m[k+1][j] ?? 0}+${dims[i] * dims[k + 1] * dims[j + 1]}=${cost}`,
        };

        if (cost < min) {
          min = cost;
          bestK = k;
        }
      }

      m[i][j] = min;
      states[`${i},${j}`] = 'default';
      labels[`${i},${j}`] = String(min);

      yield {
        type: 'swap',
        indices: [i, j, bestK],
        line: 3,
        snapshot: dpSnap(m, states, labels, dims),
        message: `m[${i}][${j}] = ${min} (k=${bestK})`,
      };
    }
  }

  yield {
    type: 'done',
    indices: [0, n - 1],
    line: 4,
    snapshot: dpSnap(m, states, labels, dims),
    message: `最优解 = m[0][${n - 1}] = ${m[0][n - 1]} 次标量乘法`,
  };
}

export const matrixChain: Algorithm = {
  id: 'matrix-chain',
  name: '矩阵链乘法',
  category: 'dynamic-programming',
  complexity: { time: 'O(n³)', space: 'O(n²)' },
  dataKind: 'dp-grid',
  codeLines: [
    'for len = 2..n:',
    '  for k = i..j-1: cost = m[i][k] + m[k+1][j] + p[i]*p[k+1]*p[j+1]',
    '  m[i][j] = min_cost',
    'return m[0][n-1]',
  ],
  generate,
  defaultData: [5, 4, 6, 2, 7],
  difficulty: 'advanced',
  tags: ['optimization'],
  relatedAlgorithms: [],
};
