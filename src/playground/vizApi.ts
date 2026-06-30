import type { Step, Snapshot, ElementState, StepType } from '../engine/types';
import type { PlaygroundInput } from './protocol';

export const MAX_STEPS = 10000;

export class StepLimitError extends Error {
  constructor() {
    super(`步数超过上限 ${MAX_STEPS}，请缩小数据规模或优化算法`);
    this.name = 'StepLimitError';
  }
}

// ===== VizApi discriminated union =====

export interface BaseVizApi {
  log(message: string, __line?: number): void;
  done(__line?: number): void;
}

export interface ArrayVizApi extends BaseVizApi {
  kind: 'array';
  compare(i: number, j: number, __line?: number): void;
  swap(i: number, j: number, __line?: number): void;
  set(i: number, value: number, __line?: number): void;
  mark(i: number, state: ElementState, __line?: number): void;
  pointer(i: number, label: string, __line?: number): void;
  visit(i: number, __line?: number): void;
  value(i: number): number;
  readonly length: number;
}

export interface StringVizApi extends BaseVizApi {
  kind: 'string';
  setText(text: string, __line?: number): void;
  setPattern(pattern: string, __line?: number): void;
  markText(i: number, state: ElementState, __line?: number): void;
  markPattern(i: number, state: ElementState, __line?: number): void;
  textCharAt(i: number): string;
  patternCharAt(i: number): string;
  readonly textLength: number;
  readonly patternLength: number;
}

export interface GridVizApi extends BaseVizApi {
  kind: 'grid';
  index(row: number, col: number): number;
  row(index: number): number;
  col(index: number): number;
  inBounds(row: number, col: number): boolean;
  cellValue(row: number, col: number): number;
  markCell(row: number, col: number, state: ElementState, __line?: number): void;
  visitCell(row: number, col: number, __line?: number): void;
  setCell(row: number, col: number, value: number, __line?: number): void;
  setCols(cols: number, __line?: number): void;
  setStart(row: number, col: number, __line?: number): void;
  setTarget(row: number, col: number, __line?: number): void;
  readonly rows: number;
  readonly cols: number;
}

export type VizApi = ArrayVizApi | StringVizApi | GridVizApi;

// ===== Factory =====

export function createViz(
  input: PlaygroundInput,
  steps: Step[],
  onStep?: (step: Step) => void,
): VizApi {
  switch (input.kind) {
    case 'array': return createArrayViz(input.data, steps, onStep);
    case 'string': return createStringViz(input.text, input.pattern, steps, onStep);
    case 'grid': return createGridViz(input.data, input.cols, input.start, input.target, steps, onStep);
  }
}

// ===== Array =====

function createArrayViz(data: number[], steps: Step[], onStep?: (step: Step) => void): ArrayVizApi {
  const arr = [...data];
  const persist: Record<number, ElementState> = {};

  const snap = (states: Record<number, ElementState>, pointers?: Record<number, string>): Snapshot => ({
    kind: 'array',
    data: [...arr],
    states: { ...persist, ...states },
    ...(pointers ? { pointers: { ...pointers } } : {}),
  });

  const rec = (
    type: StepType, indices: number[], message: string,
    states: Record<number, ElementState>, line?: number, pointers?: Record<number, string>,
  ) => {
    if (steps.length >= MAX_STEPS) throw new StepLimitError();
    const step: Step = { type, indices, line, message, snapshot: snap(states, pointers) };
    steps.push(step);
    onStep?.(step);
  };

  const guard = (i: number, fn: string): void => {
    if (i < 0 || i >= arr.length) throw new RangeError(`viz.${fn}(${i}) 下标越界，有效范围 [0, ${arr.length})`);
  };

  return {
    kind: 'array',
    compare(i, j, __line) { guard(i, 'compare'); guard(j, 'compare'); rec('compare', [i, j], `比较 [${i}]=${arr[i]} 与 [${j}]=${arr[j]}`, { [i]: 'compare', [j]: 'compare' }, __line, { [i]: 'i', [j]: 'j' }); },
    swap(i, j, __line) { guard(i, 'swap'); guard(j, 'swap'); [arr[i], arr[j]] = [arr[j], arr[i]]; rec('swap', [i, j], `交换 [${i}] ↔ [${j}]`, { [i]: 'swap', [j]: 'swap' }, __line); },
    set(i, v, __line) { guard(i, 'set'); arr[i] = v; rec('set', [i], `设置 [${i}] = ${v}`, { [i]: 'current' }, __line); },
    mark(i, s, __line) { guard(i, 'mark'); persist[i] = s; rec('mark', [i], `标记 [${i}] → ${s}`, { [i]: s }, __line); },
    pointer(i, l, __line) { guard(i, 'pointer'); rec('pointer', [i], `指针 [${i}] = ${l}`, {}, __line, { [i]: l }); },
    visit(i, __line) { guard(i, 'visit'); persist[i] = 'visit'; rec('visit', [i], `访问 [${i}]`, { [i]: 'visit' }, __line); },
    log(m, __line) { rec('mark', [], m, {}, __line); },
    done(__line) { for (let k = 0; k < arr.length; k++) persist[k] = 'sorted'; rec('done', [], '完成', {}, __line); },
    value(i) { guard(i, 'value'); return arr[i]; },
    get length() { return arr.length; },
  };
}

// ===== String =====

function createStringViz(text: string, pattern: string, steps: Step[], onStep?: (step: Step) => void): StringVizApi {
  let txt = text;
  let pat = pattern;
  const textPersist: Record<number, ElementState> = {};
  const patternPersist: Record<number, ElementState> = {};

  const snap = (ts: Record<number, ElementState>, ps: Record<number, ElementState>): Snapshot => ({
    kind: 'string',
    data: [],
    states: {},
    text: txt,
    pattern: pat,
    textStates: { ...textPersist, ...ts },
    patternStates: { ...patternPersist, ...ps },
  });

  const rec = (
    type: StepType, indices: number[], message: string,
    ts: Record<number, ElementState>, ps: Record<number, ElementState>, line?: number,
  ) => {
    if (steps.length >= MAX_STEPS) throw new StepLimitError();
    const step: Step = { type, indices, line, message, snapshot: snap(ts, ps) };
    steps.push(step);
    onStep?.(step);
  };

  const guardStr = (i: number, which: string, len: number): void => {
    if (i < 0 || i >= len) throw new RangeError(`viz.${which}(${i}) 下标越界，有效范围 [0, ${len})`);
  };

  return {
    kind: 'string',
    setText(s, __line) { txt = s; rec('set', [], `设置文本长度 ${s.length}`, {}, {}, __line); },
    setPattern(s, __line) { pat = s; rec('set', [], `设置模式串长度 ${s.length}`, {}, {}, __line); },
    markText(i, state, __line) { guardStr(i, 'markText', txt.length); textPersist[i] = state; rec('mark', [i], `文本[${i}] → ${state}`, { [i]: state }, {}, __line); },
    markPattern(i, state, __line) { guardStr(i, 'markPattern', pat.length); patternPersist[i] = state; rec('mark', [i], `模式[${i}] → ${state}`, {}, { [i]: state }, __line); },
    textCharAt(i) { guardStr(i, 'textCharAt', txt.length); return txt[i]; },
    patternCharAt(i) { guardStr(i, 'patternCharAt', pat.length); return pat[i]; },
    log(m, __line) { rec('mark', [], m, {}, {}, __line); },
    done(__line) {
      for (let k = 0; k < txt.length; k++) textPersist[k] = 'default';
      for (let k = 0; k < pat.length; k++) patternPersist[k] = 'default';
      rec('done', [], '完成', {}, {}, __line);
    },
    get textLength() { return txt.length; },
    get patternLength() { return pat.length; },
  };
}

// ===== Grid =====

function createGridViz(
  data: number[], cols: number, start: [number, number] | undefined, target: [number, number] | undefined,
  steps: Step[], onStep?: (step: Step) => void,
): GridVizApi {
  const arr = [...data];
  const persist: Record<number, ElementState> = {};
  let gridCols = cols;
  let gridStart: [number, number] | undefined = start;
  let gridTarget: [number, number] | undefined = target;

  const flat = (r: number, c: number): number => r * gridCols + c;
  const snap = (states: Record<number, ElementState>, pointers?: Record<number, string>): Snapshot => ({
    kind: 'grid',
    data: [...arr],
    states: { ...persist, ...states },
    cols: gridCols,
    ...(gridStart ? { start: gridStart } : {}),
    ...(gridTarget ? { target: gridTarget } : {}),
    ...(pointers ? { pointers } : {}),
  });

  const rec = (
    type: StepType, indices: number[], message: string,
    states: Record<number, ElementState>, line?: number, pointers?: Record<number, string>,
  ) => {
    if (steps.length >= MAX_STEPS) throw new StepLimitError();
    const step: Step = { type, indices, line, message, snapshot: snap(states, pointers) };
    steps.push(step);
    onStep?.(step);
  };

  const guardIdx = (i: number, fn: string): void => {
    if (i < 0 || i >= arr.length) throw new RangeError(`viz.${fn}(${i}) 下标越界，有效范围 [0, ${arr.length})`);
  };
  const guardRC = (r: number, c: number, fn: string): void => {
    const rs = totalRows();
    if (r < 0 || r >= rs || c < 0 || c >= gridCols) {
      throw new RangeError(`viz.${fn}(${r},${c}) 越界 (0≤row<${rs}, 0≤col<${gridCols})`);
    }
  };

  const totalRows = (): number => Math.ceil(arr.length / gridCols);

  return {
    kind: 'grid',
    index(r, c) { guardRC(r, c, 'index'); return flat(r, c); },
    row(i) { guardIdx(i, 'row'); return Math.floor(i / gridCols); },
    col(i) { guardIdx(i, 'col'); return i % gridCols; },
    inBounds(r, c) { return r >= 0 && r < totalRows() && c >= 0 && c < gridCols; },
    cellValue(r, c) { guardRC(r, c, 'cellValue'); return arr[flat(r, c)]; },
    markCell(r, c, state, __line) { guardRC(r, c, 'markCell'); const idx = flat(r, c); persist[idx] = state; rec('mark', [idx], `单元 (${r},${c}) → ${state}`, { [idx]: state }, __line); },
    visitCell(r, c, __line) { guardRC(r, c, 'visitCell'); const idx = flat(r, c); persist[idx] = 'visit'; rec('visit', [idx], `访问 (${r},${c})`, { [idx]: 'visit' }, __line); },
    setCell(r, c, v, __line) { guardRC(r, c, 'setCell'); const idx = flat(r, c); arr[idx] = v; rec('set', [idx], `设置 (${r},${c}) = ${v}`, { [idx]: 'current' }, __line); },
    setCols(c, __line) { gridCols = c; rec('mark', [], `设置列数 = ${c}`, {}, __line); },
    setStart(r, c, __line) { guardRC(r, c, 'setStart'); gridStart = [r, c]; rec('mark', [], `起点 (${r},${c})`, {}, __line); },
    setTarget(r, c, __line) { guardRC(r, c, 'setTarget'); gridTarget = [r, c]; rec('mark', [], `终点 (${r},${c})`, {}, __line); },
    log(m, __line) { rec('mark', [], m, {}, __line); },
    done(__line) {
      for (let k = 0; k < arr.length; k++) if (!persist[k]) persist[k] = 'default';
      rec('done', [], '完成', {}, __line);
    },
    get rows() { return Math.ceil(arr.length / gridCols); },
    get cols() { return gridCols; },
  };
}
