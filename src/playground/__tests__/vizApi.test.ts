import { describe, it, expect } from 'vitest';
import { createViz, MAX_STEPS } from '../vizApi';
import type { Step } from '../../engine/types';

const A = (data: number[]) => ({ kind: 'array' as const, data });

describe('createViz Array', () => {
  it('冒泡排序产出正确步数 + 最终数据已排序', () => {
    const steps: Step[] = [];
    const viz = createViz(A([3, 1, 2]), steps) as import('../vizApi').ArrayVizApi;
    const n = viz.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        viz.compare(j, j + 1);
        if (viz.value(j) > viz.value(j + 1)) viz.swap(j, j + 1);
      }
      viz.mark(n - 1 - i, 'sorted');
    }
    viz.done();

    expect(steps.length).toBeGreaterThan(0);
    expect(steps.every((s) => s.snapshot.kind === 'array')).toBe(true);
    const last = steps[steps.length - 1];
    expect(last.type).toBe('done');
    expect(last.snapshot.data).toEqual([1, 2, 3]);
  });

  it('swap 真正交换数据并标记 swap 状态', () => {
    const steps: Step[] = [];
    const viz = createViz(A([5, 3]), steps) as import('../vizApi').ArrayVizApi;
    viz.swap(0, 1);
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe('swap');
    expect(steps[0].snapshot.data).toEqual([3, 5]);
    expect(steps[0].snapshot.states[0]).toBe('swap');
    expect(steps[0].snapshot.states[1]).toBe('swap');
  });

  it('value/length 读取不录制步骤', () => {
    const steps: Step[] = [];
    const viz = createViz(A([1, 2, 3]), steps) as import('../vizApi').ArrayVizApi;
    expect(viz.value(0)).toBe(1);
    expect(viz.length).toBe(3);
    expect(steps).toHaveLength(0);
  });

  it('mark 持久状态在后续步骤保留', () => {
    const steps: Step[] = [];
    const viz = createViz(A([4, 2, 5]), steps) as import('../vizApi').ArrayVizApi;
    viz.mark(0, 'sorted');
    viz.compare(1, 2);
    expect(steps[1].snapshot.states[0]).toBe('sorted');
    expect(steps[1].snapshot.states[1]).toBe('compare');
    expect(steps[1].snapshot.states[2]).toBe('compare');
  });

  it('越界下标抛 RangeError', () => {
    const steps: Step[] = [];
    const viz = createViz(A([1]), steps) as import('../vizApi').ArrayVizApi;
    expect(() => viz.compare(0, 1)).toThrow(RangeError);
    expect(() => viz.swap(0, 5)).toThrow(RangeError);
    expect(() => viz.value(-1)).toThrow(RangeError);
  });

  it('步数超限抛 StepLimitError', () => {
    const steps: Step[] = [];
    const viz = createViz(A([1, 2]), steps) as import('../vizApi').ArrayVizApi;
    expect(() => { for (let i = 0; i <= MAX_STEPS; i++) viz.compare(0, 1); }).toThrow(/步数超过上限/);
  });

  it('done 全部标记 sorted', () => {
    const steps: Step[] = [];
    const viz = createViz(A([3, 1, 2]), steps) as import('../vizApi').ArrayVizApi;
    viz.done();
    const snap = steps[0].snapshot;
    expect(snap.states[0]).toBe('sorted');
    expect(snap.states[1]).toBe('sorted');
    expect(snap.states[2]).toBe('sorted');
  });

  it('__line 参数写入 Step.line', () => {
    const steps: Step[] = [];
    const viz = createViz(A([5, 3]), steps) as import('../vizApi').ArrayVizApi;
    viz.compare(0, 1, 5);
    expect(steps[0].line).toBe(5);
  });

  it('省略 __line 时 line 为 undefined', () => {
    const steps: Step[] = [];
    const viz = createViz(A([5, 3]), steps) as import('../vizApi').ArrayVizApi;
    viz.compare(0, 1);
    expect(steps[0].line).toBeUndefined();
  });

  it('onStep 流式回调每步触发一次', () => {
    const steps: Step[] = [];
    const called: number[] = [];
    const viz = createViz(A([5, 3]), steps, (s) => { called.push(s.type === 'compare' ? 1 : 0); }) as import('../vizApi').ArrayVizApi;
    viz.compare(0, 1);
    viz.done();
    expect(called).toHaveLength(2);
  });
});

// ===== V3.3: String =====

const S = (text: string, pattern: string) => ({ kind: 'string' as const, text, pattern });

describe('createViz String', () => {
  it('setText/setPattern 初始化字符串', () => {
    const steps: Step[] = [];
    const viz = createViz(S('ABC', 'BC'), steps) as import('../vizApi').StringVizApi;
    expect(viz.textLength).toBe(3);
    expect(viz.patternLength).toBe(2);
  });

  it('textCharAt / patternCharAt 读取字符', () => {
    const steps: Step[] = [];
    const viz = createViz(S('ABCD', 'BC'), steps) as import('../vizApi').StringVizApi;
    expect(viz.textCharAt(0)).toBe('A');
    expect(viz.textCharAt(2)).toBe('C');
    expect(viz.patternCharAt(0)).toBe('B');
    expect(viz.patternCharAt(1)).toBe('C');
  });

  it('markText / markPattern 写入 textStates / patternStates', () => {
    const steps: Step[] = [];
    const viz = createViz(S('ABCD', 'BC'), steps) as import('../vizApi').StringVizApi;
    viz.markText(1, 'compare');
    viz.markPattern(0, 'match');
    expect(steps[0].snapshot.kind).toBe('string');
    expect(steps[0].snapshot.textStates?.[1]).toBe('compare');
    expect(steps[1].snapshot.patternStates?.[0]).toBe('match');
  });

  it('markText 持久状态在后续步骤保留', () => {
    const steps: Step[] = [];
    const viz = createViz(S('ABCD', 'BC'), steps) as import('../vizApi').StringVizApi;
    viz.markText(0, 'match');
    viz.markText(1, 'compare');
    // 第二步应保留第一步的 match
    expect(steps[1].snapshot.textStates?.[0]).toBe('match');
    expect(steps[1].snapshot.textStates?.[1]).toBe('compare');
  });

  it('setText / setPattern 运行时更新', () => {
    const steps: Step[] = [];
    const viz = createViz(S('ABC', 'BC'), steps) as import('../vizApi').StringVizApi;
    viz.setText('XYZ');
    viz.setPattern('YZ');
    expect(viz.textLength).toBe(3);
    expect(viz.patternLength).toBe(2);
    expect(viz.textCharAt(0)).toBe('X');
    expect(viz.patternCharAt(0)).toBe('Y');
  });

  it('跨步 snapshot 保留 text / pattern', () => {
    const steps: Step[] = [];
    const viz = createViz(S('HELLO', 'LO'), steps) as import('../vizApi').StringVizApi;
    viz.markText(3, 'compare');
    viz.markPattern(1, 'match');
    expect(steps[0].snapshot.text).toBe('HELLO');
    expect(steps[0].snapshot.pattern).toBe('LO');
    expect(steps[1].snapshot.text).toBe('HELLO');
    expect(steps[1].snapshot.pattern).toBe('LO');
  });

  it('越界抛 RangeError', () => {
    const steps: Step[] = [];
    const viz = createViz(S('AB', 'C'), steps) as import('../vizApi').StringVizApi;
    expect(() => viz.markText(5, 'compare')).toThrow(RangeError);
    expect(() => viz.textCharAt(-1)).toThrow(RangeError);
    expect(() => viz.markPattern(3, 'match')).toThrow(RangeError);
  });
});

// ===== V3.3: Grid =====

const G = (data: number[], cols: number, start?: [number, number], target?: [number, number]) =>
  ({ kind: 'grid' as const, data, cols, start, target });

describe('createViz Grid', () => {
  const grid = [0, 0, 0, 0,  0, -1, 0, 0,  0, 0, 0, 0];

  it('index / row / col 坐标转换', () => {
    const steps: Step[] = [];
    const viz = createViz(G(grid, 4), steps) as import('../vizApi').GridVizApi;
    expect(viz.index(1, 2)).toBe(6);
    expect(viz.row(6)).toBe(1);
    expect(viz.col(6)).toBe(2);
    expect(viz.index(0, 0)).toBe(0);
    expect(viz.row(0)).toBe(0);
    expect(viz.col(0)).toBe(0);
  });

  it('inBounds 边界检查', () => {
    const steps: Step[] = [];
    const viz = createViz(G(grid, 4), steps) as import('../vizApi').GridVizApi;
    expect(viz.inBounds(0, 0)).toBe(true);
    expect(viz.inBounds(2, 3)).toBe(true);
    expect(viz.inBounds(-1, 0)).toBe(false);
    expect(viz.inBounds(3, 0)).toBe(false);
    expect(viz.inBounds(0, 4)).toBe(false);
  });

  it('cellValue 读取单元格值', () => {
    const steps: Step[] = [];
    const viz = createViz(G(grid, 4), steps) as import('../vizApi').GridVizApi;
    expect(viz.cellValue(1, 1)).toBe(-1);
    expect(viz.cellValue(0, 0)).toBe(0);
  });

  it('visitCell / markCell 标记状态', () => {
    const steps: Step[] = [];
    const viz = createViz(G(grid, 4), steps) as import('../vizApi').GridVizApi;
    viz.visitCell(1, 2);
    expect(steps[0].snapshot.kind).toBe('grid');
    expect(steps[0].snapshot.states[6]).toBe('visit');
  });

  it('markCell 标记状态', () => {
    const steps: Step[] = [];
    const viz = createViz(G(grid, 4), steps) as import('../vizApi').GridVizApi;
    viz.markCell(2, 0, 'path');
    expect(steps[0].snapshot.states[8]).toBe('path');
  });

  it('setCell 修改数据', () => {
    const steps: Step[] = [];
    const viz = createViz(G(grid, 4), steps) as import('../vizApi').GridVizApi;
    viz.setCell(0, 1, 5);
    expect(steps[0].snapshot.data).toBeDefined();
    expect(steps[0].snapshot.data![1]).toBe(5);
  });

  it('setStart / setTarget 设置坐标', () => {
    const steps: Step[] = [];
    const viz = createViz(G(grid, 4), steps) as import('../vizApi').GridVizApi;
    viz.setStart(0, 0);
    viz.setTarget(2, 3);
    expect(steps[1].snapshot.start).toEqual([0, 0]);
    expect(steps[1].snapshot.target).toEqual([2, 3]);
  });

  it('setCols 设置列数', () => {
    const steps: Step[] = [];
    const viz = createViz(G(grid, 4), steps) as import('../vizApi').GridVizApi;
    viz.setCols(2);
    expect(viz.cols).toBe(2);
    expect(viz.index(1, 1)).toBe(3);
  });

  it('rows / cols getter', () => {
    const steps: Step[] = [];
    const viz = createViz(G([1, 2, 3, 4, 5, 6], 3), steps) as import('../vizApi').GridVizApi;
    expect(viz.rows).toBe(2);
    expect(viz.cols).toBe(3);
  });

  it('done 在 grid 模式下不崩溃', () => {
    const steps: Step[] = [];
    const viz = createViz(G(grid, 4), steps) as import('../vizApi').GridVizApi;
    viz.done();
    expect(steps[0].type).toBe('done');
  });
});
