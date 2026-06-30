// ============================================================
// TracePanel — V3.1 执行轨迹面板
// 按序列出每步 viz 调用（type + message），当前步琥珀高亮
// 与 StepPlayer 同步：步进时当前行滚动到视图；点击行跳转
// 技术方案 §4.3：V3.1 用轨迹面板绕开 AST 行高亮，零 acorn 复杂度
// ============================================================

import { useEffect, useRef } from 'react';
import { useVizStore } from '../store/useVizStore';
import { useT } from '../i18n';
import type { Step } from '../engine/types';

export function TracePanel() {
  const t = useT();
  const steps = useVizStore((s) => s.steps);
  const stepIndex = useVizStore((s) => s.stepIndex);
  const setStepIndex = useVizStore((s) => s.setStepIndex);
  const activeRef = useRef<HTMLDivElement>(null);

  // 当前步变化时滚动到视图（步进/跳转/播放时）
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }, [stepIndex]);

  return (
    <div className="trace-panel">
      <div className="trace-hd">
        <span>{t.playground.trace}</span>
        <span className="trace-count">{stepIndex + 1}/{steps.length}</span>
      </div>
      <div className="trace-list">
        {steps.length === 0 ? (
          <div className="trace-empty">{t.playground.traceEmpty}</div>
        ) : (
          steps.map((step: Step, i: number) => (
            <div
              key={i}
              ref={i === stepIndex ? activeRef : undefined}
              className={`trace-item${i === stepIndex ? ' active' : ''}`}
              onClick={() => setStepIndex(i)}
            >
              <span className="trace-idx">{String(i + 1).padStart(3, '0')}</span>
              <span className={`trace-type ${step.type}`}>{step.type}</span>
              <span className="trace-msg">{step.message ?? ''}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
