// ============================================================
// 算法注册表 — 所有算法的统一入口
// 使用 import.meta.glob 自动发现算法文件，新增算法无需手动注册
// ============================================================

import type { Algorithm } from './types';

const modules = import.meta.glob('./**/!(index|types).ts', { eager: true });

function isAlgorithm(v: unknown): v is Algorithm {
  return typeof v === 'object' && v !== null && 'id' in v && 'generate' in v;
}

/** 所有已注册的算法（自动收集） */
export const algorithms: Algorithm[] = Object.values(modules)
  .flatMap((mod) => Object.values(mod as Record<string, unknown>))
  .filter(isAlgorithm);

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
