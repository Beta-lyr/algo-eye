// ============================================================
// Dijkstra 算法 — Dijkstra's Algorithm
// 在加权网格中找到起点到终点的最短路径
// ============================================================

import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

/** 默认网格大小 */
const DEFAULT_COLS = 12;
const DEFAULT_ROWS = 8;

/** 创建网格快照 */
function gridSnap(
  data: number[],
  cols: number,
  states: Record<number, ElementState>,
  start: [number, number],
  target: [number, number],
): Snapshot {
  return {
    kind: 'grid',
    data: [...data],
    states: { ...states },
    cols,
    start,
    target,
  };
}

/** 生成默认数据（带权重和墙） */
function generateDefaultData(): number[] {
  const data: number[] = [];
  for (let i = 0; i < DEFAULT_ROWS * DEFAULT_COLS; i++) {
    const rand = Math.random();
    if (rand < 0.15) {
      data.push(-1); // 墙
    } else if (rand < 0.3) {
      data.push(Math.floor(Math.random() * 5) + 2); // 权重 2-6
    } else {
      data.push(1); // 默认权重
    }
  }
  data[0] = 1;
  data[DEFAULT_ROWS * DEFAULT_COLS - 1] = 1;
  return data;
}

export const dijkstra: Algorithm = {
  id: 'dijkstra',
  name: 'Dijkstra 算法',
  category: 'graph',
  complexity: { time: 'O((V+E)logV)', space: 'O(V)' },
  difficulty: 'intermediate',
  tags: ['shortest-path'],
  relatedAlgorithms: ['bfs', 'bellman-ford', 'astar'],
  dataKind: 'grid',
  defaultData: generateDefaultData(),
  codeLines: [
    'function dijkstra(grid, start, target) {',
    '  const dist = new Map();',
    '  const parent = new Map();',
    '  const pq = new MinHeap();',
    '  dist.set(start, 0);',
    '  pq.push([0, start]);',
    '  while (!pq.isEmpty()) {',
    '    const [d, [r, c]] = pq.pop();',
    '    if (d > dist.get([r,c])) continue;',
    '    if (r === target[0] && c === target[1]) {',
    '      return reconstructPath(parent, target);',
    '    }',
    '    for (const [nr, nc] of neighbors(r, c)) {',
    '      const w = grid[nr][nc];',
    '      const newDist = d + w;',
    '      if (newDist < (dist.get([nr,nc]) ?? Infinity)) {',
    '        dist.set([nr,nc], newDist);',
    '        parent.set([nr,nc], [r,c]);',
    '        pq.push([newDist, [nr, nc]]);',
    '      }',
    '    }',
    '  }',
    '  return null;',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const cols = DEFAULT_COLS;
    const rows = DEFAULT_ROWS;
    const start: [number, number] = [0, 0];
    const target: [number, number] = [rows - 1, cols - 1];

    const gridData = [...data];
    gridData[0] = 1;
    gridData[rows * cols - 1] = 1;

    // 距离表
    const dist = new Map<string, number>();
    const parent = new Map<string, string>();
    const visited = new Set<string>();

    // 简单优先队列（用数组模拟）
    const pq: [number, [number, number]][] = [];
    const startKey = `${start[0]},${start[1]}`;
    dist.set(startKey, 0);
    pq.push([0, start]);

    const states: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `开始 Dijkstra，起点 [${start}]，终点 [${target}]`,
      snapshot: gridSnap(gridData, cols, states, start, target),
    };

    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (pq.length > 0) {
      // 找最小距离
      pq.sort((a, b) => a[0] - b[0]);
      const [d, [r, c]] = pq.shift()!;
      const key = `${r},${c}`;
      const idx = r * cols + c;

      if (visited.has(key)) continue;
      visited.add(key);

      yield {
        type: 'visit',
        indices: [idx],
        line: 7,
        message: `访问 [${r},${c}]，距离 ${d}，队列 ${pq.length} 个`,
        snapshot: gridSnap(gridData, cols, { ...states, [idx]: 'current' }, start, target),
      };

      if (r === target[0] && c === target[1]) {
        let pathKey: string | undefined = `${target[0]},${target[1]}`;
        const pathIndices: number[] = [];
        let totalDist = 0;

        while (pathKey) {
          const [pr, pc] = pathKey.split(',').map(Number);
          const pidx = pr * cols + pc;
          pathIndices.push(pidx);
          states[pidx] = 'path';
          totalDist += gridData[pidx] === -1 ? 0 : gridData[pidx];
          pathKey = parent.get(pathKey);
        }

        yield {
          type: 'done',
          line: 10,
          message: `是 找到最短路径！总权重 ${d}，长度 ${pathIndices.length} 步`,
          snapshot: gridSnap(gridData, cols, states, start, target),
        };
        return;
      }

      states[idx] = 'visit';

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

        const nidx = nr * cols + nc;
        const nkey = `${nr},${nc}`;

        if (visited.has(nkey) || gridData[nidx] === -1) continue;

        const weight = gridData[nidx];
        const newDist = d + weight;
        const currentDist = dist.get(nkey) ?? Infinity;

        if (newDist < currentDist) {
          dist.set(nkey, newDist);
          parent.set(nkey, key);
          pq.push([newDist, [nr, nc]]);

          yield {
            type: 'compare',
            indices: [nidx],
            line: 14,
            message: `更新 [${nr},${nc}] 距离 ${newDist}（权重 ${weight}）`,
            snapshot: gridSnap(gridData, cols, { ...states, [nidx]: 'compare' }, start, target),
          };
        }
      }
    }

    yield {
      type: 'done',
      line: 22,
      message: '未找到路径，终点不可达',
      snapshot: gridSnap(gridData, cols, states, start, target),
    };
  },
};
