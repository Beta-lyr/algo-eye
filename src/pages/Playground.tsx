import { useEffect, useState, useCallback, useRef } from 'react';
import { useVizStore } from '../store/useVizStore';
import { Topbar } from '../components/Topbar';
import { VizStage } from '../components/VizStage';
import { Controls } from '../components/Controls';
import { CrtOverlay } from '../components/crt/CrtOverlay';
import { useT } from '../i18n';
import { WorkerClient } from '../playground/workerClient';
import { TEMPLATES, BUBBLE_TEMPLATE } from '../playground/templates';
import { CodeEditor } from '../components/CodeEditor';
import { TracePanel } from '../components/TracePanel';
import type { PlaygroundInput } from '../playground/protocol';

type DataKindTab = 'array' | 'string' | 'grid';

function generateGridData(rows: number, cols: number, wallRatio: number): number[] {
  const data: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      data.push(isBorder ? 0 : Math.random() < wallRatio ? -1 : 0);
    }
  }
  return data;
}

const DEFAULT_GRID = { rows: 8, cols: 8, wallRatio: 0.2 };

export function Playground() {
  const t = useT();
  const [dataKind, setDataKind] = useState<DataKindTab>('array');
  const [code, setCode] = useState(BUBBLE_TEMPLATE);
  const [running, setRunning] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

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
    }
    setRunning(false);
  }, [client, loadCustomSteps, appendSteps, buildInput]);

  const handleRun = useCallback(() => {
    void runCode(code);
  }, [code, runCode]);

  // 切换 dataKind → 找第一个匹配的模板，否则保持代码
  const handleKindChange = useCallback((kind: DataKindTab) => {
    setDataKind(kind);
    setErrMsg(null);
    const template = TEMPLATES.find((t) => t.input.kind === kind);
    if (template) {
      setCode(template.code);
      // 初始化输入
      if (kind === 'array' && template.input.kind === 'array') {
        setDataStr(template.input.data.join(', '));
      } else if (kind === 'string' && template.input.kind === 'string') {
        setTextStr(template.input.text);
        setPatternStr(template.input.pattern);
      } else if (kind === 'grid' && template.input.kind === 'grid') {
        setGridData([...template.input.data]);
        setGridCols(template.input.cols);
        if (template.input.start) { setGridStartR(template.input.start[0]); setGridStartC(template.input.start[1]); }
        if (template.input.target) { setGridTargetR(template.input.target[0]); setGridTargetC(template.input.target[1]); }
      }
    }
  }, []);

  // 选模板
  const handleSelectTemplate = useCallback((templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setCode(tpl.code);
    const inp = tpl.input;
    if (inp.kind === 'array') {
      setDataStr(inp.data.join(', '));
      handleKindChange('array');
    } else if (inp.kind === 'string') {
      setTextStr(inp.text);
      setPatternStr(inp.pattern);
      handleKindChange('string');
    } else if (inp.kind === 'grid') {
      setGridData([...inp.data]);
      setGridCols(inp.cols);
      if (inp.start) { setGridStartR(inp.start[0]); setGridStartC(inp.start[1]); }
      if (inp.target) { setGridTargetR(inp.target[0]); setGridTargetC(inp.target[1]); }
      handleKindChange('grid');
    }
  }, [handleKindChange]);

  const handleRegenerateGrid = useCallback(() => {
    setGridData(generateGridData(gridRows, gridCols, gridWallRatio));
    setGridStartR(0);
    setGridStartC(0);
    setGridTargetR(gridRows - 1);
    setGridTargetC(gridCols - 1);
  }, [gridRows, gridCols, gridWallRatio]);

  // 自动跑模板（store 无 currentAlgo 时）
  useEffect(() => {
    if (useVizStore.getState().currentAlgo) return;
    const first = TEMPLATES.find((t) => t.id === 'bubble')!;
    setCode(first.code);
    if (first.input.kind === 'array') {
      setDataStr(first.input.data.join(', '));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTemplates = TEMPLATES.filter((t) => t.input.kind === dataKind);

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
          {/* 左：viz API 速查 + 模板 */}
          <section className="pane">
            <div className="pane-hd">{t.playground.apiRef}</div>
            <div className="api-ref">
              {/* dataKind 切换 */}
              <div className="kind-tabs">
                <button className={`kind-tab${dataKind === 'array' ? ' active' : ''}`} onClick={() => handleKindChange('array')}>{t.playground.tabArray}</button>
                <button className={`kind-tab${dataKind === 'string' ? ' active' : ''}`} onClick={() => handleKindChange('string')}>{t.playground.tabString}</button>
                <button className={`kind-tab${dataKind === 'grid' ? ' active' : ''}`} onClick={() => handleKindChange('grid')}>{t.playground.tabGrid}</button>
              </div>
              {/* API 列表按 dataKind 过滤 */}
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

            {/* 模板列表 */}
            <div className="pane-hd" style={{ marginTop: 16 }}>{t.tree.title}</div>
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="template-item"
                onClick={() => handleSelectTemplate(tpl.id)}
              >
                {tpl.label}
              </div>
            ))}
          </section>

          {/* 中：画布 */}
          <VizStage />

          {/* 右：编辑器 + 输入 */}
          <section className="pane">
            <div className="pane-hd">{t.playground.editor}</div>
            <CodeEditor value={code} onChange={setCode} />
            <TracePanel />
            <div className="editor-controls">
              {/* 输入区按 dataKind 切换 */}
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
