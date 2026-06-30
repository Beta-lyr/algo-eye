// ============================================================
// Playground — V3 自定义代码可视化页
// 左：viz API 速查  中：VizStage（复用）  右：代码编辑器+运行
// 底：Controls（复用）。Worker 产出 steps → loadCustomSteps 灌入 store
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { useVizStore } from '../store/useVizStore';
import { Topbar } from '../components/Topbar';
import { VizStage } from '../components/VizStage';
import { Controls } from '../components/Controls';
import { CrtOverlay } from '../components/crt/CrtOverlay';
import { useT } from '../i18n';
import { WorkerClient } from '../playground/workerClient';
import { BUBBLE_TEMPLATE } from '../playground/templates';
import { CodeEditor } from '../components/CodeEditor';
import { TracePanel } from '../components/TracePanel';
import type { Step } from '../engine/types';

const DEFAULT_DATA = [42, 68, 35, 91, 27, 54, 73, 48];

export function Playground() {
  const t = useT();
  const [code, setCode] = useState(BUBBLE_TEMPLATE);
  const [dataStr, setDataStr] = useState(DEFAULT_DATA.join(', '));
  const [running, setRunning] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Worker 客户端：组件持有，卸载时销毁子线程
  const clientRef = useRef<WorkerClient | null>(null);
  if (!clientRef.current) clientRef.current = new WorkerClient();
  const client = clientRef.current;

  const loadCustomSteps = useVizStore((s) => s.loadCustomSteps);
  const storeError = useVizStore((s) => s.error);
  const clearError = useVizStore((s) => s.clearError);

  // 卸载时终止 Worker
  useEffect(() => {
    return () => client.terminate();
  }, [client]);

  /** 解析数据字符串为 number[]，校验长度与合法性 */
  const parseData = useCallback((str: string): number[] => {
    const parts = str.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length < 2 || parts.length > 64) {
      throw new Error(t.playground.errorLength);
    }
    const arr = parts.map((s) => Number(s));
    if (arr.some(Number.isNaN)) {
      throw new Error(t.playground.errorNumber);
    }
    return arr;
  }, [t]);

  /** 执行用户代码：跑 Worker → 灌 steps / 显示错误 */
  const runCode = useCallback(async (src: string, data: number[]) => {
    setRunning(true);
    setErrMsg(null);
    const res = await client.run({ code: src, data, dataKind: 'array' });
    if (res.type === 'steps') {
      loadCustomSteps(res.steps as Step[], data);
    } else if (res.type === 'error') {
      setErrMsg(res.message);
    }
    setRunning(false);
  }, [client, loadCustomSteps]);

  const handleRun = useCallback(() => {
    let data: number[];
    try {
      data = parseData(dataStr);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : String(e));
      return;
    }
    void runCode(code, data);
  }, [code, dataStr, parseData, runCode]);

  // 首次进入：自动跑一次模板，展示能力（store 无 currentAlgo 时）
  useEffect(() => {
    if (useVizStore.getState().currentAlgo) return;
    void runCode(BUBBLE_TEMPLATE, DEFAULT_DATA);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <CrtOverlay />
      {(storeError || errMsg) && (
        <div className="error-banner">
          <span>! {errMsg ?? storeError}</span>
          <button className="btn" onClick={() => { if (errMsg) setErrMsg(null); else clearError(); }}>✕</button>
        </div>
      )}
      <div className="app">
        <Topbar />
        <div className="main">
          {/* 左：viz API 速查 */}
          <section className="pane">
            <div className="pane-hd">{t.playground.apiRef}</div>
            <div className="api-ref">
              <div><code>viz.compare(i, j)</code><span>{t.playground.compareDesc}</span></div>
              <div><code>viz.swap(i, j)</code><span>{t.playground.swapDesc}</span></div>
              <div><code>viz.set(i, v)</code><span>{t.playground.setDesc}</span></div>
              <div><code>viz.mark(i, 'sorted')</code><span>{t.playground.markDesc}</span></div>
              <div><code>viz.pointer(i, 'p')</code><span>{t.playground.pointerDesc}</span></div>
              <div><code>viz.visit(i)</code><span>{t.playground.visitDesc}</span></div>
              <div><code>viz.log(msg)</code><span>{t.playground.logDesc}</span></div>
              <div><code>viz.done()</code><span>{t.playground.doneDesc}</span></div>
              <div><code>viz.value(i)</code><span>{t.playground.valueDesc}</span></div>
              <div><code>viz.length</code><span>{t.playground.lengthDesc}</span></div>
            </div>
          </section>

          {/* 中：画布（复用 VizStage，读 store currentAlgo/steps） */}
          <VizStage />

          {/* 右：代码编辑器 + 运行 */}
          <section className="pane">
            <div className="pane-hd">{t.playground.editor}</div>
            <CodeEditor value={code} onChange={setCode} />
            <TracePanel />
            <div className="editor-controls">
              <label className="data-label">{t.playground.data}</label>
              <input
                className="data-input"
                value={dataStr}
                onChange={(e) => setDataStr(e.target.value)}
                placeholder="42, 68, 35, ..."
              />
              <button className="btn primary" onClick={handleRun} disabled={running}>
                {running ? t.playground.running : t.playground.run}
              </button>
            </div>
          </section>
        </div>
        <Controls />
      </div>
    </>
  );
}
