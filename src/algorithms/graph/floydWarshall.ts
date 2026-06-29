import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

function dpSnap(
  dpGrid: (number | null)[][],
  dpGridStates: Record<string, ElementState>,
  dpLabels: Record<string, string>,
  data: number[] = [],
): Snapshot {
  return {
    kind: 'dp-grid',
    data,
    states: {},
    dpGrid: dpGrid.map((row) => [...row]),
    dpGridStates: { ...dpGridStates },
    dpLabels: { ...dpLabels },
  };
}

const N = 5;
const INF = Infinity;

function genGraph(): number[] {
  const edges: [number, number, number][] = [
    [0, 1, 3], [0, 2, 8], [0, 4, 7],
    [1, 2, 2], [1, 3, 5],
    [2, 3, 1], [2, 4, 4],
    [3, 4, 6],
  ];
  const adj: number[] = [];
  for (let i = 0; i < N * N; i++) adj.push(INF);
  for (let i = 0; i < N; i++) adj[i * N + i] = 0;
  for (const [u, v, w] of edges) {
    adj[u * N + v] = w;
    adj[v * N + u] = w;
  }
  return adj;
}

export const floydWarshall: Algorithm = {
  id: 'floyd-warshall',
  name: 'Floyd-Warshall',
  category: 'graph',
  complexity: { time: 'O(V³)', space: 'O(V²)' },
  difficulty: 'advanced',
  tags: ['shortest-path'],
  dataKind: 'dp-grid',
  defaultData: genGraph(),
  codeLines: [
    'function floydWarshall(graph) {',
    '  let dist = copyMatrix(graph);',
    '  for (let k = 0; k < n; k++) {',
    '    for (let i = 0; i < n; i++) {',
    '      for (let j = 0; j < n; j++) {',
    '        if (dist[i][k] + dist[k][j] < dist[i][j])',
    '          dist[i][j] = dist[i][k] + dist[k][j];',
    '      }',
    '    }',
    '  }',
    '  return dist;',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const n = 5;
    const labels: Record<string, string> = {};
    for (let i = 0; i < n; i++) {
      labels[`row-${i}`] = String(i);
      labels[`col-${i}`] = String(i);
    }

    const dist: (number | null)[][] = [];
    for (let i = 0; i < n; i++) {
      dist[i] = [];
      for (let j = 0; j < n; j++) {
        const val = data[i * n + j];
        dist[i][j] = val === INF ? null : val;
      }
    }

    const s: Record<string, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `初始化距离矩阵（${n} 个节点）`,
      snapshot: dpSnap(dist, s, labels),
    };

    for (let k = 0; k < n; k++) {
      yield {
        type: 'visit',
        line: 3,
        message: `——— 以节点 ${k} 为中间点 ———`,
        snapshot: dpSnap(dist, s, labels),
      };

      for (let i = 0; i < n; i++) {
        if (i === k) continue;

        for (let j = 0; j < n; j++) {
          if (j === k || j === i) continue;

          const d_ik = dist[i][k] ?? INF;
          const d_kj = dist[k][j] ?? INF;
          const d_ij = dist[i][j];
          const newDist = d_ik + d_kj;

          s[`${i}-${k}`] = 'compare';
          s[`${k}-${j}`] = 'compare';
          s[`${i}-${j}`] = 'current';

          const showNew = d_ik !== INF && d_kj !== INF;

          yield {
            type: 'compare',
            line: 5,
            message: `k=${k}：dist[${i}][${j}]=${d_ij ?? '∞'} vs dist[${i}][${k}]+dist[${k}][${j}]=${d_ik}+${d_kj}=${showNew ? newDist : '∞'}`,
            snapshot: dpSnap(dist, s, labels),
          };

          if (showNew && newDist < (d_ij ?? INF)) {
            dist[i][j] = newDist;
            s[`${i}-${j}`] = 'path';

            yield {
              type: 'set',
              line: 6,
              message: `✓ 更新 dist[${i}][${j}] = ${newDist}`,
              snapshot: dpSnap(dist, s, labels),
            };
          }

          s[`${i}-${k}`] = 'sorted';
          s[`${k}-${j}`] = 'sorted';
          s[`${i}-${j}`] = 'sorted';
        }
      }
    }

    yield {
      type: 'done',
      line: 10,
      message: 'Floyd-Warshall 完成：所有节点对最短路径已计算',
      snapshot: dpSnap(dist, s, labels),
    };
  },
};
