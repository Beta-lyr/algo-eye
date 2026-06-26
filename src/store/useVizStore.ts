// ============================================================
// useVizStore — 全局可视化状态（Zustand）
// 管理：当前算法 / 数据 / 步骤 / 播放状态 / 统计
// 支持对比模式
// ============================================================

import { create } from 'zustand';
import type { Algorithm } from '../algorithms/types';
import type { Step } from '../engine/types';
import { algorithms, getAlgorithmById } from '../algorithms';

export interface VizState {
  // ===== 算法 =====
  /** 算法注册表（所有可用算法） */
  algorithms: Algorithm[];
  /** 当前选中的算法 */
  currentAlgo: Algorithm | null;

  // ===== 数据与步骤 =====
  /** 当前数据数组 */
  data: number[];
  /** 步骤序列（由算法生成器生成） */
  steps: Step[];
  /** 当前步骤下标 */
  stepIndex: number;

  // ===== 播放状态 =====
  /** 是否正在播放 */
  playing: boolean;
  /** 播放速度（1–10） */
  speed: number;

  // ===== 统计（从 steps 累计） =====
  compareCount: number;
  swapCount: number;

  // ===== 对比模式 =====
  /** 是否启用对比模式 */
  compareMode: boolean;
  /** 对比算法 */
  compareAlgo: Algorithm | null;
  /** 对比步骤 */
  compareSteps: Step[];
  /** 对比步骤下标 */
  compareStepIndex: number;
  /** 对比统计 */
  compareCompareCount: number;
  compareSwapCount: number;

  // ===== 操作 =====
  /** 选择算法 */
  selectAlgorithm: (id: string) => void;
  /** 设置数据并重新生成步骤 */
  setData: (data: number[]) => void;
  /** 设置当前步骤下标 */
  setStepIndex: (index: number) => void;
  /** 设置播放状态 */
  setPlaying: (playing: boolean) => void;
  /** 设置速度 */
  setSpeed: (speed: number) => void;
  /** 随机生成数据 */
  randomizeData: (count: number) => void;
  /** 重置到初始状态 */
  reset: () => void;
  /** 切换对比模式 */
  toggleCompareMode: () => void;
  /** 设置对比算法 */
  setCompareAlgo: (id: string) => void;
  /** 同步推进对比步骤 */
  syncCompareStep: () => void;
}

/** 生成随机整数数组 */
function randomArray(count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(Math.floor(Math.random() * 99) + 1);
  }
  return arr;
}

export const useVizStore = create<VizState>((set, get) => ({
  // ===== 初始值 =====
  algorithms,
  currentAlgo: algorithms[0] ?? null,
  data: algorithms[0]?.defaultData ?? randomArray(16),
  steps: [],
  stepIndex: 0,
  playing: false,
  speed: 4,
  compareCount: 0,
  swapCount: 0,

  // ===== 对比模式初始值 =====
  compareMode: false,
  compareAlgo: null,
  compareSteps: [],
  compareStepIndex: 0,
  compareCompareCount: 0,
  compareSwapCount: 0,

  // ===== 操作实现 =====
  selectAlgorithm: (id: string) => {
    const algo = getAlgorithmById(id);
    if (!algo) return;
    const state = get();
    const data = algo.defaultData ?? state.data;
    const steps = Array.from(algo.generate(data));

    const updates: Partial<VizState> = {
      currentAlgo: algo,
      data,
      steps,
      stepIndex: 0,
      playing: false,
      compareCount: 0,
      swapCount: 0,
    };

    // 如果是对比模式，也更新对比算法
    if (state.compareMode && state.compareAlgo) {
      const compareSteps = Array.from(state.compareAlgo.generate(data));
      updates.compareSteps = compareSteps;
      updates.compareStepIndex = 0;
      updates.compareCompareCount = 0;
      updates.compareSwapCount = 0;
    }

    set(updates as VizState);
  },

  setData: (data: number[]) => {
    const { currentAlgo, compareMode, compareAlgo } = get();
    if (!currentAlgo) return;
    const steps = Array.from(currentAlgo.generate(data));

    const updates: Partial<VizState> = {
      data,
      steps,
      stepIndex: 0,
      playing: false,
      compareCount: 0,
      swapCount: 0,
    };

    if (compareMode && compareAlgo) {
      const compareSteps = Array.from(compareAlgo.generate(data));
      updates.compareSteps = compareSteps;
      updates.compareStepIndex = 0;
      updates.compareCompareCount = 0;
      updates.compareSwapCount = 0;
    }

    set(updates as VizState);
  },

  setStepIndex: (index: number) => {
    const { steps } = get();
    if (index < 0 || index >= steps.length) return;

    let compareCount = 0;
    let swapCount = 0;
    for (let i = 0; i <= index; i++) {
      if (steps[i].type === 'compare') compareCount++;
      if (steps[i].type === 'swap') swapCount++;
    }
    set({ stepIndex: index, compareCount, swapCount });
  },

  setPlaying: (playing: boolean) => set({ playing }),

  setSpeed: (speed: number) => set({ speed: Math.max(1, Math.min(10, speed)) }),

  randomizeData: (count: number) => {
    const n = Math.max(4, Math.min(64, count));
    const { currentAlgo, compareMode, compareAlgo } = get();
    if (!currentAlgo) return;
    const data = randomArray(n);
    const steps = Array.from(currentAlgo.generate(data));

    const updates: Partial<VizState> = {
      data,
      steps,
      stepIndex: 0,
      playing: false,
      compareCount: 0,
      swapCount: 0,
    };

    if (compareMode && compareAlgo) {
      const compareSteps = Array.from(compareAlgo.generate(data));
      updates.compareSteps = compareSteps;
      updates.compareStepIndex = 0;
      updates.compareCompareCount = 0;
      updates.compareSwapCount = 0;
    }

    set(updates as VizState);
  },

  reset: () => {
    const { currentAlgo, data, compareMode, compareAlgo } = get();
    if (!currentAlgo) return;
    const steps = Array.from(currentAlgo.generate(data));

    const updates: Partial<VizState> = {
      steps,
      stepIndex: 0,
      playing: false,
      compareCount: 0,
      swapCount: 0,
    };

    if (compareMode && compareAlgo) {
      const compareSteps = Array.from(compareAlgo.generate(data));
      updates.compareSteps = compareSteps;
      updates.compareStepIndex = 0;
      updates.compareCompareCount = 0;
      updates.compareSwapCount = 0;
    }

    set(updates as VizState);
  },

  toggleCompareMode: () => {
    const { compareMode, compareAlgo, data } = get();
    if (!compareMode) {
      // 开启对比模式，默认选择第一个不同类的算法
      if (!compareAlgo) {
        const firstAlgo = algorithms.find((a) => a.id !== get().currentAlgo?.id);
        if (firstAlgo) {
          const compareSteps = Array.from(firstAlgo.generate(data));
          set({
            compareMode: true,
            compareAlgo: firstAlgo,
            compareSteps,
            compareStepIndex: 0,
            compareCompareCount: 0,
            compareSwapCount: 0,
          });
          return;
        }
      } else {
        const compareSteps = Array.from(compareAlgo.generate(data));
        set({
          compareMode: true,
          compareSteps,
          compareStepIndex: 0,
          compareCompareCount: 0,
          compareSwapCount: 0,
        });
        return;
      }
    }
    set({ compareMode: !compareMode });
  },

  setCompareAlgo: (id: string) => {
    const algo = getAlgorithmById(id);
    if (!algo) return;
    const { data } = get();
    const compareSteps = Array.from(algo.generate(data));
    set({
      compareAlgo: algo,
      compareSteps,
      compareStepIndex: 0,
      compareCompareCount: 0,
      compareSwapCount: 0,
    });
  },

  syncCompareStep: () => {
    const { compareSteps, compareStepIndex } = get();
    if (compareStepIndex >= compareSteps.length - 1) return;

    const newIndex = compareStepIndex + 1;
    let compareCompareCount = 0;
    let compareSwapCount = 0;
    for (let i = 0; i <= newIndex; i++) {
      if (compareSteps[i].type === 'compare') compareCompareCount++;
      if (compareSteps[i].type === 'swap') compareSwapCount++;
    }
    set({
      compareStepIndex: newIndex,
      compareCompareCount,
      compareSwapCount,
    });
  },
}));
