// ============================================================
// VizStage — 可视化舞台（Canvas 画布 + 标题 + 图例）
// 监听 store 的 stepIndex 变化，调用 Renderer 绘制当前帧
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useVizStore } from '../store/useVizStore';
import { ArrayRenderer } from '../renderers/ArrayRenderer';
import type { Renderer } from '../renderers/Renderer';
import type { Snapshot } from '../engine/types';

/**
 * 根据 snapshot.kind 选择对应 Renderer
 * 扩展时在此注册新的 Renderer
 */
function pickRenderer(kind: Snapshot['kind']): Renderer<Snapshot> {
  switch (kind) {
    case 'array':
      return ArrayRenderer;
    // TODO: grid / tree / graph 渲染器
    default:
      return ArrayRenderer;
  }
}

export function VizStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const steps = useVizStore((s) => s.steps);
  const stepIndex = useVizStore((s) => s.stepIndex);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || steps.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snap = steps[stepIndex].snapshot;
    const renderer = pickRenderer(snap.kind);

    // 高 DPI 适配
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssW = rect.width;
    const cssH = rect.height;

    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    renderer.draw(ctx, snap, { canvasWidth: cssW, canvasHeight: cssH });
    ctx.restore();
  }, [steps, stepIndex]);

  // 步骤变化时重绘
  useEffect(() => {
    draw();
  }, [draw]);

  // 窗口大小变化时重绘
  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  if (!currentAlgo) {
    return (
      <section className="pane center">
        <div className="pane-hd">可视化</div>
        <div className="viz-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-faint)' }}>
          请选择一个算法
        </div>
      </section>
    );
  }

  const { complexity } = currentAlgo;
  const step = steps[stepIndex];

  return (
    <section className="pane center">
      {/* 标题栏 */}
      <div className="viz-hd">
        <div className="viz-title">▸ {currentAlgo.name}(arr)</div>
        <div className="badges">
          <span className="badge">
            时间 <b>{complexity.time}</b>
          </span>
          <span className="badge">
            空间 <b>{complexity.space}</b>
          </span>
          {complexity.stable !== undefined && (
            <span className={`badge${complexity.stable ? ' ok' : ''}`}>
              稳定 <b>{complexity.stable ? '✓' : '✗'}</b>
            </span>
          )}
          <span className="badge ok">
            原地 <b>✓</b>
          </span>
        </div>
      </div>

      {/* Canvas 画布 */}
      <div className="viz-stage">
        <canvas ref={canvasRef} />
        <div className="axis-label">index →</div>
      </div>

      {/* 图例 */}
      <div className="legend">
        <span>
          <i className="sw default" />
          未处理
        </span>
        <span>
          <i className="sw compare" />
          比较中
        </span>
        <span>
          <i className="sw swap" />
          交换中
        </span>
        <span>
          <i className="sw sorted" />
          已排序
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--txt-dim)' }}>
          step {stepIndex + 1} / {steps.length}
          {step && <> · {step.message?.slice(0, 30)}...</>}
        </span>
      </div>
    </section>
  );
}
