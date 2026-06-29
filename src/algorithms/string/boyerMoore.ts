// ============================================================
// Boyer-Moore 字符串匹配
// 使用坏字符规则进行匹配
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

export const boyerMoore: Algorithm = {
  id: 'boyer-moore',
  name: 'Boyer-Moore',
  category: 'string',
  complexity: { time: 'O(n/m)', space: 'O(k)' },
  difficulty: 'advanced',
  tags: ['pattern-matching'],
  relatedAlgorithms: ['kmp', 'rabin-karp'],
  dataKind: 'string',
  defaultData: [],
  codeLines: [
    'function boyerMoore(text, pattern) {',
    '  let badChar = buildBadChar(pattern);',
    '  let m = pattern.length, n = text.length;',
    '  let shift = 0;',
    '  while (shift <= n - m) {',
    '    let j = m - 1;',
    '    while (j >= 0 && pattern[j] === text[shift + j])',
    '      j--;',
    '    if (j < 0) { // 找到匹配',
    '      return shift;',
    '    } else {',
    '      let badCharShift = j - badChar[text.charCodeAt(shift + j)];',
    '      shift += Math.max(1, badCharShift);',
    '    }',
    '  }',
    '  return -1; // 未找到',
    '}',
    'function buildBadChar(pattern) {',
    '  let badChar = new Array(256).fill(-1);',
    '  for (let i = 0; i < pattern.length; i++)',
    '    badChar[pattern.charCodeAt(i)] = i;',
    '  return badChar;',
    '}',
  ],

  *generate(_data: number[]): Generator<Step> {
    const text = 'ABABDABACDABABCABAB';
    const pattern = 'ABABCABAB';
    const n = text.length;
    const m = pattern.length;

    yield {
      type: 'mark',
      line: 1,
      message: `开始 Boyer-Moore 搜索，文本="${text}"，模式="${pattern}"`,
      snapshot: snap(text, pattern, {}, {}),
    };

    // 构建坏字符表
    const badChar: Record<string, number> = {};
    for (let i = 0; i < m; i++) {
      badChar[pattern[i]] = i;
    }

    yield {
      type: 'mark',
      line: 2,
      message: `构建坏字符表：${JSON.stringify(badChar)}`,
      snapshot: snap(text, pattern, {}, (() => {
        const s: Record<number, ElementState> = {};
        for (let k = 0; k < m; k++) s[k] = 'sorted';
        return s;
      })()),
    };

    let shift = 0;

    while (shift <= n - m) {
      let j = m - 1;

      const textStates: Record<number, ElementState> = {};
      const patternStates: Record<number, ElementState> = {};

      // 标记已访问的位置
      for (let k = 0; k < shift; k++) textStates[k] = 'visit';

      // 从右向左比较
      while (j >= 0 && pattern[j] === text[shift + j]) {
        textStates[shift + j] = 'compare';
        patternStates[j] = 'compare';

        yield {
          type: 'compare',
          indices: [shift + j],
          line: 6,
          message: `匹配：text[${shift + j}]='${text[shift + j]}' === pattern[${j}]='${pattern[j]}'`,
          snapshot: snap(text, pattern, textStates, patternStates),
        };

        j--;
      }

      if (j < 0) {
        // 找到匹配
        const matchTextStates: Record<number, ElementState> = {};
        for (let k = shift; k < shift + m; k++) matchTextStates[k] = 'path';

        yield {
          type: 'mark',
          indices: [shift],
          line: 9,
          message: `✓ 找到匹配！位置=${shift}`,
          snapshot: snap(text, pattern, matchTextStates, (() => {
            const s: Record<number, ElementState> = {};
            for (let k = 0; k < m; k++) s[k] = 'path';
            return s;
          })()),
        };

        yield {
          type: 'done',
          indices: [shift],
          line: 9,
          message: `搜索完成，模式在位置 ${shift} 处匹配`,
          snapshot: snap(text, pattern, matchTextStates, (() => {
            const s: Record<number, ElementState> = {};
            for (let k = 0; k < m; k++) s[k] = 'path';
            return s;
          })()),
        };
        return;
      } else {
        // 不匹配，使用坏字符规则
        textStates[shift + j] = 'swap';
        patternStates[j] = 'swap';

        yield {
          type: 'compare',
          indices: [shift + j],
          line: 7,
          message: `不匹配：text[${shift + j}]='${text[shift + j]}' ≠ pattern[${j}]='${pattern[j]}'`,
          snapshot: snap(text, pattern, textStates, patternStates),
        };

        const badCharShift = j - (badChar[text[shift + j]] ?? -1);
        const oldShift = shift;
        shift += Math.max(1, badCharShift);

        yield {
          type: 'pointer',
          line: 12,
          message: `坏字符规则：j=${j}，badChar='${text[oldShift + j]}'=${badChar[text[oldShift + j]] ?? -1}，shift=${oldShift}→${shift}`,
          snapshot: snap(text, pattern, textStates, patternStates),
        };
      }
    }

    // 未找到
    yield {
      type: 'done',
      line: 16,
      message: '搜索完成，未找到匹配',
      snapshot: snap(text, pattern, {}, {}),
    };
  },
};
