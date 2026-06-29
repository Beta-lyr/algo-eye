// ============================================================
// 广度优先搜索 — BFS (Breadth-First Search)
// 在网格中从起点到终点的最短路径（无权图）
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

/** 生成默认数据（带一些随机墙） */
function generateDefaultData(): number[] {
  const data: number[] = [];
  for (let i = 0; i < DEFAULT_ROWS * DEFAULT_COLS; i++) {
    // 约 20% 的概率生成墙
    data.push(Math.random() < 0.2 ? -1 : 0);
  }
  // 确保起点和终点不是墙
  const startIdx = 0;
  const targetIdx = DEFAULT_ROWS * DEFAULT_COLS - 1;
  data[startIdx] = 0;
  data[targetIdx] = 0;
  return data;
}

export const bfs: Algorithm = {
  id: 'bfs',
  name: '广度优先搜索',
  category: 'graph',
  complexity: { time: 'O(V+E)', space: 'O(V)' },
  difficulty: 'beginner',
  tags: ['traversal', 'shortest-path'],
  dataKind: 'grid',
  defaultData: generateDefaultData(),
  codeLines: [
    'function bfs(grid, start, target) {',
    '  const queue = [start];',
    '  const visited = new Set();',
    '  const parent = new Map();',
    '  visited.add(start);',
    '  while (queue.length > 0) {',
    '    const [r, c] = queue.shift();',
    '    if (r === target[0] && c === target[1]) {',
    '      return reconstructPath(parent, target);',
    '    }',
    '    for (const [nr, nc] of neighbors(r, c)) {',
    '      if (!visited.has([nr,nc]) && grid[nr][nc] !== -1) {',
    '        visited.add([nr, nc]);',
    '        parent.set([nr,nc], [r,c]);',
    '        queue.push([nr, nc]);',
    '      }',
    '    }',
    '  }',
    '  return null; // 无路径',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const cols = DEFAULT_COLS;
    const rows = DEFAULT_ROWS;
    const start: [number, number] = [0, 0];
    const target: [number, number] = [rows - 1, cols - 1];

    // 确保起点终点不是墙
    const gridData = [...data];
    gridData[0] = 0;
    gridData[rows * cols - 1] = 0;

    const visited = new Set<string>();
    const parent = new Map<string, string>();
    const queue: [number, number][] = [start];
    const startKey = `${start[0]},${start[1]}`;
    visited.add(startKey);

    const states: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `开始 BFS，起点 [${start}]，终点 [${target}]`,
      snapshot: gridSnap(gridData, cols, states, start, target),
    };

    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const idx = r * cols + c;

      yield {
        type: 'visit',
        indices: [idx],
        line: 6,
        message: `访问节点 [${r},${c}]，队列长度 ${queue.length}`,
        snapshot: gridSnap(gridData, cols, { ...states, [idx]: 'current' }, start, target),
      };

      // 检查是否到达终点
      if (r === target[0] && c === target[1]) {
        // 重构路径
        let pathKey: string | undefined = `${target[0]},${target[1]}`;
        const pathIndices: number[] = [];

        while (pathKey) {
          const [pr, pc] = pathKey.split(',').map(Number);
          const pidx = pr * cols + pc;
          pathIndices.push(pidx);
          states[pidx] = 'path';
          pathKey = parent.get(pathKey);
        }

        yield {
          type: 'done',
          line: 8,
          message: `✓ 找到最短路径！长度 ${pathIndices.length} 步`,
          snapshot: gridSnap(gridData, cols, states, start, target),
        };
        return;
      }

      // 标记为已访问
      states[idx] = 'visit';

      // 探索邻居
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

        const nidx = nr * cols + nc;
        const nkey = `${nr},${nc}`;

        if (visited.has(nkey) || gridData[nidx] === -1) continue;

        visited.add(nkey);
        parent.set(nkey, `${r},${c}`);
        queue.push([nr, nc]);

        yield {
          type: 'compare',
          indices: [nidx],
          line: 11,
          message: `发现邻居 [${nr},${nc}]，加入队列`,
          snapshot: gridSnap(gridData, cols, { ...states, [nidx]: 'compare' }, start, target),
        };
      }
    }

    yield {
      type: 'done',
      line: 17,
      message: '未找到路径，终点不可达',
      snapshot: gridSnap(gridData, cols, states, start, target),
    };
  },
};
