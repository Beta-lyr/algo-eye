// ============================================================
// VizStage — 可视化舞台（Canvas 画布 + 标题 + 图例）
// 监听 store 的 stepIndex 变化，调用 Renderer 绘制当前帧
// 支持对比模式分屏显示
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react';
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
import type { Snapshot, Step, ElementState } from '../engine/types';
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

/** 缓动函数（平滑减速） */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** 线性插值 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** 插值两个数据数组 */
function interpData(prev: number[], curr: number[], t: number): number[] {
  const len = Math.max(prev.length, curr.length);
  const result = new Array<number>(len);
  for (let i = 0; i < len; i++) {
    const a = i < prev.length ? prev[i] : (i < curr.length ? curr[i] : 0);
    const b = i < curr.length ? curr[i] : (i < prev.length ? prev[i] : 0);
    result[i] = lerp(a, b, t);
  }
  return result;
}

/** 绘制单个画布 */
function drawCanvas(
  canvas: HTMLCanvasElement,
  step: Step | undefined,
  selectedIndices?: number[],
  interpDataArr?: number[],
): void {
  if (!step) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rawSnap = step.snapshot;
  let snap = selectedIndices?.length
    ? { ...rawSnap, states: { ...rawSnap.states, ...Object.fromEntries(selectedIndices.map((i) => [i, 'pivot' as const])) } }
    : rawSnap;

  // 插值替换 data
  if (interpDataArr && snap.data) {
    snap = { ...snap, data: interpDataArr };
  }

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

  const manualMode = useVizStore((s) => s.manualMode);
  const selectedIndices = useVizStore((s) => s.selectedIndices);
  const hintMessage = useVizStore((s) => s.hintMessage);
  const selectIndex = useVizStore((s) => s.selectIndex);
  const data = useVizStore((s) => s.data);

  const focusMode = useVizStore((s) => s.focusMode);
  const toggleFocusMode = useVizStore((s) => s.toggleFocusMode);

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

  // 柱状图悬停 tooltip
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; index: number; value: number } | null>(null);

  /** 将 canvas 坐标映射为数组下标 */
  const xyToIndex = useCallback((clientX: number, canvas: HTMLCanvasElement): number | null => {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const n = data.length;
    const paddingX = 40;
    const barGap = 6;
    const barWidth = Math.max(4, (rect.width - paddingX * 2 - barGap * (n - 1)) / n);
    const index = Math.floor((x - paddingX) / (barWidth + barGap));
    if (index < 0 || index >= n) return null;
    const barX = paddingX + index * (barWidth + barGap);
    if (x < barX || x > barX + barWidth) return null;
    return index;
  }, [data.length]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas || !currentAlgo || currentAlgo.dataKind !== 'array') {
      setTooltip(null);
      return;
    }
    const idx = xyToIndex(e.clientX, canvas);
    if (idx === null) { setTooltip(null); return; }
    const rect = canvas.getBoundingClientRect();
    setTooltip({ visible: true, x: e.clientX - rect.left, y: e.clientY - rect.top, index: idx, value: data[idx] });
  }, [currentAlgo, data, xyToIndex]);

  const handleCanvasMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const challengeActive = useVizStore((s) => s.challengeActive);
  const challengeData = useVizStore((s) => s.challengeData);
  const challengeSwap = useVizStore((s) => s.challengeSwap);

  // 挑战模式：点击两个下标进行交换
  const [challengeSel, setChallengeSel] = useState<number | null>(null);

  // 手动模式：canvas 点击 → 映射为数组下标
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas || !currentAlgo || currentAlgo.dataKind !== 'array') return;
    const idx = xyToIndex(e.clientX, canvas);
    if (idx === null) return;

    if (challengeActive) {
      if (challengeSel === null) {
        setChallengeSel(idx);
      } else {
        challengeSwap(challengeSel, idx);
        setChallengeSel(null);
      }
      return;
    }

    if (manualMode) {
      selectIndex(idx);
    }
  }, [manualMode, currentAlgo, xyToIndex, selectIndex, challengeActive, challengeSel, challengeSwap]);

  // 动画插值 refs
  const prevDataRef = useRef<number[]>([]);
  const transitionRef = useRef(1);
  const rafRef = useRef(0);
  const interpDataRef = useRef<number[]>([]);

  // 主画布绘制（含插值动画）
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const step = steps[stepIndex];

    // 挑战模式：使用 challengeData 直接绘制柱子
    if (challengeActive && challengeData.length > 0) {
      const states: Record<number, ElementState> = {};
      if (challengeSel !== null) {
        states[challengeSel] = 'pivot';
      }
      const fakeStep: Step = {
        type: 'mark',
        line: 0,
        message: '',
        snapshot: { kind: 'array', data: challengeData, states },
      };
      drawCanvas(canvas, fakeStep);
      return;
    }

    if (!step || steps.length === 0) return;

    const currentData = step.snapshot.data;

    // 仅对 array kind 启用插值
    if (currentData && currentData.length > 0 && currentAlgo?.dataKind === 'array') {
      const prev = prevDataRef.current;
      if (prev.length === currentData.length && prev.some((v, i) => v !== currentData[i])) {
        transitionRef.current = 0;
        const startTime = performance.now();
        const duration = 250;

        const animate = (now: number) => {
          const elapsed = now - startTime;
          const t = Math.min(elapsed / duration, 1);
          const eased = easeOutCubic(t);
          interpDataRef.current = interpData(prev, currentData, eased);
          drawCanvas(canvas, step, selectedIndices, interpDataRef.current);
          if (t < 1) {
            rafRef.current = requestAnimationFrame(animate);
          } else {
            transitionRef.current = 1;
            drawCanvas(canvas, step, selectedIndices);
          }
        };
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
      } else {
        drawCanvas(canvas, step, selectedIndices);
      }
      prevDataRef.current = [...currentData];
    } else {
      drawCanvas(canvas, step, selectedIndices);
    }
  }, [steps, stepIndex, selectedIndices, currentAlgo, challengeActive, challengeData, challengeSel]);

  // 卸载时清理 RAF
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

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
        drawCanvas(mainCanvas, steps[stepIndex], selectedIndices);
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
  }, [steps, stepIndex, compareMode, compareSteps, compareStepIndex, selectedIndices]);

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
          <span
            className="badge focus-btn"
            onClick={toggleFocusMode}
            title="焦点模式"
          >
            {focusMode ? '⊞' : '⊟'}
          </span>
          <span
            className="badge focus-btn"
            onClick={() => { if (document.fullscreenElement) { document.exitFullscreen(); } else { document.documentElement.requestFullscreen(); } }}
            title="全屏"
          >
            ⛶
          </span>
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
          <span
            className="badge focus-btn"
            onClick={toggleFocusMode}
            title="焦点模式"
          >
            {focusMode ? '⊞' : '⊟'}
          </span>
          <span
            className="badge focus-btn"
            onClick={() => { if (document.fullscreenElement) { document.exitFullscreen(); } else { document.documentElement.requestFullscreen(); } }}
            title="全屏"
          >
            ⛶
          </span>
        </div>
      </div>

      {/* Canvas 画布 */}
      <div className="viz-stage">
        <canvas
          ref={mainCanvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          style={{ cursor: challengeActive ? 'pointer' : (manualMode && currentAlgo?.dataKind === 'array' ? 'crosshair' : undefined) }}
        />
        {tooltip && tooltip.visible && (
          <div
            className="bar-tooltip"
            style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
          >
            <span className="tt-index">[{tooltip.index}]</span>
            <span className="tt-value">{tooltip.value}</span>
          </div>
        )}
        {!isTree && !isGrid && <div className="axis-label">index →</div>}
      </div>

      {/* 手动模式提示 */}
      {manualMode && (
        <div className="manual-hint">
          {hintMessage || (
            selectedIndices.length === 0
              ? `🔍 ${translateMsg(steps[stepIndex]?.message ?? '').slice(0, 36)} — 请点击对应的柱体`
              : `已选中 [${selectedIndices.join(', ')}]，请选择另一个`
          )}
        </div>
      )}

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
