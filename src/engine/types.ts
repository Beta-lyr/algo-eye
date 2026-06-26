// ============================================================
// 引擎层核心类型 — Step / Snapshot / ElementState
// 算法与渲染器通过这两个数据契约解耦
// ============================================================

/** 步骤类型 */
export type StepType =
  | 'compare'
  | 'swap'
  | 'set'
  | 'visit'
  | 'mark'
  | 'pointer'
  | 'done';

/** 元素状态色（算法状态语义色映射） */
export type ElementState =
  | 'default'
  | 'compare'
  | 'swap'
  | 'sorted'
  | 'visit'
  | 'current'
  | 'path'
  | 'pivot';

/** 数据形态 */
export type DataKind = 'array' | 'grid' | 'tree' | 'graph' | 'string' | 'linked-list';

/**
 * 树节点（用于 tree 形态的数据结构可视化）
 */
export interface TreeNode {
  /** 节点唯一标识（用于状态追踪） */
  id: number;
  /** 节点值 */
  value: number;
  /** 左子节点 */
  left: TreeNode | null;
  /** 右子节点 */
  right: TreeNode | null;
}

/**
 * 某一时刻的数据快照
 * 渲染器依赖 snapshot 绘制一帧——同一 snapshot 永远画同一帧
 * 这是跳转 / 反向回放能正确工作的前提
 */
export interface Snapshot {
  kind: DataKind;
  /** 数组数据（array/grid 形态） */
  data: number[];
  /** 元素下标 → 状态色 */
  states: Record<number, ElementState>;
  /** 元素下标 → 指针标签（如 'j', 'j+1', 'pivot'） */
  pointers?: Record<number, string>;
  /** 树数据（tree 形态时有效） */
  tree?: TreeNode;
  /** 节点 id → 状态色（tree 形态时使用） */
  nodeStates?: Record<number, ElementState>;
  /** 网格特有：行数（grid 形态时有效） */
  cols?: number;
  /** 网格特有：起始/终点坐标 */
  start?: [number, number];
  target?: [number, number];
  /** 字符串匹配特有：文本 */
  text?: string;
  /** 字符串匹配特有：模式 */
  pattern?: string;
  /** 字符串匹配特有：文本中每个位置的状态 */
  textStates?: Record<number, ElementState>;
  /** 字符串匹配特有：模式中每个位置的状态 */
  patternStates?: Record<number, ElementState>;
  /** 链表特有：链表头节点 */
  linkedList?: { id: number; value: number; next: any } | null;
  /** 哈希表特有：桶数组 */
  hashTable?: ({ key: number; value: number; next: any } | null)[];
  /** 哈希表特有：桶状态 */
  hashTableStates?: Record<number | string, ElementState>;
}

/**
 * 算法生成器 yield 的每一步
 * 包含操作描述 + 代码行号 + 完整数据快照
 */
export interface Step {
  type: StepType;
  /** 受影响的元素下标 */
  indices?: number[];
  /** 相关值 */
  values?: number[];
  /** 对应代码行号（1-based，供 CodePanel 高亮） */
  line?: number;
  /** 步骤说明文字 */
  message?: string;
  /** 该步结束时的完整数据状态 */
  snapshot: Snapshot;
}
