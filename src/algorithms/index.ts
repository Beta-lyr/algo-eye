// ============================================================
// 算法注册表 — 所有算法的统一入口
// 新增算法只需在此导入并注册
// ============================================================

import type { Algorithm } from './types';
import { bubbleSort } from './sorting/bubbleSort';

/** 所有已注册的算法 */
export const algorithms: Algorithm[] = [
  bubbleSort,
];

/** 按 ID 查找算法 */
export function getAlgorithmById(id: string): Algorithm | undefined {
  return algorithms.find((a) => a.id === id);
}

/** 按分类筛选算法 */
export function getAlgorithmsByCategory(category: Algorithm['category']): Algorithm[] {
  return algorithms.filter((a) => a.category === category);
}

/** 按分类获取算法计数 */
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const algo of algorithms) {
    counts[algo.category] = (counts[algo.category] ?? 0) + 1;
  }
  return counts;
}
