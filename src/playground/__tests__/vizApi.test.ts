// ============================================================
// vizApi 单元测试 — 验证 V3 录制契约（非浏览器验证）
// 确认 createViz 产出的 Step[] 格式与现有 bubbleSort 同构
// ============================================================

import { describe, it, expect } from 'vitest';
import { createViz, MAX_STEPS } from '../vizApi';
import type { Step } from '../../engine/types';

describe('createViz 录制契约', () => {
  it('冒泡排序产出正确步数 + 最终数据已排序', () => {
    const steps: Step[] = [];
    const viz = createViz([3, 1, 2], steps);
    const n = viz.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        viz.compare(j, j + 1);
        if (viz.value(j) > viz.value(j + 1)) {
          viz.swap(j, j + 1);
        }
      }
      viz.mark(n - 1 - i, 'sorted');
    }
    viz.done();

    expect(steps.length).toBeGreaterThan(0);
    // 所有快照都是 array kind
    expect(steps.every((s) => s.snapshot.kind === 'array')).toBe(true);
    // 最后一步 done，数据升序
    const last = steps[steps.length - 1];
    expect(last.type).toBe('done');
    expect(last.snapshot.data).toEqual([1, 2, 3]);
  });

  it('swap 真正交换数据并标记 swap 状态', () => {
    const steps: Step[] = [];
    const viz = createViz([5, 3], steps);
    viz.swap(0, 1);

    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe('swap');
    expect(steps[0].snapshot.data).toEqual([3, 5]);
    expect(steps[0].snapshot.states[0]).toBe('swap');
    expect(steps[0].snapshot.states[1]).toBe('swap');
  });

  it('value/length 读取不录制步骤', () => {
    const steps: Step[] = [];
    const viz = createViz([1, 2, 3], steps);

    expect(viz.value(0)).toBe(1);
    expect(viz.length).toBe(3);
    expect(steps).toHaveLength(0);
  });

  it('mark 持久状态在后续步骤保留', () => {
    const steps: Step[] = [];
    // 用 3 元素：mark(0) 后 compare(1,2) 不触碰 index 0，persist 不被 transient 覆盖
    const viz = createViz([4, 2, 5], steps);
    viz.mark(0, 'sorted');
    viz.compare(1, 2);

    // 第二步的 snapshot 应保留 index 0 的 sorted 状态
    expect(steps[1].snapshot.states[0]).toBe('sorted');
    expect(steps[1].snapshot.states[1]).toBe('compare');
    expect(steps[1].snapshot.states[2]).toBe('compare');
  });

  it('越界下标抛 RangeError', () => {
    const steps: Step[] = [];
    const viz = createViz([1], steps);

    expect(() => viz.compare(0, 1)).toThrow(RangeError);
    expect(() => viz.swap(0, 5)).toThrow(RangeError);
    expect(() => viz.value(-1)).toThrow(RangeError);
  });

  it('步数超限抛 StepLimitError', () => {
    const steps: Step[] = [];
    const viz = createViz([1, 2], steps);

    expect(() => {
      for (let i = 0; i <= MAX_STEPS; i++) viz.compare(0, 1);
    }).toThrow(/步数超过上限/);
  });

  it('done 全部标记 sorted', () => {
    const steps: Step[] = [];
    const viz = createViz([3, 1, 2], steps);
    viz.done();

    const snap = steps[0].snapshot;
    expect(snap.states[0]).toBe('sorted');
    expect(snap.states[1]).toBe('sorted');
    expect(snap.states[2]).toBe('sorted');
  });
});
