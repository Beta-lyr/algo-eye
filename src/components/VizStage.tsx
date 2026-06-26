// ============================================================
// VizStage — 可视化舞台（Canvas 画布 + 标题 + 图例）
// 监听 store 的 stepIndex 变化，调用 Renderer 绘制当前帧
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useVizStore } from '../store/useVizStore';
import { useT, useTranslateMessage } from '../i18n';
import { ArrayRenderer } from '../renderers/ArrayRenderer';
import { TreeRenderer } from '../renderers/TreeRenderer';
import { GridRenderer } from '../renderers/GridRenderer';
import { StringRenderer } from '../renderers/StringRenderer';
import { LinkedListRenderer } from '../renderers/LinkedListRenderer';
import { HashTableRenderer } from '../renderers/HashTableRenderer';
import { DPGridRenderer } from '../renderers/DPGridRenderer';
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
    case 'tree':
      return TreeRenderer;
    case 'grid':
      return GridRenderer;
    case 'string':
      return StringRenderer;
    case 'linked-list':
      // 根据是否有 hashTable 数据选择渲染器
      return LinkedListRenderer;
    default:
      return ArrayRenderer;
  }
}

/** 检查是否使用哈希表渲染器 */
function shouldUseHashTableRenderer(snap: Snapshot): boolean {
  return snap.hashTable !== undefined;
}

/** 检查是否使用DP表格渲染器 */
function shouldUseDPGridRenderer(snap: Snapshot): boolean {
  return snap.dpGrid !== undefined;
}

export function VizStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const steps = useVizStore((s) => s.steps);
  const stepIndex = useVizStore((s) => s.stepIndex);
  const t = useT();
  const translateMsg = useTranslateMessage();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || steps.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snap = steps[stepIndex].snapshot;
    // 根据数据类型选择渲染器
    let renderer: Renderer<Snapshot>;
    if (shouldUseDPGridRenderer(snap)) {
      renderer = DPGridRenderer;
    } else if (shouldUseHashTableRenderer(snap)) {
      renderer = HashTableRenderer;
    } else {
      renderer = pickRenderer(snap.kind);
    }

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
        <div className="pane-hd">{t.viz.title}</div>
        <div className="viz-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-faint)' }}>
          {t.viz.selectAlgo}
        </div>
      </section>
    );
  }

  const { complexity } = currentAlgo;
  const step = steps[stepIndex];
  const isTree = currentAlgo.dataKind === 'tree';
  const isGrid = currentAlgo.dataKind === 'grid';

  // 根据算法类型显示不同的函数签名
  const getSignature = () => {
    if (isTree) return '()';
    if (isGrid) return '(grid)';
    return '(arr)';
  };

  return (
    <section className="pane center">
      {/* 标题栏 */}
      <div className="viz-hd">
        <div className="viz-title">▸ {currentAlgo.name}{getSignature()}</div>
        <div className="badges">
          <span className="badge">
            {t.viz.time} <b>{complexity.time}</b>
          </span>
          <span className="badge">
            {t.viz.space} <b>{complexity.space}</b>
          </span>
          {complexity.stable !== undefined && (
            <span className={`badge${complexity.stable ? ' ok' : ''}`}>
              {t.viz.stable} <b>{complexity.stable ? t.viz.yes : t.viz.no}</b>
            </span>
          )}
          <span className="badge ok">
            {t.viz.inPlace} <b>{t.viz.yes}</b>
          </span>
        </div>
      </div>

      {/* Canvas 画布 */}
      <div className="viz-stage">
        <canvas ref={canvasRef} />
        {!isTree && !isGrid && <div className="axis-label">index →</div>}
      </div>

      {/* 图例 */}
      <div className="legend">
        {isGrid ? (
          <>
            <span>
              <i className="sw default" />
              {t.legend.empty}
            </span>
            <span>
              <i className="sw compare" />
              {t.legend.wall}
            </span>
            <span>
              <i className="sw visit" />
              {t.legend.visited}
            </span>
            <span>
              <i className="sw current" />
              {t.legend.frontier}
            </span>
            <span>
              <i className="sw path" />
              {t.legend.path}
            </span>
          </>
        ) : (
          <>
            <span>
              <i className="sw default" />
              {t.legend.unsorted}
            </span>
            <span>
              <i className="sw compare" />
              {t.legend.comparing}
            </span>
            <span>
              <i className="sw swap" />
              {t.legend.swapping}
            </span>
            <span>
              <i className="sw sorted" />
              {t.legend.sorted}
            </span>
          </>
        )}
        <span style={{ marginLeft: 'auto', color: 'var(--txt-dim)' }}>
          step {stepIndex + 1} / {steps.length}
          {step && <> · {translateMsg(step.message ?? '').slice(0, 30)}...</>}
        </span>
      </div>
    </section>
  );
}
