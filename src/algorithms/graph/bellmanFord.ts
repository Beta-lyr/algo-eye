// ============================================================
// Bellman-Ford 算法
// 在带负权边的图中找到最短路径
// ============================================================

import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

/** 默认网格大小 */
const DEFAULT_COLS = 10;
const DEFAULT_ROWS = 6;

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

/** 生成默认数据（带负权边） */
function generateDefaultData(): number[] {
  const data: number[] = [];
  for (let i = 0; i < DEFAULT_ROWS * DEFAULT_COLS; i++) {
    const rand = Math.random();
    if (rand < 0.15) {
      data.push(-1); // 墙
    } else if (rand < 0.25) {
      data.push(-2); // 负权边
    } else if (rand < 0.4) {
      data.push(Math.floor(Math.random() * 3) + 2); // 正权边 2-4
    } else {
      data.push(1); // 默认权重
    }
  }
  data[0] = 1;
  data[DEFAULT_ROWS * DEFAULT_COLS - 1] = 1;
  return data;
}

export const bellmanFord: Algorithm = {
  id: 'bellman-ford',
  name: 'Bellman-Ford',
  category: 'graph',
  complexity: { time: 'O(VE)', space: 'O(V)' },
  difficulty: 'advanced',
  tags: ['shortest-path'],
  relatedAlgorithms: ['dijkstra', 'floyd-warshall'],
  dataKind: 'grid',
  defaultData: generateDefaultData(),
  codeLines: [
    'function bellmanFord(graph, start) {',
    '  const dist = new Map();',
    '  dist.set(start, 0);',
    '  // 松弛 V-1 次',
    '  for (let i = 0; i < V - 1; i++) {',
    '    for (const [u, v, w] of edges) {',
    '      if (dist.get(u) + w < (dist.get(v) ?? Infinity)) {',
    '        dist.set(v, dist.get(u) + w);',
    '      }',
    '    }',
    '  }',
    '  // 检测负权环',
    '  for (const [u, v, w] of edges) {',
    '    if (dist.get(u) + w < dist.get(v)) {',
    '      throw new Error("负权环");',
    '    }',
    '  }',
    '  return dist;',
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

    const dist = new Map<string, number>();
    const parent = new Map<string, string>();
    const startKey = `${start[0]},${start[1]}`;
    dist.set(startKey, 0);

    const states: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `开始 Bellman-Ford，起点 [${start}]，终点 [${target}]`,
      snapshot: gridSnap(gridData, cols, states, start, target),
    };

    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const edges: [string, string, number][] = [];

    // 收集所有边
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (gridData[idx] === -1) continue;
        const uKey = `${r},${c}`;

        for (const [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          const nidx = nr * cols + nc;
          if (gridData[nidx] === -1) continue;

          edges.push([uKey, `${nr},${nc}`, gridData[nidx]]);
        }
      }
    }

    yield {
      type: 'pointer',
      line: 4,
      message: `收集 ${edges.length} 条边，开始松弛`,
      snapshot: gridSnap(gridData, cols, states, start, target),
    };

    // 松弛 V-1 次
    const V = rows * cols;
    for (let i = 0; i < V - 1; i++) {
      let updated = false;

      yield {
        type: 'pointer',
        line: 5,
        message: `第 ${i + 1} 轮松弛`,
        snapshot: gridSnap(gridData, cols, states, start, target),
      };

      for (const [u, v, w] of edges) {
        const uDist = dist.get(u) ?? Infinity;
        const vDist = dist.get(v) ?? Infinity;

        if (uDist + w < vDist) {
          dist.set(v, uDist + w);
          parent.set(v, u);
          updated = true;

          const [vr, vc] = v.split(',').map(Number);
          const vidx = vr * cols + vc;

          states[vidx] = w < 0 ? 'swap' : 'compare';
          yield {
            type: 'compare',
            indices: [vidx],
            line: 7,
            message: `松弛 [${u}] → [${v}]：${uDist} + ${w} = ${uDist + w} < ${vDist}`,
            snapshot: gridSnap(gridData, cols, states, start, target),
          };
        }
      }

      if (!updated) {
        yield {
          type: 'mark',
          line: 10,
          message: `第 ${i + 1} 轮无更新，提前结束`,
          snapshot: gridSnap(gridData, cols, states, start, target),
        };
        break;
      }
    }

    // 检查目标
    const targetKey = `${target[0]},${target[1]}`;
    const targetDist = dist.get(targetKey);

    if (targetDist !== undefined && targetDist < Infinity) {
      // 回溯路径
      let pathKey: string | undefined = targetKey;
      while (pathKey) {
        const [pr, pc] = pathKey.split(',').map(Number);
        const pidx = pr * cols + pc;
        states[pidx] = 'path';
        pathKey = parent.get(pathKey);
      }

      yield {
        type: 'done',
        line: 17,
        message: `是 最短路径距离 = ${targetDist}`,
        snapshot: gridSnap(gridData, cols, states, start, target),
      };
    } else {
      yield {
        type: 'done',
        line: 17,
        message: '未找到路径，终点不可达',
        snapshot: gridSnap(gridData, cols, states, start, target),
      };
    }
  },
};
