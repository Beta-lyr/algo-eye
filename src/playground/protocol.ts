// ============================================================
// V3 Worker 通信协议 — main ↔ worker 消息类型
// V3.3: PlaygroundInput 按 dataKind 区分输入结构
// ============================================================

import type { Step } from '../engine/types';

/** V3.3: 按 dataKind 区分的用户输入 */
export type PlaygroundInput =
  | { kind: 'array'; data: number[] }
  | { kind: 'string'; text: string; pattern: string }
  | { kind: 'grid'; data: number[]; cols: number; start?: [number, number]; target?: [number, number] };

/** main → worker：运行用户代码 */
export interface RunRequest {
  type: 'run';
  code: string;
  input: PlaygroundInput;
}

/** worker → main：运行结果 */
export type RunResponse =
  | { type: 'steps'; steps: Step[]; dataKind: PlaygroundInput['kind'] }
  | { type: 'error'; message: string; line?: number }
  | { type: 'progress'; steps: Step[]; dataKind: PlaygroundInput['kind'] }
  | { type: 'done'; dataKind: PlaygroundInput['kind'] };
