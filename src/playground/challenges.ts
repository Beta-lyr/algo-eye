import type { Step } from '../engine/types';
import type { PlaygroundInput } from './protocol';

export interface ChallengeResult {
  passed: boolean;
  message: string;
}

export interface PlaygroundChallenge {
  id: string;
  title: string;
  description: string;
  dataKind: 'array' | 'string' | 'grid';
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode: string;
  input: PlaygroundInput;
  validate: (steps: Step[]) => ChallengeResult;
}

function isSorted(data: number[]): boolean {
  for (let i = 1; i < data.length; i++) {
    if (data[i] < data[i - 1]) return false;
  }
  return true;
}

function lastSnapshot(steps: Step[]) {
  return steps[steps.length - 1]?.snapshot;
}

const BUBBLE_STARTER = `const n = viz.length;
for (let i = 0; i < n - 1; i++) {
  for (let j = 0; j < n - i - 1; j++) {
    // 补全代码
  }
}
viz.done();`;

const SELECTION_STARTER = `const n = viz.length;
for (let i = 0; i < n - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < n; j++) {
    // 补全代码
  }
  // 交换 minIdx 和 i
}
viz.done();`;

const LINEAR_SEARCH_STARTER = `const target = 54;
const n = viz.length;
for (let i = 0; i < n; i++) {
  // 补全代码
}
viz.done();`;

const NAIVE_STRING_STARTER = `const n = viz.textLength;
const m = viz.patternLength;
for (let i = 0; i <= n - m; i++) {
  let match = true;
  for (let j = 0; j < m; j++) {
    // 补全代码
  }
  if (match) {
    // 标记匹配
  }
}
viz.done();`;

const BFS_STARTER = `const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];
const R = viz.rows;
const C = viz.cols;

const queue = [[0, 0]];
const visited = new Set();
visited.add(viz.index(0, 0));
viz.visitCell(0, 0);

while (queue.length > 0) {
  const [r, c] = queue.shift();
  // 补全代码
}
viz.done();`;

export const CHALLENGES: PlaygroundChallenge[] = [
  {
    id: 'challenge-bubble',
    title: '冒泡排序',
    description: '用 viz API 实现冒泡排序，将数组升序排列',
    dataKind: 'array',
    difficulty: 'easy',
    starterCode: BUBBLE_STARTER,
    input: { kind: 'array', data: [42, 68, 35, 91, 27, 54, 73, 48] },
    validate: (steps) => {
      const snap = lastSnapshot(steps);
      if (!snap || snap.kind !== 'array' || !snap.data) {
        return { passed: false, message: '未获取到最终数据' };
      }
      const pass = isSorted(snap.data);
      return { passed: pass, message: pass ? '数组已正确排序' : '数组未完全排序' };
    },
  },
  {
    id: 'challenge-selection',
    title: '选择排序',
    description: '用 viz API 实现选择排序，将数组升序排列',
    dataKind: 'array',
    difficulty: 'easy',
    starterCode: SELECTION_STARTER,
    input: { kind: 'array', data: [29, 10, 14, 37, 13, 33] },
    validate: (steps) => {
      const snap = lastSnapshot(steps);
      if (!snap || snap.kind !== 'array' || !snap.data) {
        return { passed: false, message: '未获取到最终数据' };
      }
      const pass = isSorted(snap.data);
      return { passed: pass, message: pass ? '数组已正确排序' : '数组未完全排序' };
    },
  },
  {
    id: 'challenge-linear-search',
    title: '线性查找',
    description: '用 viz API 在数组中查找目标值 54，标记找到的位置',
    dataKind: 'array',
    difficulty: 'easy',
    starterCode: LINEAR_SEARCH_STARTER,
    input: { kind: 'array', data: [42, 68, 35, 91, 27, 54, 73, 48] },
    validate: (steps) => {
      const snap = lastSnapshot(steps);
      if (!snap) return { passed: false, message: '未获取到最终快照' };
      const states = snap.states || {};
      const hasMatch = Object.values(states).some((s) => s === 'sorted' || s === 'match');
      return {
        passed: hasMatch,
        message: hasMatch ? '已标记目标元素' : '未标记目标元素（请使用 viz.mark 标记）',
      };
    },
  },
  {
    id: 'challenge-naive-string',
    title: '朴素字符串匹配',
    description: '实现朴素字符串匹配，在文本中找到模式串 ABABCABAB',
    dataKind: 'string',
    difficulty: 'medium',
    starterCode: NAIVE_STRING_STARTER,
    input: { kind: 'string', text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
    validate: (steps) => {
      const snap = lastSnapshot(steps);
      if (!snap) return { passed: false, message: '未获取到最终快照' };
      const textStates = snap.textStates || {};
      const hasMatch = Object.values(textStates).some((s) => s === 'match' || s === 'path');
      return {
        passed: hasMatch,
        message: hasMatch ? '找到了匹配位置' : '未标记匹配位置（请使用 viz.markText 标记）',
      };
    },
  },
  {
    id: 'challenge-bfs',
    title: 'BFS 最短路径',
    description: '在网格中用 BFS 找从左上角到右下角的最短路径',
    dataKind: 'grid',
    difficulty: 'medium',
    starterCode: BFS_STARTER,
    input: {
      kind: 'grid',
      data: [
        0, 0, 0, -1, 0, 0,
        0, -1, 0, -1, 0, 0,
        0, -1, 0, 0, 0, -1,
        0, 0, 0, -1, 0, 0,
        0, -1, -1, 0, 0, 0,
        0, 0, 0, 0, -1, 0,
      ],
      cols: 6,
      start: [0, 0],
      target: [5, 5],
    },
    validate: (steps) => {
      const snap = lastSnapshot(steps);
      if (!snap) return { passed: false, message: '未获取到最终快照' };
      const states = snap.states || {};
      const hasPath = Object.values(states).includes('path');
      return {
        passed: hasPath,
        message: hasPath ? '找到最短路径' : '未标记路径（请使用 viz.markCell 标记）',
      };
    },
  },
];
