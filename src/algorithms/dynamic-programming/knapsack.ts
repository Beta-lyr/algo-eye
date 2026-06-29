// ============================================================
// 0-1 背包问题 — 0/1 Knapsack
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

export const knapsack: Algorithm = {
  id: 'knapsack',
  name: '0-1 背包',
  category: 'dynamic-programming',
  complexity: { time: 'O(nW)', space: 'O(nW)' },
  difficulty: 'intermediate',
  tags: ['optimization'],
  dataKind: 'dp-grid',
  defaultData: [],
  codeLines: [
    'function knapsack(weights, values, capacity) {',
    '  let n = weights.length;',
    '  let dp = Array(n+1).fill(null).map(() => Array(capacity+1).fill(0));',
    '  for (let i = 1; i <= n; i++) {',
    '    for (let w = 0; w <= capacity; w++) {',
    '      if (weights[i-1] <= w) {',
    '        dp[i][w] = Math.max(',
    '          dp[i-1][w],',
    '          dp[i-1][w-weights[i-1]] + values[i-1]',
    '        );',
    '      } else {',
    '        dp[i][w] = dp[i-1][w];',
    '      }',
    '    }',
    '  }',
    '  return dp[n][capacity];',
    '}',
  ],

  *generate(_data: number[]): Generator<Step> {
    const weights = [2, 3, 4, 5];
    const values = [3, 4, 5, 6];
    const capacity = 8;
    const n = weights.length;

    // 初始化 DP 表格
    const dp: (number | null)[][] = Array.from({ length: n + 1 }, () =>
      Array(capacity + 1).fill(null),
    );
    const dpGridStates: Record<string, ElementState> = {};
    const dpLabels: Record<string, string> = {};

    // 设置标签
    dpLabels['row-0'] = '∅';
    for (let i = 0; i < n; i++) {
      dpLabels[`row-${i + 1}`] = `w${weights[i]}`;
    }
    for (let w = 0; w <= capacity; w++) {
      dpLabels[`col-${w}`] = `${w}`;
    }

    yield {
      type: 'mark',
      line: 1,
      message: `开始 0-1 背包：weights=[${weights}]，values=[${values}]，capacity=${capacity}`,
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };

    // 初始化第一列为 0
    for (let i = 0; i <= n; i++) {
      dp[i][0] = 0;
      dpGridStates[`${i}-0`] = 'sorted';
    }

    yield {
      type: 'mark',
      line: 3,
      message: '初始化边界：dp[i][0] = 0',
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };

    // 填表
    for (let i = 1; i <= n; i++) {
      for (let w = 1; w <= capacity; w++) {
        // 高亮当前单元格
        dpGridStates[`${i}-${w}`] = 'current';

        yield {
          type: 'compare',
          line: 5,
          message: `物品 ${i}：weight=${weights[i - 1]}，value=${values[i - 1]}，容量=${w}`,
          snapshot: dpSnap(dp, dpGridStates, dpLabels),
        };

        if (weights[i - 1] <= w) {
          // 可以选择放入
          dpGridStates[`${i - 1}-${w}`] = 'visit';
          dpGridStates[`${i - 1}-${w - weights[i - 1]}`] = 'compare';

          yield {
            type: 'compare',
            line: 6,
            message: `weight[${i - 1}]=${weights[i - 1]} ≤ capacity=${w}，可以放入`,
            snapshot: dpSnap(dp, dpGridStates, dpLabels),
          };

          const withoutItem = dp[i - 1][w] ?? 0;
          const withItem = (dp[i - 1][w - weights[i - 1]] ?? 0) + values[i - 1];
          dp[i][w] = Math.max(withoutItem, withItem);

          if (withItem > withoutItem) {
            dpGridStates[`${i - 1}-${w - weights[i - 1]}`] = 'path';
            dpGridStates[`${i}-${w}`] = 'path';

            yield {
              type: 'set',
              line: 9,
              message: `选择放入：dp[${i}][${w}] = ${withItem} > ${withoutItem}`,
              snapshot: dpSnap(dp, dpGridStates, dpLabels),
            };
          } else {
            dpGridStates[`${i - 1}-${w}`] = 'path';
            dpGridStates[`${i}-${w}`] = 'visit';

            yield {
              type: 'set',
              line: 7,
              message: `不放入：dp[${i}][${w}] = ${withoutItem} ≥ ${withItem}`,
              snapshot: dpSnap(dp, dpGridStates, dpLabels),
            };
          }
        } else {
          // 放不下
          dp[i][w] = dp[i - 1][w] ?? 0;
          dpGridStates[`${i - 1}-${w}`] = 'compare';
          dpGridStates[`${i}-${w}`] = 'visit';

          yield {
            type: 'set',
            line: 11,
            message: `weight[${i - 1}]=${weights[i - 1]} > capacity=${w}，放不下`,
            snapshot: dpSnap(dp, dpGridStates, dpLabels),
          };
        }

        // 重置状态
        dpGridStates[`${i}-${w}`] = 'sorted';
        dpGridStates[`${i - 1}-${w}`] = 'sorted';
        dpGridStates[`${i - 1}-${w - weights[i - 1]}`] = 'sorted';
      }
    }

    // 高亮结果
    dpGridStates[`${n}-${capacity}`] = 'path';
    yield {
      type: 'mark',
      line: 15,
      message: `最大价值 = ${dp[n][capacity]}`,
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };

    // 回溯找到选择了哪些物品
    const selected: number[] = [];
    let w = capacity;
    for (let i = n; i > 0; i--) {
      if (i === 0) break;
      if (w <= 0) break;

      const withoutItem = (dp[i - 1]?.[w]) ?? 0;
      if ((dp[i][w] ?? 0) > withoutItem) {
        selected.unshift(i - 1);
        dpGridStates[`${i}-${w}`] = 'pivot';
        w -= weights[i - 1];
      }
    }

    yield {
      type: 'done',
      line: 16,
      message: `选择物品：[${selected.join(', ')}]，总价值 = ${dp[n][capacity]}`,
      snapshot: dpSnap(dp, dpGridStates, dpLabels),
    };
  },
};
