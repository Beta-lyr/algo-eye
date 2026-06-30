import { createViz } from './vizApi';
import { instrumentLines } from './lineInstrument';
import type { Step } from '../engine/types';
import type { RunRequest, RunResponse } from './protocol';

const BATCH_SIZE = 50;

(self as unknown as Worker).onmessage = (e: MessageEvent<RunRequest>) => {
  const req = e.data;
  if (!req || req.type !== 'run') return;

  const steps: Step[] = [];
  let batch: Step[] = [];
  const post = (msg: RunResponse) => { (self as unknown as Worker).postMessage(msg); };
  const dataKind = req.input.kind;

  const flushBatch = () => {
    if (batch.length === 0) return;
    post({ type: 'progress', steps: batch, dataKind });
    batch = [];
  };

  try {
    const code = instrumentLines(req.code);
    const onStep = (step: Step) => {
      batch.push(step);
      if (batch.length >= BATCH_SIZE) flushBatch();
    };
    const viz = createViz(req.input, steps, onStep);
    const fn = new Function('viz', `"use strict";\n${code}`);
    fn(viz);
    flushBatch();
    post({ type: 'done', dataKind });
  } catch (err) {
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
