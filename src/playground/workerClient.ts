// ============================================================
// V3 主线程侧 Worker 管理——发 run / 收 steps / 超时 terminate
// 生命周期由 Playground 组件持有（useEffect 创建+卸载销毁）
// ============================================================

import type { RunRequest, RunResponse, DataKind } from './protocol';
import type { Step } from '../engine/types';

export interface RunOptions {
  /** 用户代码 */
  code: string;
  /** 初始数据 */
  data: number[];
  dataKind: DataKind;
  /** 超时毫秒，默认 5000 */
  timeoutMs?: number;
  /** V3.2 流式回调：每批步骤到达时调用 */
  onProgress?: (steps: Step[]) => void;
}

export class WorkerClient {
  private worker: Worker | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** 懒加载 Worker（首次 run 时创建，复用到 terminate） */
  private ensure(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    }
    return this.worker;
  }

  /**
   * 运行用户代码。
   * - 流式：onProgress 逐批收到步骤，最后 resolve DoneSignal
   * - 失败：resolve { type: 'error', message }
   * - 超时：terminate Worker 并 resolve 超时错误（不死循环）
   */
  run(opts: RunOptions): Promise<RunResponse> {
    return new Promise((resolve) => {
      const worker = this.ensure();
      const timeoutMs = opts.timeoutMs ?? 5000;

      const cleanup = () => {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        worker.onmessage = null;
        worker.onerror = null;
      };

      this.timer = setTimeout(() => {
        cleanup();
        this.terminate();
        resolve({ type: 'error', message: `执行超时（${timeoutMs}ms），可能存在死循环` });
      }, timeoutMs);

      worker.onmessage = (e: MessageEvent<RunResponse>) => {
        const msg = e.data;
        if (msg.type === 'progress') {
          opts.onProgress?.(msg.steps);
          return;
        }
        cleanup();
        resolve(msg);
      };
      worker.onerror = (e: ErrorEvent) => {
        cleanup();
        resolve({ type: 'error', message: e.message || 'Worker 执行错误' });
      };

      const req: RunRequest = {
        type: 'run',
        code: opts.code,
        data: opts.data,
        dataKind: opts.dataKind,
      };
      worker.postMessage(req);
    });
  }

  /** 终止 Worker（销毁子线程，清理定时器） */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
