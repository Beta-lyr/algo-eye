// ============================================================
// V3 Web Worker 入口——在主线程外执行用户代码
// 死循环不会冻死 UI；Worker 天然无 DOM/localStorage 访问
// ============================================================

import { createViz } from './vizApi';
import { instrumentLines } from './lineInstrument';
import type { Step } from '../engine/types';
import type { RunRequest, RunResponse } from './protocol';

/** 每批发送的步数 */
const BATCH_SIZE = 50;

(self as unknown as Worker).onmessage = (e: MessageEvent<RunRequest>) => {
  const req = e.data;
  if (!req || req.type !== 'run') return;

  const steps: Step[] = [];
  let batch: Step[] = [];
  const post = (msg: RunResponse) => { (self as unknown as Worker).postMessage(msg); };

  const flushBatch = () => {
    if (batch.length === 0) return;
    post({ type: 'progress', steps: batch, dataKind: req.dataKind });
    batch = [];
  };

  try {
    const code = instrumentLines(req.code);
    const onStep = (step: Step) => {
      batch.push(step);
      if (batch.length >= BATCH_SIZE) flushBatch();
    };
    const viz = createViz(req.data, steps, onStep);
    const fn = new Function('viz', `"use strict";\n${code}`);
    fn(viz);
    flushBatch();
    post({ type: 'done', dataKind: req.dataKind });
  } catch (err) {
    // 异常时先刷残余步骤（如 StepLimitError 前已录制的步骤）
    flushBatch();
    const line = err instanceof SyntaxError && (err as any).loc?.line
      ? (err as any).loc.line
      : undefined;
    post({
      type: 'error',
      message: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      line,
    });
  }
};
