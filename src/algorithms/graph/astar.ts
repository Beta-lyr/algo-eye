// ============================================================
// A* 算法 — A* Algorithm
// 启发式搜索，在网格中找到起点到终点的最短路径
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

/** 生成默认数据 */
function generateDefaultData(): number[] {
  const data: number[] = [];
  for (let i = 0; i < DEFAULT_ROWS * DEFAULT_COLS; i++) {
    const rand = Math.random();
    if (rand < 0.15) {
      data.push(-1); // 墙
    } else {
      data.push(1); // 默认权重
    }
  }
  data[0] = 1;
  data[DEFAULT_ROWS * DEFAULT_COLS - 1] = 1;
  return data;
}

/** 启发式函数：曼哈顿距离 */
function heuristic(r: number, c: number, target: [number, number]): number {
  return Math.abs(r - target[0]) + Math.abs(c - target[1]);
}

export const astar: Algorithm = {
  id: 'astar',
  name: 'A* 算法',
  category: 'graph',
  complexity: { time: 'O(E)', space: 'O(V)' },
  dataKind: 'grid',
  defaultData: generateDefaultData(),
  codeLines: [
    'function astar(grid, start, target) {',
    '  const gScore = new Map(); // 实际距离',
    '  const fScore = new Map(); // 估计距离',
    '  const parent = new Map();',
    '  const openSet = new Set(); // 待探索',
    '  gScore.set(start, 0);',
    '  fScore.set(start, heuristic(start, target));',
    '  openSet.add(start);',
    '  while (openSet.size > 0) {',
    '    let current = minFScore(openSet, fScore);',
    '    if (current === target) {',
    '      return reconstructPath(parent, target);',
    '    }',
    '    openSet.delete(current);',
    '    for (const neighbor of neighbors(current)) {',
    '      const tentativeG = gScore.get(current) + weight(neighbor);',
    '      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {',
    '        parent.set(neighbor, current);',
    '        gScore.set(neighbor, tentativeG);',
    '        fScore.set(neighbor, tentativeG + heuristic(neighbor, target));',
    '        openSet.add(neighbor);',
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

    const gridData = [...data];
    gridData[0] = 1;
    gridData[rows * cols - 1] = 1;

    // 距离表
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const parent = new Map<string, string>();
    const openSet = new Set<string>();
    const closedSet = new Set<string>();

    const startKey = `${start[0]},${start[1]}`;
    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(start[0], start[1], target));
    openSet.add(startKey);

    const states: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `开始 A* 搜索，起点 [${start}]，终点 [${target}]`,
      snapshot: gridSnap(gridData, cols, states, start, target),
    };

    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (openSet.size > 0) {
      // 找 fScore 最小的节点
      let currentKey: string | null = null;
      let minF = Infinity;
      for (const key of openSet) {
        const f = fScore.get(key) ?? Infinity;
        if (f < minF) {
          minF = f;
          currentKey = key;
        }
      }

      if (!currentKey) break;

      const [r, c] = currentKey.split(',').map(Number);
      const idx = r * cols + c;

      // 高亮当前节点
      states[idx] = 'current';
      yield {
        type: 'visit',
        indices: [idx],
        line: 9,
        message: `探索 [${r},${c}]，g=${gScore.get(currentKey)}，f=${fScore.get(currentKey)}`,
        snapshot: gridSnap(gridData, cols, states, start, target),
      };

      // 到达目标
      if (r === target[0] && c === target[1]) {
        let pathKey: string | undefined = currentKey;
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
          line: 11,
          message: `✓ 找到最短路径！长度 ${pathIndices.length} 步，f=${minF}`,
          snapshot: gridSnap(gridData, cols, states, start, target),
        };
        return;
      }

      openSet.delete(currentKey);
      closedSet.add(currentKey);
      states[idx] = 'visit';

      // 探索邻居
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

        const nidx = nr * cols + nc;
        const nkey = `${nr},${nc}`;

        if (closedSet.has(nkey) || gridData[nidx] === -1) continue;

        const weight = gridData[nidx];
        const tentativeG = (gScore.get(currentKey) ?? Infinity) + weight;
        const currentG = gScore.get(nkey) ?? Infinity;

        if (tentativeG < currentG) {
          parent.set(nkey, currentKey);
          gScore.set(nkey, tentativeG);
          fScore.set(nkey, tentativeG + heuristic(nr, nc, target));
          openSet.add(nkey);

          states[nidx] = 'compare';
          yield {
            type: 'compare',
            indices: [nidx],
            line: 16,
            message: `更新 [${nr},${nc}]：g=${tentativeG}，f=${fScore.get(nkey)}`,
            snapshot: gridSnap(gridData, cols, states, start, target),
          };
        }
      }
    }

    yield {
      type: 'done',
      line: 23,
      message: '未找到路径，终点不可达',
      snapshot: gridSnap(gridData, cols, states, start, target),
    };
  },
};
