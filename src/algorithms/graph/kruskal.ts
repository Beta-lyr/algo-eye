// ============================================================
// Kruskal 算法 — 最小生成树
// 按边权排序，逐步加入不形成环的边
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

/** 并查集 */
class UnionFind {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor() {
    this.parent = new Map();
    this.rank = new Map();
  }

  find(x: string): string {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
    }
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)!));
    }
    return this.parent.get(x)!;
  }

  union(x: string, y: string): boolean {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return false;

    const rx = this.rank.get(px)!;
    const ry = this.rank.get(py)!;

    if (rx < ry) {
      this.parent.set(px, py);
    } else if (rx > ry) {
      this.parent.set(py, px);
    } else {
      this.parent.set(py, px);
      this.rank.set(px, rx + 1);
    }
    return true;
  }
}

export const kruskal: Algorithm = {
  id: 'kruskal',
  name: 'Kruskal',
  category: 'graph',
  complexity: { time: 'O(E log E)', space: 'O(V)' },
  dataKind: 'grid',
  defaultData: generateDefaultData(),
  codeLines: [
    'function kruskal(graph) {',
    '  const edges = getAllEdges(graph);',
    '  edges.sort((a, b) => a.w - b.w);',
    '  const uf = new UnionFind();',
    '  const mst = [];',
    '  for (const [u, v, w] of edges) {',
    '    if (uf.find(u) !== uf.find(v)) {',
    '      uf.union(u, v);',
    '      mst.push([u, v, w]);',
    '    }',
    '  }',
    '  return mst;',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const cols = DEFAULT_COLS;
    const rows = DEFAULT_ROWS;
    const start: [number, number] = [0, 0];

    const gridData = [...data];
    const states: Record<number, ElementState> = {};

    yield {
      type: 'mark',
      line: 1,
      message: '开始 Kruskal 算法',
      snapshot: gridSnap(gridData, cols, states, start, start),
    };

    // 收集所有边
    type Edge = [string, string, number, number, number]; // [uKey, vKey, weight, uIdx, vIdx]
    const edges: Edge[] = [];
    const directions: [number, number][] = [[0, 1], [1, 0]]; // 只取右和下，避免重复

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

          edges.push([uKey, `${nr},${nc}`, gridData[nidx], idx, nidx]);
        }
      }
    }

    yield {
      type: 'pointer',
      line: 2,
      message: `收集 ${edges.length} 条边，开始排序`,
      snapshot: gridSnap(gridData, cols, states, start, start),
    };

    // 按权重排序
    edges.sort((a, b) => a[2] - b[2]);

    yield {
      type: 'pointer',
      line: 3,
      message: '排序完成，开始构建 MST',
      snapshot: gridSnap(gridData, cols, states, start, start),
    };

    // Kruskal 主循环
    const uf = new UnionFind();
    const mstEdges: Edge[] = [];

    for (const [u, v, w, uIdx, vIdx] of edges) {
      // 高亮当前边
      states[uIdx] = 'compare';
      states[vIdx] = 'compare';

      yield {
        type: 'compare',
        indices: [uIdx, vIdx],
        line: 6,
        message: `检查边 [${u}] — [${v}]，权重=${w}`,
        snapshot: gridSnap(gridData, cols, states, start, start),
      };

      if (uf.find(u) !== uf.find(v)) {
        uf.union(u, v);
        mstEdges.push([u, v, w, uIdx, vIdx]);

        states[uIdx] = 'path';
        states[vIdx] = 'path';

        yield {
          type: 'set',
          line: 8,
          message: `加入 MST：[${u}] — [${v}]，权重=${w}，MST 大小=${mstEdges.length}`,
          snapshot: gridSnap(gridData, cols, states, start, start),
        };
      } else {
        states[uIdx] = 'swap';
        states[vIdx] = 'swap';

        yield {
          type: 'compare',
          line: 7,
          message: `跳过：会形成环`,
          snapshot: gridSnap(gridData, cols, states, start, start),
        };

        states[uIdx] = 'visit';
        states[vIdx] = 'visit';
      }

      // 如果 MST 已包含足够边，提前结束
      if (mstEdges.length >= rows * cols - 1) break;
    }

    // 高亮 MST
    for (const [, , , uIdx, vIdx] of mstEdges) {
      states[uIdx] = 'sorted';
      states[vIdx] = 'sorted';
    }

    yield {
      type: 'done',
      line: 12,
      message: `MST 完成，包含 ${mstEdges.length} 条边`,
      snapshot: gridSnap(gridData, cols, states, start, start),
    };
  },
};
