// ============================================================
// CodePanel — 代码面板（右侧）
// 用 Prism.js 高亮代码，当前执行行琥珀高亮
// ============================================================

import { useMemo } from 'react';
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

  const currentStep = steps[stepIndex];
  const currentLine = currentStep?.line ?? 0;

  return (
    <aside className="pane right">
      <div className="pane-hd">
        {t.code.title} <span className="hint">{t.code.line} {currentLine || '—'}</span>
      </div>
      <div className="code">
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

  return (
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
  );
}
