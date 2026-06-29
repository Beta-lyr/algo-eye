// ============================================================
// 编辑距离 — Edit Distance (Levenshtein Distance)
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

export const editDistance: Algorithm = {
  id: 'edit-distance',
  name: '编辑距离',
  category: 'dynamic-programming',
  complexity: { time: 'O(mn)', space: 'O(mn)' },
  difficulty: 'intermediate',
  tags: ['optimization'],
  dataKind: 'dp-grid',
  defaultData: [],
  codeLines: [
    'function editDistance(word1, word2) {',
    '  let m = word1.length, n = word2.length;',
    '  let dp = Array(m+1).fill(null).map(() => Array(n+1).fill(0));',
    '  for (let i = 0; i <= m; i++) dp[i][0] = i;',
    '  for (let j = 0; j <= n; j++) dp[0][j] = j;',
    '  for (let i = 1; i <= m; i++) {',
    '    for (let j = 1; j <= n; j++) {',
    '      if (word1[i-1] === word2[j-1]) {',
    '        dp[i][j] = dp[i-1][j-1];  // 无需操作',
    '      } else {',
    '        dp[i][j] = 1 + Math.min(',
    '          dp[i-1][j],    // 删除',
    '          dp[i][j-1],    // 插入',
    '          dp[i-1][j-1]   // 替换',
    '        );',
    '      }',
    '    }',
    '  }',
    '  return dp[m][n];',
    '}',
  ],

  *generate(_data: number[]): Generator<Step> {
    const word1 = 'HORSE';
    const word2 = 'ROS';
    const m = word1.length;
    const n = word2.length;

    // 初始化 DP 表格
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(null),
    );
    const dpGridStates: Record<string, ElementState> = {};
    const dpLabels: Record<string, string> = {};

    // 设置标签
    dpLabels['row-0'] = '∅';
    for (let i = 0; i < m; i++) {
      dpLabels[`row-${i + 1}`] = word1[i];
    }
    dpLabels['col-0'] = '∅';
    for (let j = 0; j < n; j++) {
      dpLabels[`col-${j + 1}`] = word2[j];
    }

    yield {
      type: 'mark',
      line: 1,
      message: `开始编辑距离：word1="${word1}"，word2="${word2}"`,
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };

    // 初始化第一列
    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
      dpGridStates[`${i}-0`] = 'sorted';
    }

    yield {
      type: 'mark',
      line: 4,
      message: `初始化第一列：dp[i][0] = i（删除 i 个字符）`,
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };

    // 初始化第一行
    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
      dpGridStates[`0-${j}`] = 'sorted';
    }

    yield {
      type: 'mark',
      line: 5,
      message: `初始化第一行：dp[0][j] = j（插入 j 个字符）`,
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
          line: 7,
          message: `比较 word1[${i - 1}]='${word1[i - 1]}' 与 word2[${j - 1}]='${word2[j - 1]}'`,
          snapshot: dpSnap(dp, dpGridStates, dpLabels),
        };

        if (word1[i - 1] === word2[j - 1]) {
          // 字符相同，无需操作
          dp[i][j] = dp[i - 1][j - 1] ?? 0;
          dpGridStates[`${i}-${j}`] = 'path';
          dpGridStates[`${i - 1}-${j - 1}`] = 'path';

          yield {
            type: 'set',
            line: 8,
            message: `相同！dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}`,
            snapshot: dpSnap(dp, dpGridStates, dpLabels),
          };
        } else {
          // 字符不同，取最小操作
          const del = dp[i - 1][j] ?? 0; // 删除
          const ins = dp[i][j - 1] ?? 0; // 插入
          const rep = dp[i - 1][j - 1] ?? 0; // 替换
          dp[i][j] = 1 + Math.min(del, ins, rep);

          // 高亮最小值来源
          const minVal = Math.min(del, ins, rep);
          if (minVal === rep) {
            dpGridStates[`${i - 1}-${j - 1}`] = 'path';
          } else if (minVal === del) {
            dpGridStates[`${i - 1}-${j}`] = 'path';
          } else {
            dpGridStates[`${i}-${j - 1}`] = 'path';
          }
          dpGridStates[`${i}-${j}`] = 'swap';

          yield {
            type: 'set',
            line: 10,
            message: `不同：dp[${i}][${j}] = 1 + min(${del}, ${ins}, ${rep}) = ${dp[i][j]}`,
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
      type: 'done',
      line: 18,
      message: `编辑距离 = ${dp[m][n]}，将 "${word1}" 转换为 "${word2}" 需要 ${dp[m][n]} 次操作`,
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };
  },
};
