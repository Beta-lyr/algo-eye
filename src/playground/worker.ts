// ============================================================
// V3 Web Worker 入口——在主线程外执行用户代码
// 死循环不会冻死 UI；Worker 天然无 DOM/localStorage 访问
// ============================================================

import { createViz } from './vizApi';
import type { Step } from '../engine/types';
import type { RunRequest, RunResponse } from './protocol';

(self as unknown).onmessage = (e: MessageEvent<RunRequest>) => {
  const req = e.data;
  if (!req || req.type !== 'run') return;

  const steps: Step[] = [];
  try {
    const viz = createViz(req.data, steps);
    // 用 Function 构造器隔离用户代码，viz 为唯一外部依赖
    // 用户代码以 viz 为参数调用，无法访问主线程 DOM / localStorage / fetch
    const fn = new Function('viz', `"use strict";\n${req.code}`);
    fn(viz);
    const res: RunResponse = { type: 'steps', steps, dataKind: req.dataKind };
    (self as unknown as Worker).postMessage(res);
  } catch (err) {
    const res: RunResponse = {
      type: 'error',
      message: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
    };
    (self as unknown as Worker).postMessage(res);
  }
};
