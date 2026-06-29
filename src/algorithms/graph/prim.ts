// ============================================================
// Prim 算法 — 最小生成树
// 从一个顶点开始，逐步扩展 MST
// ============================================================

import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

/** 默认网格大小 */
const DEFAULT_COLS = 8;
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

/** 生成默认数据 */
function generateDefaultData(): number[] {
  const data: number[] = [];
  for (let i = 0; i < DEFAULT_ROWS * DEFAULT_COLS; i++) {
    const rand = Math.random();
    if (rand < 0.1) {
      data.push(-1); // 障碍
    } else {
      data.push(Math.floor(Math.random() * 9) + 1); // 权重 1-9
    }
  }
  return data;
}

export const prim: Algorithm = {
  id: 'prim',
  name: 'Prim',
  category: 'graph',
  complexity: { time: 'O(E log V)', space: 'O(V)' },
  difficulty: 'intermediate',
  tags: ['mst'],
  dataKind: 'grid',
  defaultData: generateDefaultData(),
  codeLines: [
    'function prim(graph) {',
    '  const mst = new Set();',
    '  const key = new Map(); // 到 MST 的最小边',
    '  const parent = new Map();',
    '  key.set(start, 0);',
    '  while (mst.size < V) {',
    '    let u = minKey(key, mst);',
    '    mst.add(u);',
    '    for (const v of neighbors(u)) {',
    '      if (!mst.has(v) && weight(u,v) < key.get(v)) {',
    '        key.set(v, weight(u,v));',
    '        parent.set(v, u);',
    '      }',
    '    }',
    '  }',
    '  return parent;',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const cols = DEFAULT_COLS;
    const rows = DEFAULT_ROWS;
    const start: [number, number] = [0, 0];

    const gridData = [...data];
    const inMST = new Set<string>();
    const key = new Map<string, number>();
    const parent = new Map<string, string>();

    const startKey = `${start[0]},${start[1]}`;
    key.set(startKey, 0);

    const states: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: `开始 Prim 算法，起点 [${start}]`,
      snapshot: gridSnap(gridData, cols, states, start, start),
    };

    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const V = rows * cols;

    while (inMST.size < V && inMST.size < 20) {
      // 限制步数
      // 找最小 key
      let uKey: string | null = null;
      let minKey = Infinity;

      for (const [k, v] of key) {
        if (!inMST.has(k) && v < minKey) {
          minKey = v;
          uKey = k;
        }
      }

      if (!uKey) break;

      const [ur, uc] = uKey.split(',').map(Number);
      const uidx = ur * cols + uc;

      inMST.add(uKey);
      states[uidx] = 'path';

      yield {
        type: 'visit',
        indices: [uidx],
        line: 7,
        message: `加入 MST：[${ur},${uc}]，key=${minKey}`,
        snapshot: gridSnap(gridData, cols, states, start, start),
      };

      // 更新邻居
      for (const [dr, dc] of directions) {
        const nr = ur + dr;
        const nc = uc + dc;

        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

        const nidx = nr * cols + nc;
        const nkey = `${nr},${nc}`;

        if (inMST.has(nkey) || gridData[nidx] === -1) continue;

        const weight = gridData[nidx];
        const currentKey = key.get(nkey) ?? Infinity;

        if (weight < currentKey) {
          key.set(nkey, weight);
          parent.set(nkey, uKey);

          states[nidx] = 'compare';
          yield {
            type: 'compare',
            indices: [nidx],
            line: 10,
            message: `更新 [${nr},${nc}]：key=${weight}`,
            snapshot: gridSnap(gridData, cols, states, start, start),
          };
        }
      }
    }

    // 高亮 MST 边
    for (const [v] of parent) {
      const [vr, vc] = v.split(',').map(Number);
      const vidx = vr * cols + vc;
      states[vidx] = 'sorted';
    }

    yield {
      type: 'done',
      line: 15,
      message: `MST 完成，包含 ${inMST.size} 个顶点`,
      snapshot: gridSnap(gridData, cols, states, start, start),
    };
  },
};
