// ============================================================
// 算法注册表 — 所有算法的统一入口
// 新增算法只需在此导入并注册
// ============================================================

import type { Algorithm } from './types';
import { bubbleSort } from './sorting/bubbleSort';
import { selectionSort } from './sorting/selectionSort';
import { insertionSort } from './sorting/insertionSort';
import { quickSort } from './sorting/quickSort';
import { mergeSort } from './sorting/mergeSort';
import { heapSort } from './sorting/heapSort';
import { shellSort } from './sorting/shellSort';
import { radixSort } from './sorting/radixSort';
import { countingSort } from './sorting/countingSort';
import { bucketSort } from './sorting/bucketSort';
import { linearSearch } from './searching/linearSearch';
import { binarySearch } from './searching/binarySearch';
import { binarySearchTree } from './data-structure/binarySearchTree';
import { bfs } from './graph/bfs';
import { dfs } from './graph/dfs';
import { dijkstra } from './graph/dijkstra';

/** 所有已注册的算法 */
export const algorithms: Algorithm[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  quickSort,
  mergeSort,
  heapSort,
  shellSort,
  radixSort,
  countingSort,
  bucketSort,
  linearSearch,
  binarySearch,
  binarySearchTree,
  bfs,
  dfs,
  dijkstra,
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
