import type { PlaygroundInput } from './protocol';

export const BUBBLE_TEMPLATE = `// 用 viz API 录制排序过程
// 可用：viz.compare / viz.swap / viz.set / viz.mark / viz.pointer / viz.visit / viz.log / viz.done
// 读取：viz.value(i) / viz.length
const n = viz.length;
for (let i = 0; i < n - 1; i++) {
  for (let j = 0; j < n - i - 1; j++) {
    viz.compare(j, j + 1);
    if (viz.value(j) > viz.value(j + 1)) {
      viz.swap(j, j + 1);
    }
  }
  viz.mark(n - 1 - i, 'sorted');
}
viz.done();
`;

export const NAIVE_STRING_TEMPLATE = `// 朴素字符串匹配
// viz.setText / viz.setPattern（已从输入初始化，不必须写）
// viz.markText / viz.markPattern / viz.textCharAt / viz.patternCharAt
const n = viz.textLength;
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
    viz.log(\`找到匹配于位置 \${i}\`);
  }
}
if (!found) viz.log('未找到匹配');
viz.done();
`;

export const KMP_TEMPLATE = `// KMP 字符串匹配（部分匹配表 + 搜索）
const n = viz.textLength;
const m = viz.patternLength;

// 构建部分匹配表（lps）
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
viz.log('部分匹配表构建完成');

// 搜索
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
    viz.log(\`找到匹配于位置 \${i - j}\`);
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
if (!found) viz.log('未找到匹配');
viz.done();
`;

export const BFS_GRID_TEMPLATE = `// BFS 最短路径
// 网格在输入中已初始化，viz.rows / viz.cols 可用
// viz.visitCell / viz.markCell / viz.cellValue / viz.index
// viz.inBounds / viz.setStart / viz.setTarget / viz.setCols

const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];
const R = viz.rows;
const C = viz.cols;

// 找起点和终点（取输入中设置的或默认 0,0 和 R-1,C-1）
let sr = 0, sc = 0, tr = R - 1, tc = C - 1;

const queue = [[sr, sc]];
const visited = new Set();
visited.add(viz.index(sr, sc));
viz.visitCell(sr, sc);

let found = false;
while (queue.length > 0) {
  const [r, c] = queue.shift();
  if (r === tr && c === tc) { found = true; break; }

  for (let d = 0; d < 4; d++) {
    const nr = r + dr[d];
    const nc = c + dc[d];
    if (!viz.inBounds(nr, nc)) continue;
    if (viz.cellValue(nr, nc) === -1) continue;  // 墙
    const idx = viz.index(nr, nc);
    if (visited.has(idx)) continue;
    visited.add(idx);
    viz.visitCell(nr, nc);
    queue.push([nr, nc]);
  }
}

if (found) {
  viz.markCell(tr, tc, 'path');
  viz.log('找到路径！');
} else {
  viz.log('无路径可达');
}
viz.done();
`;

export interface CodeTemplate {
  id: string;
  label: string;
  code: string;
  input: PlaygroundInput;
}

export const TEMPLATES: CodeTemplate[] = [
  {
    id: 'bubble',
    label: '冒泡排序',
    code: BUBBLE_TEMPLATE,
    input: { kind: 'array', data: [42, 68, 35, 91, 27, 54, 73, 48] },
  },
  {
    id: 'naive-string',
    label: '朴素字符串匹配',
    code: NAIVE_STRING_TEMPLATE,
    input: { kind: 'string', text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
  },
  {
    id: 'kmp',
    label: 'KMP 字符串匹配',
    code: KMP_TEMPLATE,
    input: { kind: 'string', text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
  },
  {
    id: 'bfs-grid',
    label: 'BFS 最短路径',
    code: BFS_GRID_TEMPLATE,
    input: { kind: 'grid', data: generateGridData(8, 8, 0.2), cols: 8, start: [0, 0], target: [7, 7] },
  },
];

function generateGridData(rows: number, cols: number, wallRatio: number): number[] {
  const data: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      data.push(isBorder ? 0 : Math.random() < wallRatio ? -1 : 0);
    }
  }
  return data;
}
