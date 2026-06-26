// ============================================================
// VizStage — 可视化舞台（Canvas 画布 + 标题 + 图例）
// 监听 store 的 stepIndex 变化，调用 Renderer 绘制当前帧
// 支持对比模式分屏显示
// ============================================================

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
import type { Snapshot, Step } from '../engine/types';
import type { Algorithm } from '../algorithms/types';

/**
 * 根据 snapshot.kind 选择对应 Renderer
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
      return LinkedListRenderer;
    default:
      return ArrayRenderer;
  }
}

/** 选择正确的渲染器 */
function getRenderer(snap: Snapshot): Renderer<Snapshot> {
  if (snap.dpGrid !== undefined) return DPGridRenderer;
  if (snap.hashTable !== undefined) return HashTableRenderer;
  return pickRenderer(snap.kind);
}

/** 绘制单个画布 */
function drawCanvas(
  canvas: HTMLCanvasElement,
  step: Step | undefined,
): void {
  if (!step) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const snap = step.snapshot;
  const renderer = getRenderer(snap);

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
}

/** 单个算法面板组件 */
function AlgorithmPanel({
  algo,
  steps,
  stepIndex,
  compareCount,
  swapCount,
  canvasRef,
}: {
  algo: Algorithm;
  steps: Step[];
  stepIndex: number;
  compareCount: number;
  swapCount: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  const t = useT();
  const translateMsg = useTranslateMessage();

  const step = steps[stepIndex];
  const isTree = algo.dataKind === 'tree';
  const isGrid = algo.dataKind === 'grid';

  const getSignature = () => {
    if (isTree) return '()';
    if (isGrid) return '(grid)';
    return '(arr)';
  };

  // 绘制
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCanvas(canvas, step);
  }, [step, canvasRef]);

  // 窗口大小变化时重绘
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => drawCanvas(canvas, step);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [step, canvasRef]);

  return (
    <div className="compare-side">
      {/* 标题栏 */}
      <div className="compare-header">
        <div className="algo-name">
          ▸ {algo.name}{getSignature()}
        </div>
        <div className="algo-stats">
          <span>{t.viz.time} <b>{algo.complexity.time}</b></span>
          <span>{t.viz.space} <b>{algo.complexity.space}</b></span>
          <span className="amber">{t.stats.comparisons}: {compareCount}</span>
          <span>{t.stats.swaps}: {swapCount}</span>
        </div>
      </div>

      {/* Canvas 画布 */}
      <div className="viz-stage">
        <canvas ref={canvasRef} />
        {!isTree && !isGrid && <div className="axis-label">index →</div>}
      </div>

      {/* 步骤信息 */}
      {step && (
        <div className="step-info">
          <span className="step-msg">
            {translateMsg(step.message ?? '').slice(0, 40)}
          </span>
          <span className="step-idx">
            {stepIndex + 1}/{steps.length}
          </span>
        </div>
      )}
    </div>
  );
}

export function VizStage() {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const compareCanvasRef = useRef<HTMLCanvasElement>(null);

  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const steps = useVizStore((s) => s.steps);
  const stepIndex = useVizStore((s) => s.stepIndex);
  const compareCount = useVizStore((s) => s.compareCount);
  const swapCount = useVizStore((s) => s.swapCount);

  const compareMode = useVizStore((s) => s.compareMode);
  const compareAlgo = useVizStore((s) => s.compareAlgo);
  const compareSteps = useVizStore((s) => s.compareSteps);
  const compareStepIndex = useVizStore((s) => s.compareStepIndex);
  const compareCompareCount = useVizStore((s) => s.compareCompareCount);
  const compareSwapCount = useVizStore((s) => s.compareSwapCount);

  const algorithms = useVizStore((s) => s.algorithms);
  const setCompareAlgo = useVizStore((s) => s.setCompareAlgo);

  const t = useT();
  const translateMsg = useTranslateMessage();

  // 主画布绘制
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas || steps.length === 0) return;
    drawCanvas(canvas, steps[stepIndex]);
  }, [steps, stepIndex]);

  // 对比画布绘制
  useEffect(() => {
    if (!compareMode) return;
    const canvas = compareCanvasRef.current;
    if (!canvas || compareSteps.length === 0) return;
    drawCanvas(canvas, compareSteps[compareStepIndex]);
  }, [compareMode, compareSteps, compareStepIndex]);

  // 窗口大小变化时重绘
  useEffect(() => {
    const onResize = () => {
      const mainCanvas = mainCanvasRef.current;
      if (mainCanvas && steps.length > 0) {
        drawCanvas(mainCanvas, steps[stepIndex]);
      }
      if (compareMode) {
        const compareCanvas = compareCanvasRef.current;
        if (compareCanvas && compareSteps.length > 0) {
          drawCanvas(compareCanvas, compareSteps[compareStepIndex]);
        }
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [steps, stepIndex, compareMode, compareSteps, compareStepIndex]);

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

  // 对比模式
  if (compareMode) {
    const { complexity } = currentAlgo;

    // 可选的对比算法（排除当前算法）
    const availableAlgos = algorithms.filter((a) => a.id !== currentAlgo.id);

    return (
      <section className="pane center">
        {/* 标题栏 */}
        <div className="viz-hd">
          <div className="viz-title">▸ 对比模式</div>
          <div className="badges">
            <span className="badge">
              {t.viz.time} <b>{complexity.time}</b>
            </span>
            <span className="badge">
              {t.viz.space} <b>{complexity.space}</b>
            </span>
          </div>
          {/* 对比算法选择 */}
          <select
            className="compare-select"
            value={compareAlgo?.id ?? ''}
            onChange={(e) => setCompareAlgo(e.target.value)}
          >
            {availableAlgos.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name}
              </option>
            ))}
          </select>
        </div>

        {/* 分屏画布 */}
        <div className="compare-container">
          <AlgorithmPanel
            algo={currentAlgo}
            steps={steps}
            stepIndex={stepIndex}
            compareCount={compareCount}
            swapCount={swapCount}
            canvasRef={mainCanvasRef}
          />
          {compareAlgo && (
            <AlgorithmPanel
              algo={compareAlgo}
              steps={compareSteps}
              stepIndex={compareStepIndex}
              compareCount={compareCompareCount}
              swapCount={compareSwapCount}
              canvasRef={compareCanvasRef}
            />
          )}
        </div>

        {/* 图例 */}
        <div className="legend">
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
          <span style={{ marginLeft: 'auto', color: 'var(--txt-dim)' }}>
            主: {stepIndex + 1}/{steps.length} · 对比: {compareStepIndex + 1}/{compareSteps.length}
          </span>
        </div>
      </section>
    );
  }

  // 普通模式
  const { complexity } = currentAlgo;
  const step = steps[stepIndex];
  const isTree = currentAlgo.dataKind === 'tree';
  const isGrid = currentAlgo.dataKind === 'grid';

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
          <Link to={`/algo/${currentAlgo.id}/learn`} className="badge learn-link">
            📖 讲解
          </Link>
        </div>
      </div>

      {/* Canvas 画布 */}
      <div className="viz-stage">
        <canvas ref={mainCanvasRef} />
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
