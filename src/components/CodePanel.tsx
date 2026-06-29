// ============================================================
// CodePanel — 代码面板（右侧）
// 用 Prism.js 高亮代码，当前执行行琥珀高亮
// ============================================================

import { useMemo, useRef, useEffect, useCallback } from 'react';
import Prism from 'prismjs';
import { useVizStore } from '../store/useVizStore';
import { useT, useTranslateMessage } from '../i18n';

/**
 * 高亮代码字符串并拆分为行
 * Prism 返回的 HTML 保留换行符
 */
function highlightCode(codeLines: string[]): string[] {
  const code = codeLines.join('\n');
  const html = Prism.highlight(code, Prism.languages.javascript, 'javascript');
  return html.split('\n');
}

export function CodePanel() {
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const steps = useVizStore((s) => s.steps);
  const stepIndex = useVizStore((s) => s.stepIndex);
  const t = useT();
  const translateMsg = useTranslateMessage();

  // 预计算高亮后的行（仅在算法切换时重算）
  const highlightedLines = useMemo(() => {
    if (!currentAlgo) return [];
    return highlightCode(currentAlgo.codeLines);
  }, [currentAlgo]);

  const codeRef = useRef<HTMLDivElement>(null);
  const currentStep = steps[stepIndex];
  const currentLine = currentStep?.line ?? 0;

  // 自动滚动到当前行
  useEffect(() => {
    const el = codeRef.current;
    if (!el || currentLine === 0) return;
    const target = el.querySelector(`.ln.cur`) as HTMLElement | null;
    if (!target) return;
    const containerTop = el.scrollTop;
    const containerBottom = containerTop + el.clientHeight;
    const targetTop = target.offsetTop;
    const targetBottom = targetTop + target.offsetHeight;
    if (targetTop < containerTop || targetBottom > containerBottom) {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [currentLine]);

  if (!currentAlgo || steps.length === 0) {
    return (
      <aside className="pane right">
        <div className="pane-hd">
          {t.code.title} <span className="hint">—</span>
        </div>
        <div
          className="code"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--green-faint)',
          }}
        >
          {t.code.selectAlgo}
        </div>
      </aside>
    );
  }

  return (
    <aside className="pane right">
      <div className="pane-hd">
        {t.code.title} <span className="hint">{t.code.line} {currentLine || '—'}</span>
      </div>
      <div className="code" ref={codeRef}>
        {highlightedLines.map((html, i) => {
          const lineNum = i + 1; // 1-based
          const isCurrent = lineNum === currentLine;
          return (
            <div key={i} className={`ln${isCurrent ? ' cur' : ''}`}>
              <span className="no">{lineNum}</span>
              <span
                className="tx"
                dangerouslySetInnerHTML={{ __html: html || ' ' }}
              />
            </div>
          );
        })}
        {/* 步骤说明注释 */}
        {currentStep?.message && (
          <div className="ln" style={{ marginTop: 8 }}>
            <span className="no" />
            <span className="tx">
              <span className="token comment">
                {'// '}
                {translateMsg(currentStep.message)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* 步骤说明 */}
      <div className="step-box">
        <div className="lbl">{t.code.currentStep}</div>
        <div className="msg">
          {currentStep?.message ? `▸ ${translateMsg(currentStep.message)}` : t.code.ready}
        </div>
      </div>

      {/* 统计 */}
      <StatsPanel />
    </aside>
  );
}

/** 统计面板子组件 */
function StatsPanel() {
  const compareCount = useVizStore((s) => s.compareCount);
  const swapCount = useVizStore((s) => s.swapCount);
  const stepIndex = useVizStore((s) => s.stepIndex);
  const steps = useVizStore((s) => s.steps);
  const t = useT();

  const chartRef = useRef<HTMLCanvasElement>(null);

  // 预计算累计比较/交换次数
  const trendData = useMemo(() => {
    const cmp: number[] = [0];
    const swp: number[] = [0];
    let c = 0, s = 0;
    for (const step of steps) {
      if (step.type === 'compare') c++;
      if (step.type === 'swap') s++;
      cmp.push(c);
      swp.push(s);
    }
    return { cmp, swp };
  }, [steps]);

  // 绘制趋势图
  const drawChart = useCallback(() => {
    const canvas = chartRef.current;
    if (!canvas || trendData.cmp.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const pad = { top: 8, right: 8, bottom: 16, left: 32 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const { cmp, swp } = trendData;
    const maxVal = Math.max(...cmp, ...swp, 1);
    const totalSteps = cmp.length - 1;

    // 网格线
    ctx.strokeStyle = '#1a2a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      ctx.fillStyle = '#3a6b4a';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(Math.round((maxVal / 4) * (4 - i))), pad.left - 4, y);
    }

    // 绘制折线
    function drawLine(data: number[], color: string) {
      const g = ctx!;
      g.strokeStyle = color;
      g.lineWidth = 1.5;
      g.shadowBlur = 4;
      g.shadowColor = color;
      g.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = pad.left + (i / totalSteps) * plotW;
        const y = pad.top + plotH - (data[i] / maxVal) * plotH;
        if (i === 0) { g.moveTo(x, y); } else { g.lineTo(x, y); }
      }
      g.stroke();
      g.shadowBlur = 0;
    }

    drawLine(cmp, '#ffb000');
    drawLine(swp, '#33ff66');

    // 当前步骤标记
    const curX = pad.left + (stepIndex / totalSteps) * plotW;
    ctx.strokeStyle = '#ff5555';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(curX, pad.top);
    ctx.lineTo(curX, pad.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // X轴标签
    ctx.fillStyle = '#3a6b4a';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('0', pad.left, pad.top + plotH + 2);
    ctx.fillText(String(totalSteps), pad.left + plotW, pad.top + plotH + 2);
  }, [trendData, stepIndex]);

  useEffect(() => { drawChart(); }, [drawChart]);

  useEffect(() => {
    window.addEventListener('resize', drawChart);
    return () => window.removeEventListener('resize', drawChart);
  }, [drawChart]);

  return (
    <>
      <div className="stats">
        <div className="stat">
          <div className="k">{t.stats.comparisons}</div>
          <div className="v amber">{compareCount}</div>
        </div>
        <div className="stat">
          <div className="k">{t.stats.swaps}</div>
          <div className="v">{swapCount}</div>
        </div>
        <div className="stat">
          <div className="k">{t.stats.currentStep}</div>
          <div className="v">{stepIndex + 1}</div>
        </div>
        <div className="stat">
          <div className="k">{t.stats.totalSteps}</div>
          <div className="v">{steps.length}</div>
        </div>
      </div>
      <div className="trend-chart">
        <div className="trend-hd">
          复杂度趋势
          <span className="trend-legend">
            <i className="sw compare" /> 比较
            <i className="sw swap" /> 交换
          </span>
        </div>
        <canvas ref={chartRef} className="trend-canvas" />
      </div>
    </>
  );
}
