// ============================================================
// Workspace — 主工作区页面
// 组合 Topbar / AlgorithmTree / VizStage / CodePanel / Controls / CrtOverlay
// ============================================================

import { Topbar } from '../components/Topbar';
import { AlgorithmTree } from '../components/AlgorithmTree';
import { VizStage } from '../components/VizStage';
import { CodePanel } from '../components/CodePanel';
import { Controls } from '../components/Controls';
import { CrtOverlay } from '../components/crt/CrtOverlay';

export function Workspace() {
  return (
    <>
      <CrtOverlay />
      <div className="app">
        <Topbar />
        <div className="main">
          <AlgorithmTree />
          <VizStage />
          <CodePanel />
        </div>
        <Controls />
      </div>
    </>
  );
}
