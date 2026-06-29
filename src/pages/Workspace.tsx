// ============================================================
// Workspace — 主工作区页面
// 组合 Topbar / AlgorithmTree / VizStage / CodePanel / Controls / CrtOverlay
// 支持从 URL 参数加载状态
// ============================================================

import { useEffect } from 'react';
import { useVizStore } from '../store/useVizStore';
import { Topbar } from '../components/Topbar';
import { AlgorithmTree } from '../components/AlgorithmTree';
import { VizStage } from '../components/VizStage';
import { CodePanel } from '../components/CodePanel';
import { Controls } from '../components/Controls';
import { CrtOverlay } from '../components/crt/CrtOverlay';

export function Workspace() {
  const loadFromUrl = useVizStore((s) => s.loadFromUrl);
  const selectAlgorithm = useVizStore((s) => s.selectAlgorithm);
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const algorithms = useVizStore((s) => s.algorithms);
  const error = useVizStore((s) => s.error);
  const clearError = useVizStore((s) => s.clearError);
  const focusMode = useVizStore((s) => s.focusMode);

  // 从 URL 参数加载状态
  useEffect(() => {
    const loaded = loadFromUrl();
    if (!loaded && !currentAlgo && algorithms.length > 0) {
      selectAlgorithm(algorithms[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <CrtOverlay />
      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button className="btn" onClick={clearError}>✕</button>
        </div>
      )}
      <div className="app">
        <Topbar />
        <div className={`main${focusMode ? ' focus' : ''}`}>
          <AlgorithmTree />
          <VizStage />
          <CodePanel />
        </div>
        <Controls />
      </div>
    </>
  );
}
