// ============================================================
// Rabin-Karp 字符串匹配
// 使用滚动哈希进行匹配
// ============================================================

import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

function snap(
  text: string,
  pattern: string,
  textStates: Record<number, ElementState>,
  patternStates: Record<number, ElementState>,
): Snapshot {
  return {
    kind: 'string',
    data: [],
    states: {},
    text,
    pattern,
    textStates,
    patternStates,
  };
}

export const rabinKarp: Algorithm = {
  id: 'rabin-karp',
  name: 'Rabin-Karp',
  category: 'string',
  complexity: { time: 'O(n+m)', space: 'O(1)' },
  difficulty: 'intermediate',
  tags: ['pattern-matching'],
  relatedAlgorithms: ['kmp', 'boyer-moore'],
  dataKind: 'string',
  defaultData: [],
  codeLines: [
    'function rabinKarp(text, pattern) {',
    '  let n = text.length, m = pattern.length;',
    '  let d = 256, q = 101; // d=字符集大小，q=素数',
    '  let h = Math.pow(d, m - 1) % q;',
    '  let p = 0, t = 0; // 模式和文本的哈希值',
    '  for (let i = 0; i < m; i++) {',
    '    p = (d * p + pattern.charCodeAt(i)) % q;',
    '    t = (d * t + text.charCodeAt(i)) % q;',
    '  }',
    '  for (let i = 0; i <= n - m; i++) {',
    '    if (p === t) { // 哈希匹配',
    '      let match = true;',
    '      for (let j = 0; j < m; j++) {',
    '        if (text[i + j] !== pattern[j]) {',
    '          match = false; break;',
    '        }',
    '      }',
    '      if (match) return i; // 找到匹配',
    '    }',
    '    if (i < n - m) {',
    '      t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;',
    '      if (t < 0) t += q;',
    '    }',
    '  }',
    '  return -1; // 未找到',
    '}',
  ],

  *generate(_data: number[]): Generator<Step> {
    const text = 'ABABDABACDABABCABAB';
    const pattern = 'ABABCABAB';
    const n = text.length;
    const m = pattern.length;
    const d = 256;
    const q = 101;
    const h = Math.pow(d, m - 1) % q;

    yield {
      type: 'mark',
      line: 1,
      message: `开始 Rabin-Karp 搜索，文本="${text}"，模式="${pattern}"`,
      snapshot: snap(text, pattern, {}, {}),
    };

    // 计算初始哈希值
    let p = 0;
    let t = 0;

    for (let i = 0; i < m; i++) {
      p = (d * p + pattern.charCodeAt(i)) % q;
      t = (d * t + text.charCodeAt(i)) % q;

      yield {
        type: 'set',
        indices: [i],
        line: 6,
        message: `计算哈希：pattern[${i}]='${pattern[i]}'，hash=${p}`,
        snapshot: snap(text, pattern, (() => {
          const s: Record<number, ElementState> = {};
          for (let k = 0; k <= i; k++) s[k] = 'compare';
          return s;
        })(), (() => {
          const s: Record<number, ElementState> = {};
          for (let k = 0; k <= i; k++) s[k] = 'compare';
          return s;
        })()),
      };
    }

    yield {
      type: 'mark',
      line: 5,
      message: `初始哈希：pattern=${p}，text[0..${m - 1}]=${t}`,
      snapshot: snap(text, pattern, {}, (() => {
        const s: Record<number, ElementState> = {};
        for (let k = 0; k < m; k++) s[k] = 'sorted';
        return s;
      })()),
    };

    // 滑动窗口搜索
    for (let i = 0; i <= n - m; i++) {
      const textStates: Record<number, ElementState> = {};
      const patternStates: Record<number, ElementState> = {};

      // 标记已访问的位置
      for (let k = 0; k < i; k++) textStates[k] = 'visit';

      // 标记当前窗口
      for (let k = i; k < i + m; k++) textStates[k] = 'compare';
      for (let k = 0; k < m; k++) patternStates[k] = 'compare';

      yield {
        type: 'compare',
        indices: [i],
        line: 10,
        message: `窗口 [${i}..${i + m - 1}]：text hash=${t}，pattern hash=${p}`,
        snapshot: snap(text, pattern, textStates, patternStates),
      };

      if (p === t) {
        // 哈希匹配，逐字符验证
        yield {
          type: 'pointer',
          indices: [i],
          line: 11,
          message: `哈希匹配！开始逐字符验证`,
          snapshot: snap(text, pattern, textStates, patternStates),
        };

        let match = true;
        for (let j = 0; j < m; j++) {
          if (text[i + j] !== pattern[j]) {
            match = false;

            textStates[i + j] = 'swap';
            patternStates[j] = 'swap';

            yield {
              type: 'compare',
              indices: [i + j],
              line: 14,
              message: `验证失败：text[${i + j}]='${text[i + j]}' ≠ pattern[${j}]='${pattern[j]}'`,
              snapshot: snap(text, pattern, textStates, patternStates),
            };
            break;
          } else {
            textStates[i + j] = 'path';
            patternStates[j] = 'path';

            yield {
              type: 'compare',
              indices: [i + j],
              line: 13,
              message: `验证：text[${i + j}]='${text[i + j]}' === pattern[${j}]='${pattern[j]}'`,
              snapshot: snap(text, pattern, textStates, patternStates),
            };
          }
        }

        if (match) {
          // 找到匹配
          const matchTextStates: Record<number, ElementState> = {};
          for (let k = i; k < i + m; k++) matchTextStates[k] = 'path';

          yield {
            type: 'mark',
            indices: [i],
            line: 18,
            message: `是 找到匹配！位置=${i}`,
            snapshot: snap(text, pattern, matchTextStates, (() => {
              const s: Record<number, ElementState> = {};
              for (let k = 0; k < m; k++) s[k] = 'path';
              return s;
            })()),
          };

          yield {
            type: 'done',
            indices: [i],
            line: 18,
            message: `搜索完成，模式在位置 ${i} 处匹配`,
            snapshot: snap(text, pattern, matchTextStates, (() => {
              const s: Record<number, ElementState> = {};
              for (let k = 0; k < m; k++) s[k] = 'path';
              return s;
            })()),
          };
          return;
        }
      }

      // 计算下一个窗口的哈希值
      if (i < n - m) {
        const oldT = t;
        t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
        if (t < 0) t += q;

        yield {
          type: 'set',
          indices: [i],
          line: 21,
          message: `滚动哈希：移除'${text[i]}'，添加'${text[i + m]}'，hash=${oldT}→${t}`,
          snapshot: snap(text, pattern, textStates, patternStates),
        };
      }
    }

    // 未找到
    yield {
      type: 'done',
      line: 25,
      message: '搜索完成，未找到匹配',
      snapshot: snap(text, pattern, {}, {}),
    };
  },
};
