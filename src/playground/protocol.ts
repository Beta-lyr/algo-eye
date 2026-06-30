// ============================================================
// V3 Worker 通信协议 — main ↔ worker 消息类型
// 最小骨架阶段仅支持 array 数据形态
// ============================================================

import type { Step } from '../engine/types';

/** 数据形态（V3.1 最小骨架仅 array） */
export type DataKind = 'array';

/** main → worker：运行用户代码 */
export interface RunRequest {
  type: 'run';
  /** 用户代码（调用 viz API） */
  code: string;
  /** 初始数据 */
  data: number[];
  dataKind: DataKind;
}

/** worker → main：运行结果 */
export type RunResponse =
  | { type: 'steps'; steps: Step[]; dataKind: DataKind }
  | { type: 'error'; message: string; line?: number }
  | { type: 'progress'; count: number };
