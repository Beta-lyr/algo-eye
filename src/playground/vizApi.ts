// ============================================================
// VizApi — V3 录制契约
// 用户代码通过 viz 对象操作数据，每次调用录制一个 Step
// 与现有 bubbleSort 的 snap()/yield 模型完全同构：
//   persist 累积持久状态，snap 时 {...persist, ...states} 合并
// 产出的 Step[] 可直接喂给 StepPlayer.reset() / store.steps
// ============================================================

import type { Step, Snapshot, ElementState, StepType } from '../engine/types';

/** 步数上限，防止 O(n²) 大数据爆内存（呼应 V1 §3.2 快照内存风险） */
export const MAX_STEPS = 10000;

/** 超出步数上限时抛出，由 worker 捕获上报 */
export class StepLimitError extends Error {
  constructor() {
    super(`步数超过上限 ${MAX_STEPS}，请缩小数据规模或优化算法`);
    this.name = 'StepLimitError';
  }
}

/**
 * V3 用户代码的唯一外部依赖。
 * viz 拥有数据，用户不直接持有数组——swap/set 既改数据又录快照，
 * 保证"数据状态"与"录制点"原子一致，杜绝"改了数据忘记录制"。
 */
export interface VizApi {
  /** 比较 i,j（标记 compare） */
  compare(i: number, j: number, __line?: number): void;
  /** 交换 i,j（交换并标记 swap） */
  swap(i: number, j: number, __line?: number): void;
  /** 赋值 [i]=v（标记 current） */
  set(i: number, value: number, __line?: number): void;
  /** 标记持久状态（如 'sorted'，后续步骤保留） */
  mark(i: number, state: ElementState, __line?: number): void;
  /** 打指针标签（如 'pivot'） */
  pointer(i: number, label: string, __line?: number): void;
  /** 访问 i（标记 visit，搜索/图场景） */
  visit(i: number, __line?: number): void;
  /** 自由文本步骤（不改数据，不计入 compare/swap 统计） */
  log(message: string, __line?: number): void;
  /** 完成，全部标记 sorted */
  done(__line?: number): void;
  /** 读取 [i]（不录制） */
  value(i: number): number;
  /** 数据长度（不录制） */
  readonly length: number;
}

/**
 * 创建一个 viz 录制实例。
 * @param data 初始数据（会被复制，不污染入参）
 * @param steps 录制目标数组（由调用方持有，worker 产出后 postMessage 回主线程）
 * @param onStep V3.2 流式回调，每录制一步调用一次
 */
export function createViz(data: number[], steps: Step[], onStep?: (step: Step) => void): VizApi {
  const arr = [...data];
  /** 持久状态（如 sorted），与 bubbleSort 的 sortedIndices 同理 */
  const persist: Record<number, ElementState> = {};

  /** 打包快照——贴合现有 bubbleSort 的 snap() 逻辑 */
  const snap = (
    states: Record<number, ElementState>,
    pointers?: Record<number, string>,
  ): Snapshot => ({
    kind: 'array',
    data: [...arr],
    states: { ...persist, ...states },
    ...(pointers ? { pointers: { ...pointers } } : {}),
  });

  /** 录制一个 Step（带步数上限保护） */
  const rec = (
    type: StepType,
    indices: number[],
    message: string,
    states: Record<number, ElementState>,
    line?: number,
    pointers?: Record<number, string>,
  ) => {
    if (steps.length >= MAX_STEPS) throw new StepLimitError();
    const step: Step = { type, indices, line, message, snapshot: snap(states, pointers) };
    steps.push(step);
    onStep?.(step);
  };

  /** 下标越界校验，给用户友好报错而非静默 NaN */
  const guard = (i: number, fn: string): void => {
    if (i < 0 || i >= arr.length) {
      throw new RangeError(`viz.${fn}(${i}) 下标越界，有效范围 [0, ${arr.length})`);
    }
  };

  return {
    compare(i, j, __line) {
      guard(i, 'compare');
      guard(j, 'compare');
      rec('compare', [i, j], `比较 [${i}]=${arr[i]} 与 [${j}]=${arr[j]}`,
        { [i]: 'compare', [j]: 'compare' }, __line, { [i]: 'i', [j]: 'j' });
    },
    swap(i, j, __line) {
      guard(i, 'swap');
      guard(j, 'swap');
      [arr[i], arr[j]] = [arr[j], arr[i]];
      rec('swap', [i, j], `交换 [${i}] ↔ [${j}]`, { [i]: 'swap', [j]: 'swap' }, __line);
    },
    set(i, v, __line) {
      guard(i, 'set');
      arr[i] = v;
      rec('set', [i], `设置 [${i}] = ${v}`, { [i]: 'current' }, __line);
    },
    mark(i, s, __line) {
      guard(i, 'mark');
      persist[i] = s;
      rec('mark', [i], `标记 [${i}] → ${s}`, { [i]: s }, __line);
    },
    pointer(i, l, __line) {
      guard(i, 'pointer');
      rec('pointer', [i], `指针 [${i}] = ${l}`, {}, __line, { [i]: l });
    },
    visit(i, __line) {
      guard(i, 'visit');
      persist[i] = 'visit';
      rec('visit', [i], `访问 [${i}]`, { [i]: 'visit' }, __line);
    },
    log(m, __line) {
      rec('mark', [], m, {}, __line);
    },
    done(__line) {
      for (let k = 0; k < arr.length; k++) persist[k] = 'sorted';
      rec('done', [], '完成', {}, __line);
    },
    value(i) {
      guard(i, 'value');
      return arr[i];
    },
    get length() {
      return arr.length;
    },
  };
}
