import { useEffect, useState, useCallback, useRef } from 'react';
import { useVizStore } from '../store/useVizStore';
import { Topbar } from '../components/Topbar';
import { VizStage } from '../components/VizStage';
import { Controls } from '../components/Controls';
import { CrtOverlay } from '../components/crt/CrtOverlay';
import { useT } from '../i18n';
import { WorkerClient } from '../playground/workerClient';
import { EXAMPLES, BUBBLE_TEMPLATE, generateGridData } from '../playground/examples';
import type { PlaygroundExample } from '../playground/examples';
import { CodeEditor } from '../components/CodeEditor';
import { TracePanel } from '../components/TracePanel';
import { ExampleLibrary } from '../components/playground/ExampleLibrary';
import { DraftList } from '../components/playground/DraftList';
import { ShareDialog } from '../components/playground/ShareDialog';
import { ChallengePanel } from '../components/playground/ChallengePanel';
import { RunSummary } from '../components/playground/RunSummary';
import type { RunStats } from '../components/playground/RunSummary';
import { autoSaveDraft, loadAutoSaved } from '../playground/storage';
import { parseShareHash } from '../playground/share';
import { CHALLENGES } from '../playground/challenges';
import type { PlaygroundChallenge, ChallengeResult } from '../playground/challenges';
import type { PlaygroundInput } from '../playground/protocol';
import type { PlaygroundDraft } from '../playground/storage';

type DataKindTab = 'array' | 'string' | 'grid';

const DEFAULT_GRID = { rows: 8, cols: 8, wallRatio: 0.2 };

export function Playground() {
  const t = useT();
  const [dataKind, setDataKind] = useState<DataKindTab>('array');
  const [code, setCode] = useState(BUBBLE_TEMPLATE);
  const [running, setRunning] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [runStats, setRunStats] = useState<RunStats | null>(null);
  const [challengeResult, setChallengeResult] = useState<ChallengeResult | null>(null);

  // array input
  const [dataStr, setDataStr] = useState('42, 68, 35, 91, 27, 54, 73, 48');
  // string input
  const [textStr, setTextStr] = useState('ABABDABACDABABCABAB');
  const [patternStr, setPatternStr] = useState('ABABCABAB');
  // grid input
  const [gridRows, setGridRows] = useState(DEFAULT_GRID.rows);
  const [gridCols, setGridCols] = useState(DEFAULT_GRID.cols);
  const [gridWallRatio, setGridWallRatio] = useState(DEFAULT_GRID.wallRatio);
  const [gridData, setGridData] = useState(() => generateGridData(DEFAULT_GRID.rows, DEFAULT_GRID.cols, DEFAULT_GRID.wallRatio));
  const [gridStartR, setGridStartR] = useState(0);
  const [gridStartC, setGridStartC] = useState(0);
  const [gridTargetR, setGridTargetR] = useState(7);
  const [gridTargetC, setGridTargetC] = useState(7);

  const clientRef = useRef<WorkerClient | null>(null);
  if (!clientRef.current) clientRef.current = new WorkerClient();
  const client = clientRef.current;

  const loadCustomSteps = useVizStore((s) => s.loadCustomSteps);
  const appendSteps = useVizStore((s) => s.appendSteps);
  const storeError = useVizStore((s) => s.error);
  const clearError = useVizStore((s) => s.clearError);
  useEffect(() => {
    return () => client.terminate();
  }, [client]);

  const buildInput = useCallback((): PlaygroundInput => {
    switch (dataKind) {
      case 'array': {
        const parts = dataStr.split(',').map((s) => s.trim()).filter(Boolean);
        if (parts.length < 2 || parts.length > 64) throw new Error(t.playground.errorLength);
        const arr = parts.map(Number);
        if (arr.some(Number.isNaN)) throw new Error(t.playground.errorNumber);
        return { kind: 'array', data: arr };
      }
      case 'string':
        return { kind: 'string', text: textStr || '', pattern: patternStr || '' };
      case 'grid':
        return {
          kind: 'grid',
          data: gridData,
          cols: gridCols,
          start: [gridStartR, gridStartC],
          target: [gridTargetR, gridTargetC],
        };
    }
  }, [dataKind, dataStr, textStr, patternStr, gridData, gridCols, gridStartR, gridStartC, gridTargetR, gridTargetC, t]);

  const applyInput = useCallback((inp: PlaygroundInput) => {
    if (inp.kind === 'array') {
      setDataStr(inp.data.join(', '));
    } else if (inp.kind === 'string') {
      setTextStr(inp.text);
      setPatternStr(inp.pattern);
    } else if (inp.kind === 'grid') {
      setGridData([...inp.data]);
      setGridCols(inp.cols);
      if (inp.start) { setGridStartR(inp.start[0]); setGridStartC(inp.start[1]); }
      if (inp.target) { setGridTargetR(inp.target[0]); setGridTargetC(inp.target[1]); }
    }
  }, []);

  const runStartRef = useRef(0);

  const runCode = useCallback(async (src: string) => {
    let input: PlaygroundInput;
    try {
      input = buildInput();
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : String(e));
      return;
    }

    setRunning(true);
    setErrMsg(null);
    setRunStats(null);
    setChallengeResult(null);
    runStartRef.current = performance.now();
    let firstBatch = true;

    const res = await client.run({
      code: src,
      input,
      onProgress: (batch) => {
        if (firstBatch) {
          loadCustomSteps(batch, input);
          firstBatch = false;
        } else {
          appendSteps(batch);
        }
      },
    });

    if (res.type === 'error') {
      const lineInfo = res.line != null ? ` [行 ${res.line}]` : '';
      setErrMsg(`${res.message}${lineInfo}`);
      setRunning(false);
      return;
    }

    // 计算统计
    const allSteps = useVizStore.getState().steps;
    const duration = Math.round(performance.now() - runStartRef.current);
    const stats: RunStats = {
      total: allSteps.length,
      compare: allSteps.filter((s) => s.type === 'compare').length,
      swap: allSteps.filter((s) => s.type === 'swap').length,
      visit: allSteps.filter((s) => s.type === 'visit').length,
      mark: allSteps.filter((s) => s.type === 'mark').length,
      duration,
    };
    setRunStats(stats);

    // 判题
    if (challengeId) {
      const challenge = CHALLENGES.find((c) => c.id === challengeId);
      if (challenge) {
        const result = challenge.validate(allSteps);
        setChallengeResult(result);
      }
    }

    setRunning(false);
  }, [client, loadCustomSteps, appendSteps, buildInput, challengeId]);

  const handleRun = useCallback(() => {
    void runCode(code);
  }, [code, runCode]);

  // 切换 dataKind
  const handleKindChange = useCallback((kind: DataKindTab) => {
    setDataKind(kind);
    setErrMsg(null);
    const example = EXAMPLES.find((ex) => ex.dataKind === kind);
    if (example) {
      setCode(example.code);
      applyInput(example.input);
    }
  }, [applyInput]);

  // 选示例
  const handleSelectExample = useCallback((example: PlaygroundExample) => {
    setChallengeId(null);
    setDataKind(example.dataKind);
    setCode(example.code);
    applyInput(example.input);
  }, [applyInput]);

  // 加载草稿
  const handleLoadDraft = useCallback((draft: PlaygroundDraft) => {
    setChallengeId(null);
    setDataKind(draft.input.kind);
    setCode(draft.code);
    applyInput(draft.input);
  }, [applyInput]);

  // 选挑战
  const handleSelectChallenge = useCallback((challenge: PlaygroundChallenge) => {
    setChallengeId(challenge.id);
    setDataKind(challenge.dataKind);
    setCode(challenge.starterCode);
    applyInput(challenge.input);
  }, [applyInput]);

  // 退出挑战
  const handleExitChallenge = useCallback(() => {
    setChallengeId(null);
  }, []);

  // Ctrl+Enter 运行
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !running) {
      e.preventDefault();
      void runCode(code);
    }
  }, [code, runCode, running]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 重置网格
  const handleRegenerateGrid = useCallback(() => {
    setGridData(generateGridData(gridRows, gridCols, gridWallRatio));
    setGridStartR(0);
    setGridStartC(0);
    setGridTargetR(gridRows - 1);
    setGridTargetC(gridCols - 1);
  }, [gridRows, gridCols, gridWallRatio]);

  // 自动保存 (500ms debounce)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    let input: PlaygroundInput;
    try { input = buildInput(); } catch { return; }
    autoSaveTimerRef.current = setTimeout(() => {
      const now = Date.now();
      autoSaveDraft({ id: 'autosave', title: '', code, input, createdAt: now, updatedAt: now });
    }, 500);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [code, buildInput]);

  const runCodeRef = useRef(runCode);
  runCodeRef.current = runCode;

  // 从 URL hash 加载 + 自动运行
  useEffect(() => {
    const shareData = parseShareHash();
    if (shareData) {
      setCode(shareData.code);
      setDataKind(shareData.input.kind);
      applyInput(shareData.input);
      window.history.replaceState(null, '', window.location.pathname);
      const timer = setTimeout(() => runCodeRef.current(shareData.code), 100);
      return () => clearTimeout(timer);
    }
  }, [applyInput]);

  // 自动跑第一个示例（无 currentAlgo 时）
  useEffect(() => {
    if (useVizStore.getState().currentAlgo) return;
    const first = EXAMPLES.find((ex) => ex.id === 'bubble')!;
    setCode(first.code);
    if (first.input.kind === 'array') {
      setDataStr(first.input.data.join(', '));
    }
  }, []);

  // 自动恢复草稿（仅在首次加载且无 share hash 时）
  useEffect(() => {
    if (parseShareHash()) return;
    const autoSaved = loadAutoSaved();
    if (autoSaved && autoSaved.code !== BUBBLE_TEMPLATE) {
      setCode(autoSaved.code);
      setDataKind(autoSaved.input.kind);
      applyInput(autoSaved.input);
    }
  }, [applyInput]);

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
          {/* 左：API 速查 + 示例库 + 挑战题 + 草稿 */}
          <section className="pane">
            <div className="pane-hd">{t.playground.apiRef}</div>
            <div className="api-ref">
              <div className="kind-tabs">
                <button className={`kind-tab${dataKind === 'array' ? ' active' : ''}`} onClick={() => handleKindChange('array')}>{t.playground.tabArray}</button>
                <button className={`kind-tab${dataKind === 'string' ? ' active' : ''}`} onClick={() => handleKindChange('string')}>{t.playground.tabString}</button>
                <button className={`kind-tab${dataKind === 'grid' ? ' active' : ''}`} onClick={() => handleKindChange('grid')}>{t.playground.tabGrid}</button>
              </div>
              {dataKind === 'array' && (
                <>
                  <div><code>viz.compare(i, j)</code><span>{t.playground.compareDesc}</span></div>
                  <div><code>viz.swap(i, j)</code><span>{t.playground.swapDesc}</span></div>
                  <div><code>viz.set(i, v)</code><span>{t.playground.setDesc}</span></div>
                  <div><code>viz.mark(i, s)</code><span>{t.playground.markDesc}</span></div>
                  <div><code>viz.pointer(i, l)</code><span>{t.playground.pointerDesc}</span></div>
                  <div><code>viz.visit(i)</code><span>{t.playground.visitDesc}</span></div>
                  <div><code>viz.log(msg)</code><span>{t.playground.logDesc}</span></div>
                  <div><code>viz.done()</code><span>{t.playground.doneDesc}</span></div>
                  <div><code>viz.value(i)</code><span>{t.playground.valueDesc}</span></div>
                  <div><code>viz.length</code><span>{t.playground.lengthDesc}</span></div>
                </>
              )}
              {dataKind === 'string' && (
                <>
                  <div><code>viz.setText(s)</code><span>{t.playground.setTextDesc}</span></div>
                  <div><code>viz.setPattern(s)</code><span>{t.playground.setPatternDesc}</span></div>
                  <div><code>viz.markText(i, s)</code><span>{t.playground.markTextDesc}</span></div>
                  <div><code>viz.markPattern(i, s)</code><span>{t.playground.markPatternDesc}</span></div>
                  <div><code>viz.textCharAt(i)</code><span>{t.playground.textCharAtDesc}</span></div>
                  <div><code>viz.patternCharAt(i)</code><span>{t.playground.patternCharAtDesc}</span></div>
                  <div><code>viz.log(msg)</code><span>{t.playground.logDesc}</span></div>
                  <div><code>viz.done()</code><span>{t.playground.doneDesc}</span></div>
                  <div><code>viz.textLength</code><span>{t.playground.textLengthDesc}</span></div>
                  <div><code>viz.patternLength</code><span>{t.playground.patternLengthDesc}</span></div>
                </>
              )}
              {dataKind === 'grid' && (
                <>
                  <div><code>viz.index(r, c)</code><span>{t.playground.indexDesc}</span></div>
                  <div><code>viz.row(i) / viz.col(i)</code><span>{t.playground.rowDesc}</span></div>
                  <div><code>viz.inBounds(r, c)</code><span>{t.playground.inBoundsDesc}</span></div>
                  <div><code>viz.cellValue(r, c)</code><span>{t.playground.cellValueDesc}</span></div>
                  <div><code>viz.markCell(r, c, s)</code><span>{t.playground.markCellDesc}</span></div>
                  <div><code>viz.visitCell(r, c)</code><span>{t.playground.visitCellDesc}</span></div>
                  <div><code>viz.setCell(r, c, v)</code><span>{t.playground.setCellDesc}</span></div>
                  <div><code>viz.setStart(r, c)</code><span>{t.playground.setStartDesc}</span></div>
                  <div><code>viz.setTarget(r, c)</code><span>{t.playground.setTargetDesc}</span></div>
                  <div><code>viz.setCols(c)</code><span>{t.playground.setColsDesc}</span></div>
                  <div><code>viz.log(msg)</code><span>{t.playground.logDesc}</span></div>
                  <div><code>viz.done()</code><span>{t.playground.doneDesc}</span></div>
                  <div><code>viz.rows / viz.cols</code><span>{t.playground.rowsDesc}</span></div>
                </>
              )}
            </div>

            <ExampleLibrary dataKind={dataKind} onSelect={handleSelectExample} />
            <ChallengePanel
              activeChallengeId={challengeId}
              onSelect={handleSelectChallenge}
              onExit={handleExitChallenge}
            />
            <DraftList onLoadDraft={handleLoadDraft} currentCode={code} currentInput={buildInput()} />
          </section>

          {/* 中：画布 */}
          <VizStage />

          {/* 右：编辑器 + 输入 */}
          <section className="pane">
            <div className="pane-hd">
              <span>{t.playground.editor}</span>
              {challengeId && (
                <span className="challenge-badge">
                  {CHALLENGES.find((c) => c.id === challengeId)?.title ?? t.playground.challengeMode}
                </span>
              )}
            </div>
            <CodeEditor value={code} onChange={setCode} />
            <TracePanel />
            <div className="editor-controls">
              {dataKind === 'array' && (
                <>
                  <label className="data-label">{t.playground.data}</label>
                  <input
                    className="data-input"
                    value={dataStr}
                    onChange={(e) => setDataStr(e.target.value)}
                    placeholder="42, 68, 35, ..."
                  />
                </>
              )}
              {dataKind === 'string' && (
                <>
                  <label className="data-label">{t.playground.text}</label>
                  <input
                    className="data-input"
                    value={textStr}
                    onChange={(e) => setTextStr(e.target.value)}
                  />
                  <label className="data-label">{t.playground.pattern}</label>
                  <input
                    className="data-input"
                    value={patternStr}
                    onChange={(e) => setPatternStr(e.target.value)}
                  />
                </>
              )}
              {dataKind === 'grid' && (
                <div className="grid-controls">
                  <label className="data-label">{t.playground.rows}</label>
                  <input type="number" className="data-input sm" value={gridRows} min={3} max={20}
                    onChange={(e) => { const v = Math.max(3, Math.min(20, Number(e.target.value))); setGridRows(v); setGridTargetR(v - 1); }} />
                  <label className="data-label">{t.playground.cols}</label>
                  <input type="number" className="data-input sm" value={gridCols} min={3} max={20}
                    onChange={(e) => { const v = Math.max(3, Math.min(20, Number(e.target.value))); setGridCols(v); setGridTargetC(v - 1); }} />
                  <label className="data-label">{t.playground.wallRatio}</label>
                  <input type="number" className="data-input sm" value={gridWallRatio} min={0} max={0.5} step={0.05}
                    onChange={(e) => setGridWallRatio(Math.max(0, Math.min(0.5, Number(e.target.value))))} />
                  <button className="btn" onClick={handleRegenerateGrid}>{t.playground.regenerate}</button>
                </div>
              )}
              <div className="btn-row">
                <button className="btn primary" onClick={handleRun} disabled={running}>
                  {running ? t.playground.running : t.playground.run}
                </button>
                <button className="btn" onClick={() => setShowShare(true)} disabled={running}>
                  {t.playground.share}
                </button>
              </div>
              {challengeId && (
                <button className="btn" onClick={handleExitChallenge}>
                  {t.playground.exitChallenge}
                </button>
              )}
            </div>
          </section>
        </div>
        <Controls />
      </div>
      {showShare && (
        <ShareDialog code={code} input={buildInput()} onClose={() => setShowShare(false)} />
      )}
      {runStats && (
        <RunSummary
          stats={runStats}
          challengeResult={challengeResult}
          onClose={() => { setRunStats(null); setChallengeResult(null); }}
        />
      )}
    </>
  );
}
