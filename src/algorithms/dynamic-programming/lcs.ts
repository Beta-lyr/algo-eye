// ============================================================
// 最长公共子序列 — LCS (Longest Common Subsequence)
// 展示 DP 填表过程
// ============================================================

import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

/** 创建快照 */
function dpSnap(
  dpGrid: (number | null)[][],
  dpGridStates: Record<string, ElementState>,
  dpLabels: Record<string, string>,
  arrayData: number[] = [],
): Snapshot {
  return {
    kind: 'dp-grid',
    data: arrayData,
    states: {},
    dpGrid: dpGrid.map((row) => [...row]),
    dpGridStates: { ...dpGridStates },
    dpLabels: { ...dpLabels },
  };
}

export const lcs: Algorithm = {
  id: 'lcs',
  name: 'LCS',
  category: 'dynamic-programming',
  complexity: { time: 'O(mn)', space: 'O(mn)' },
  difficulty: 'intermediate',
  tags: ['optimization'],
  dataKind: 'dp-grid',
  defaultData: [],
  codeLines: [
    'function lcs(text1, text2) {',
    '  let m = text1.length, n = text2.length;',
    '  let dp = Array(m+1).fill(null).map(() => Array(n+1).fill(0));',
    '  for (let i = 1; i <= m; i++) {',
    '    for (let j = 1; j <= n; j++) {',
    '      if (text1[i-1] === text2[j-1]) {',
    '        dp[i][j] = dp[i-1][j-1] + 1;',
    '      } else {',
    '        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);',
    '      }',
    '    }',
    '  }',
    '  return dp[m][n];',
    '}',
  ],

  *generate(_data: number[]): Generator<Step> {
    const text1 = 'ABCBDAB';
    const text2 = 'BDCABA';
    const m = text1.length;
    const n = text2.length;

    // 初始化 DP 表格
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(null),
    );
    const dpGridStates: Record<string, ElementState> = {};
    const dpLabels: Record<string, string> = {};

    // 设置标签
    for (let i = 0; i <= m; i++) {
      dpLabels[`row-${i}`] = i === 0 ? '' : text1[i - 1];
    }
    for (let j = 0; j <= n; j++) {
      dpLabels[`col-${j}`] = j === 0 ? '' : text2[j - 1];
    }

    yield {
      type: 'mark',
      line: 1,
      message: `开始 LCS：text1="${text1}"，text2="${text2}"`,
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };

    // 初始化第一行和第一列为 0
    for (let i = 0; i <= m; i++) {
      dp[i][0] = 0;
      dpGridStates[`${i}-0`] = 'sorted';
    }
    for (let j = 0; j <= n; j++) {
      dp[0][j] = 0;
      dpGridStates[`0-${j}`] = 'sorted';
    }

    yield {
      type: 'mark',
      line: 3,
      message: '初始化边界：dp[i][0] = dp[0][j] = 0',
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };

    // 填表
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        // 高亮当前单元格
        dpGridStates[`${i}-${j}`] = 'current';

        // 高亮比较的单元格
        dpGridStates[`${i - 1}-${j - 1}`] = 'compare';
        dpGridStates[`${i - 1}-${j}`] = 'visit';
        dpGridStates[`${i}-${j - 1}`] = 'visit';

        yield {
          type: 'compare',
          line: 5,
          message: `比较 text1[${i - 1}]='${text1[i - 1]}' 与 text2[${j - 1}]='${text2[j - 1]}'`,
          snapshot: dpSnap(dp, dpGridStates, dpLabels),
        };

        if (text1[i - 1] === text2[j - 1]) {
          // 字符匹配
          dp[i][j] = (dp[i - 1][j - 1] ?? 0) + 1;
          dpGridStates[`${i}-${j}`] = 'path';

          yield {
            type: 'set',
            line: 6,
            message: `匹配！dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
            snapshot: dpSnap(dp, dpGridStates, dpLabels),
          };
        } else {
          // 字符不匹配，取最大值
          const fromTop = dp[i - 1][j] ?? 0;
          const fromLeft = dp[i][j - 1] ?? 0;
          dp[i][j] = Math.max(fromTop, fromLeft);

          if (fromTop >= fromLeft) {
            dpGridStates[`${i - 1}-${j}`] = 'compare';
          } else {
            dpGridStates[`${i}-${j - 1}`] = 'compare';
          }
          dpGridStates[`${i}-${j}`] = 'swap';

          yield {
            type: 'set',
            line: 8,
            message: `不匹配：dp[${i}][${j}] = max(${fromTop}, ${fromLeft}) = ${dp[i][j]}`,
            snapshot: dpSnap(dp, dpGridStates, dpLabels),
          };
        }

        // 重置状态
        dpGridStates[`${i}-${j}`] = 'sorted';
        dpGridStates[`${i - 1}-${j - 1}`] = 'sorted';
        dpGridStates[`${i - 1}-${j}`] = 'sorted';
        dpGridStates[`${i}-${j - 1}`] = 'sorted';
      }
    }

    // 高亮结果
    dpGridStates[`${m}-${n}`] = 'path';
    yield {
      type: 'mark',
      line: 12,
      message: `LCS 长度 = ${dp[m][n]}`,
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };

    // 回溯找到 LCS
    let lcsStr = '';
    let i = m,
      j = n;
    while (i > 0 && j > 0) {
      dpGridStates[`${i}-${j}`] = 'pivot';

      if (text1[i - 1] === text2[j - 1]) {
        lcsStr = text1[i - 1] + lcsStr;
        i--;
        j--;
      } else if ((dp[i - 1][j] ?? 0) >= (dp[i][j - 1] ?? 0)) {
        i--;
      } else {
        j--;
      }
    }

    yield {
      type: 'done',
      line: 13,
      message: `LCS = "${lcsStr}"，长度 = ${dp[m][n]}`,
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };
  },
};
