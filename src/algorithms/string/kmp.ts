// ============================================================
// KMP 字符串匹配 — Knuth-Morris-Pratt
// 利用前缀函数避免回溯
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

export const kmp: Algorithm = {
  id: 'kmp',
  name: 'KMP',
  category: 'string',
  complexity: { time: 'O(n+m)', space: 'O(m)' },
  difficulty: 'advanced',
  tags: ['pattern-matching'],
  relatedAlgorithms: ['rabin-karp', 'boyer-moore'],
  dataKind: 'string',
  defaultData: [],
  codeLines: [
    'function kmp(text, pattern) {',
    '  let lps = computeLPS(pattern);',
    '  let i = 0, j = 0;',
    '  while (i < text.length) {',
    '    if (text[i] === pattern[j]) {',
    '      i++; j++;',
    '    }',
    '    if (j === pattern.length) {',
    '      return i - j; // 找到匹配',
    '    } else if (i < text.length && text[i] !== pattern[j]) {',
    '      if (j !== 0) j = lps[j - 1];',
    '      else i++;',
    '    }',
    '  }',
    '  return -1; // 未找到',
    '}',
    'function computeLPS(pattern) {',
    '  let lps = new Array(pattern.length).fill(0);',
    '  let len = 0, i = 1;',
    '  while (i < pattern.length) {',
    '    if (pattern[i] === pattern[len]) {',
    '      len++; lps[i] = len; i++;',
    '    } else {',
    '      if (len !== 0) len = lps[len - 1];',
    '      else { lps[i] = 0; i++; }',
    '    }',
    '  }',
    '  return lps;',
    '}',
  ],

  *generate(_data: number[]): Generator<Step> {
    // 使用固定的文本和模式进行演示
    const text = 'ABABDABACDABABCABAB';
    const pattern = 'ABABCABAB';
    const n = text.length;
    const m = pattern.length;

    yield {
      type: 'mark',
      line: 1,
      message: `开始 KMP 搜索，文本="${text}"，模式="${pattern}"`,
      snapshot: snap(text, pattern, {}, {}),
    };

    // 计算 LPS 数组
    const lps: number[] = new Array(m).fill(0);
    let len = 0;
    let i = 1;

    yield {
      type: 'pointer',
      line: 16,
      message: '计算 LPS（最长前缀后缀）数组',
      snapshot: snap(text, pattern, {}, {}),
    };

    while (i < m) {
      if (pattern[i] === pattern[len]) {
        len++;
        lps[i] = len;
        yield {
          type: 'compare',
          indices: [i],
          line: 20,
          message: `LPS：pattern[${i}]='${pattern[i]}' === pattern[${len - 1}]='${pattern[len - 1]}'，lps[${i}]=${len}`,
          snapshot: snap(text, pattern, {}, (() => {
            const s: Record<number, ElementState> = {};
            for (let k = 0; k <= i; k++) s[k] = lps[k] > 0 ? 'sorted' : 'default';
            s[i] = 'compare';
            return s;
          })()),
        };
        i++;
      } else {
        if (len !== 0) {
          len = lps[len - 1];
          yield {
            type: 'pointer',
            line: 22,
            message: `LPS：不匹配，回退 len=${len}`,
            snapshot: snap(text, pattern, {}, (() => {
              const s: Record<number, ElementState> = {};
              for (let k = 0; k < i; k++) s[k] = lps[k] > 0 ? 'sorted' : 'default';
              s[i] = 'compare';
              return s;
            })()),
          };
        } else {
          lps[i] = 0;
          yield {
            type: 'set',
            indices: [i],
            line: 23,
            message: `LPS：lps[${i}]=0`,
            snapshot: snap(text, pattern, {}, (() => {
              const s: Record<number, ElementState> = {};
              for (let k = 0; k <= i; k++) s[k] = lps[k] > 0 ? 'sorted' : 'default';
              return s;
            })()),
          };
          i++;
        }
      }
    }

    yield {
      type: 'mark',
      line: 2,
      message: `LPS 数组：[${lps.join(', ')}]`,
      snapshot: snap(text, pattern, {}, (() => {
        const s: Record<number, ElementState> = {};
        for (let k = 0; k < m; k++) s[k] = 'sorted';
        return s;
      })()),
    };

    // KMP 搜索
    let j = 0;
    let textIdx = 0;

    while (textIdx < n) {
      const textStates: Record<number, ElementState> = {};
      const patternStates: Record<number, ElementState> = {};

      // 标记已访问的位置
      for (let k = 0; k < textIdx; k++) textStates[k] = 'visit';

      if (text[textIdx] === pattern[j]) {
        textStates[textIdx] = 'compare';
        patternStates[j] = 'compare';

        yield {
          type: 'compare',
          indices: [textIdx],
          line: 4,
          message: `匹配：text[${textIdx}]='${text[textIdx]}' === pattern[${j}]='${pattern[j]}'`,
          snapshot: snap(text, pattern, textStates, patternStates),
        };

        textIdx++;
        j++;

        if (j === m) {
          // 找到匹配
          const matchIdx = textIdx - j;
          const matchTextStates: Record<number, ElementState> = {};
          for (let k = matchIdx; k < matchIdx + m; k++) matchTextStates[k] = 'path';

          yield {
            type: 'mark',
            indices: [matchIdx],
            line: 8,
            message: `✓ 找到匹配！位置=${matchIdx}`,
            snapshot: snap(text, pattern, matchTextStates, (() => {
              const s: Record<number, ElementState> = {};
              for (let k = 0; k < m; k++) s[k] = 'path';
              return s;
            })()),
          };

          yield {
            type: 'done',
            indices: [matchIdx],
            line: 8,
            message: `搜索完成，模式在位置 ${matchIdx} 处匹配`,
            snapshot: snap(text, pattern, matchTextStates, (() => {
              const s: Record<number, ElementState> = {};
              for (let k = 0; k < m; k++) s[k] = 'path';
              return s;
            })()),
          };
          return;
        }
      } else {
        textStates[textIdx] = 'swap';
        patternStates[j] = 'swap';

        yield {
          type: 'compare',
          indices: [textIdx],
          line: 9,
          message: `不匹配：text[${textIdx}]='${text[textIdx]}' ≠ pattern[${j}]='${pattern[j]}'`,
          snapshot: snap(text, pattern, textStates, patternStates),
        };

        if (j !== 0) {
          const oldJ = j;
          j = lps[j - 1];
          yield {
            type: 'pointer',
            line: 10,
            message: `使用 LPS 回退：j=${oldJ} → j=${j}`,
            snapshot: snap(text, pattern, textStates, (() => {
              const s: Record<number, ElementState> = {};
              for (let k = j; k < oldJ; k++) s[k] = 'visit';
              s[j] = 'current';
              return s;
            })()),
          };
        } else {
          textIdx++;
        }
      }
    }

    // 未找到
    yield {
      type: 'done',
      line: 14,
      message: '搜索完成，未找到匹配',
      snapshot: snap(text, pattern, {}, {}),
    };
  },
};
