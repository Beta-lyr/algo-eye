// ============================================================
// 算法层核心接口 — Algorithm
// 新增算法只需实现此接口，引擎 / 控制栏零改动
// ============================================================

import type { Step, Snapshot } from '../engine/types';

/** 算法分类 */
export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'graph'
  | 'data-structure'
  | 'string'
  | 'dynamic-programming';

/** 算法难度 */
export type AlgorithmDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** 算法标签 */
export type AlgorithmTag =
  | 'comparison-based'
  | 'non-comparison'
  | 'in-place'
  | 'stable'
  | 'divide-conquer'
  | 'ordered'
  | 'unordered'
  | 'shortest-path'
  | 'mst'
  | 'traversal'
  | 'tree-based'
  | 'hash-based'
  | 'linked'
  | 'pattern-matching'
  | 'optimization';

/** 复杂度信息 */
export interface Complexity {
  time: string;
  space: string;
  stable?: boolean;
}

/**
 * 算法接口
 * 每个算法是一个纯数据对象 + 生成器函数
 * generate() 用 Generator yield Step，引擎收集后回放
 */
export interface Algorithm {
  /** 唯一标识（用于 URL 路由） */
  id: string;
  /** 中文名称 */
  name: string;
  /** 算法分类 */
  category: AlgorithmCategory;
  /** 时间 / 空间复杂度 */
  complexity: Complexity;
  /** 算法伪代码行（与 Step.line 对应，供 CodePanel 渲染） */
  codeLines: string[];
  /** 数据形态（决定用哪个 Renderer） */
  dataKind: Snapshot['kind'];
  /** 步骤生成器：输入数据 → yield 每一步 */
  generate(data: number[]): Generator<Step>;
  /** 默认数据集（可选） */
  defaultData?: number[];
  /** 难度等级 */
  difficulty?: AlgorithmDifficulty;
  /** 标签列表 */
  tags?: AlgorithmTag[];
}
