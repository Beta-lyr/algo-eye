import type { PlaygroundInput } from './protocol';

export interface PlaygroundExample {
  id: string;
  title: string;
  description: string;
  dataKind: 'array' | 'string' | 'grid';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  input: PlaygroundInput;
  code: string;
}

export function generateGridData(rows: number, cols: number, wallRatio: number): number[] {
  const data: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      data.push(isBorder ? 0 : Math.random() < wallRatio ? -1 : 0);
    }
  }
  return data;
}

// ===== 示例代码 =====

const BUBBLE_CODE = `const n = viz.length;
for (let i = 0; i < n - 1; i++) {
  for (let j = 0; j < n - i - 1; j++) {
    viz.compare(j, j + 1);
    if (viz.value(j) > viz.value(j + 1)) {
      viz.swap(j, j + 1);
    }
  }
  viz.mark(n - 1 - i, 'sorted');
}
viz.done();`;

const SELECTION_CODE = `const n = viz.length;
for (let i = 0; i < n - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < n; j++) {
    viz.compare(minIdx, j);
    if (viz.value(j) < viz.value(minIdx)) {
      minIdx = j;
    }
  }
  if (minIdx !== i) {
    viz.swap(i, minIdx);
  }
  viz.mark(i, 'sorted');
}
viz.done();`;

const INSERTION_CODE = `const n = viz.length;
for (let i = 1; i < n; i++) {
  let j = i;
  while (j > 0) {
    viz.compare(j, j - 1);
    if (viz.value(j) < viz.value(j - 1)) {
      viz.swap(j, j - 1);
      j--;
    } else {
      break;
    }
  }
}
for (let i = 0; i < n; i++) viz.mark(i, 'sorted');
viz.done();`;

const BINARY_SEARCH_CODE = `const target = 54;
let lo = 0, hi = viz.length - 1;
let found = false;
while (lo <= hi) {
  const mid = Math.floor((lo + hi) / 2);
  viz.compare(mid, mid);
  viz.visit(mid);
  if (viz.value(mid) === target) {
    found = true;
    viz.mark(mid, 'sorted');
    break;
  } else if (viz.value(mid) < target) {
    lo = mid + 1;
  } else {
    hi = mid - 1;
  }
}
viz.log(found ? 'Found target' : 'Not found');
viz.done();`;

const NAIVE_STRING_CODE = `const n = viz.textLength;
const m = viz.patternLength;
let found = false;

for (let i = 0; i <= n - m; i++) {
  let match = true;
  for (let j = 0; j < m; j++) {
    viz.markText(i + j, 'compare');
    viz.markPattern(j, 'compare');
    if (viz.textCharAt(i + j) !== viz.patternCharAt(j)) {
      viz.markPattern(j, 'mismatch');
      match = false;
      break;
    }
    viz.markPattern(j, 'match');
  }
  if (match) {
    for (let k = 0; k < m; k++) viz.markText(i + k, 'match');
    found = true;
    viz.log(\`Match at position \${i}\`);
  }
}
if (!found) viz.log('No match');
viz.done();`;

const KMP_CODE = `const n = viz.textLength;
const m = viz.patternLength;

// Build LPS (partial match table)
const lps = new Array(m).fill(0);
let len = 0;
let i = 1;
while (i < m) {
  viz.markPattern(i, 'compare');
  viz.markPattern(len, 'compare');
  if (viz.patternCharAt(i) === viz.patternCharAt(len)) {
    len++;
    lps[i] = len;
    viz.markPattern(i, 'match');
    i++;
  } else {
    if (len !== 0) {
      len = lps[len - 1];
    } else {
      lps[i] = 0;
      viz.markPattern(i, 'mismatch');
      i++;
    }
  }
}
viz.log('LPS built');

// Search
let j = 0;
i = 0;
let found = false;
while (i < n) {
  viz.markText(i, 'compare');
  viz.markPattern(j, 'compare');
  if (viz.patternCharAt(j) === viz.textCharAt(i)) {
    viz.markText(i, 'match');
    viz.markPattern(j, 'match');
    i++;
    j++;
  }
  if (j === m) {
    found = true;
    for (let k = 0; k < m; k++) viz.markText(i - m + k, 'match');
    viz.log(\`Match at position \${i - j}\`);
    j = lps[j - 1];
  } else if (i < n && viz.patternCharAt(j) !== viz.textCharAt(i)) {
    viz.markPattern(j, 'mismatch');
    if (j !== 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
}
if (!found) viz.log('No match');
viz.done();`;

const BFS_GRID_CODE = `const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];
const R = viz.rows;
const C = viz.cols;

const queue = [[0, 0]];
const visited = new Set();
visited.add(viz.index(0, 0));
viz.visitCell(0, 0);

let found = false;
while (queue.length > 0) {
  const [r, c] = queue.shift();
  if (r === R - 1 && c === C - 1) { found = true; break; }

  for (let d = 0; d < 4; d++) {
    const nr = r + dr[d];
    const nc = c + dc[d];
    if (!viz.inBounds(nr, nc)) continue;
    if (viz.cellValue(nr, nc) === -1) continue;
    const idx = viz.index(nr, nc);
    if (visited.has(idx)) continue;
    visited.add(idx);
    viz.visitCell(nr, nc);
    queue.push([nr, nc]);
  }
}

if (found) {
  viz.markCell(R - 1, C - 1, 'path');
  viz.log('Path found!');
} else {
  viz.log('No path');
}
viz.done();`;

const DFS_GRID_CODE = `const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];
const R = viz.rows;
const C = viz.cols;

const stack = [[0, 0]];
const visited = new Set();
visited.add(viz.index(0, 0));
viz.visitCell(0, 0);

let found = false;
while (stack.length > 0) {
  const [r, c] = stack.pop();
  if (r === R - 1 && c === C - 1) { found = true; break; }

  for (let d = 0; d < 4; d++) {
    const nr = r + dr[d];
    const nc = c + dc[d];
    if (!viz.inBounds(nr, nc)) continue;
    if (viz.cellValue(nr, nc) === -1) continue;
    const idx = viz.index(nr, nc);
    if (visited.has(idx)) continue;
    visited.add(idx);
    viz.visitCell(nr, nc);
    stack.push([nr, nc]);
  }
}

if (found) {
  viz.markCell(R - 1, C - 1, 'path');
  viz.log('Path found!');
} else {
  viz.log('No path');
}
viz.done();`;

export const BUBBLE_TEMPLATE = BUBBLE_CODE;

export const EXAMPLES: PlaygroundExample[] = [
  {
    id: 'bubble',
    title: '冒泡排序',
    description: '逐趟比较相邻元素，将最大元素冒泡至末尾',
    dataKind: 'array',
    difficulty: 'easy',
    tags: ['sorting'],
    input: { kind: 'array', data: [42, 68, 35, 91, 27, 54, 73, 48] },
    code: BUBBLE_CODE,
  },
  {
    id: 'selection-sort',
    title: '选择排序',
    description: '每轮选出未排序部分的最小元素，交换到正确位置',
    dataKind: 'array',
    difficulty: 'easy',
    tags: ['sorting'],
    input: { kind: 'array', data: [29, 10, 14, 37, 13, 33] },
    code: SELECTION_CODE,
  },
  {
    id: 'insertion-sort',
    title: '插入排序',
    description: '将元素逐个插入到已排序部分的正确位置',
    dataKind: 'array',
    difficulty: 'easy',
    tags: ['sorting'],
    input: { kind: 'array', data: [12, 11, 13, 5, 6] },
    code: INSERTION_CODE,
  },
  {
    id: 'binary-search',
    title: '二分查找',
    description: '在有序数组中用分治法查找目标值 54',
    dataKind: 'array',
    difficulty: 'medium',
    tags: ['searching'],
    input: { kind: 'array', data: [12, 23, 27, 35, 42, 54, 68, 73, 85, 91] },
    code: BINARY_SEARCH_CODE,
  },
  {
    id: 'naive-string',
    title: '朴素字符串匹配',
    description: '暴力枚举所有起始位置进行匹配',
    dataKind: 'string',
    difficulty: 'medium',
    tags: ['string', 'matching'],
    input: { kind: 'string', text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
    code: NAIVE_STRING_CODE,
  },
  {
    id: 'kmp',
    title: 'KMP 字符串匹配',
    description: '利用部分匹配表避免回溯，O(n+m) 线性时间',
    dataKind: 'string',
    difficulty: 'hard',
    tags: ['string', 'matching'],
    input: { kind: 'string', text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
    code: KMP_CODE,
  },
  {
    id: 'bfs-grid',
    title: 'BFS 最短路径',
    description: '广度优先搜索在无权重网格中找最短路径',
    dataKind: 'grid',
    difficulty: 'medium',
    tags: ['graph', 'pathfinding'],
    input: {
      kind: 'grid',
      data: generateGridData(8, 8, 0.2),
      cols: 8,
      start: [0, 0],
      target: [7, 7],
    },
    code: BFS_GRID_CODE,
  },
  {
    id: 'dfs-maze',
    title: 'DFS 迷宫搜索',
    description: '深度优先搜索探索迷宫，使用栈代替队列',
    dataKind: 'grid',
    difficulty: 'medium',
    tags: ['graph', 'pathfinding'],
    input: {
      kind: 'grid',
      data: generateGridData(8, 8, 0.2),
      cols: 8,
      start: [0, 0],
      target: [7, 7],
    },
    code: DFS_GRID_CODE,
  },
];
