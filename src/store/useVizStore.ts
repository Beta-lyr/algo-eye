// ============================================================
// useVizStore — 全局可视化状态（Zustand）
// 管理：当前算法 / 数据 / 步骤 / 播放状态 / 统计
// 支持对比模式
// ============================================================

import { create } from 'zustand';
import type { Algorithm } from '../algorithms/types';
import type { Step } from '../engine/types';
import { algorithms, getAlgorithmById } from '../algorithms';
import { dispatchAchievement } from '../lib/achievementEvents';

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

  // ===== 焦点模式 =====
  /** 是否隐藏侧栏和代码面板 */
  focusMode: boolean;

  // ===== 错误状态 =====
  /** 算法执行错误信息 */
  error: string | null;

  // ===== 手动模式 =====
  /** 是否启用手动操作模式 */
  manualMode: boolean;
  /** 用户已选中的下标 */
  selectedIndices: number[];
  /** 提示消息 */
  hintMessage: string;

  // ===== 书签 =====
  /** stepIndex → 注释文本 */
  bookmarks: Record<number, string>;
  /** 切换书签（有则删，无则加） */
  toggleBookmark: (stepIndex: number) => void;
  /** 更新书签注释 */
  updateBookmarkComment: (stepIndex: number, comment: string) => void;
  /** 导出书签为 JSON */
  exportBookmarks: () => string;

  // ===== 挑战模式 =====
  /** 是否激活挑战模式 */
  challengeActive: boolean;
  /** 挑战中用户的数据副本 */
  challengeData: number[];
  /** 挑战中用户的交换次数 */
  challengeSwaps: number;
  /** 挑战开始时间戳 */
  challengeStartTime: number;
  /** 挑战结果 */
  challengeResult: { userSwaps: number; userTimeMs: number; algoSwaps: number; algoCompares: number } | null;

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
  /** 切换手动模式 */
  toggleManualMode: () => void;
  /** 点击选中/取消某个下标 */
  selectIndex: (index: number) => void;
  /** 清空选中 */
  clearSelection: () => void;
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
  /** 切换焦点模式 */
  toggleFocusMode: () => void;
  /** 清除错误 */
  clearError: () => void;
  /** 开始挑战 */
  startChallenge: () => void;
  /** 挑战中交换两个元素 */
  challengeSwap: (i: number, j: number) => void;
  /** 退出挑战 */
  endChallenge: () => void;

  /** 切换对比模式 */
  toggleCompareMode: () => void;
  /** 设置对比算法 */
  setCompareAlgo: (id: string) => void;
  /** 同步推进对比步骤 */
  syncCompareStep: () => void;
  /** 生成分享 URL */
  getShareUrl: () => string;
  /** 从 URL 参数加载状态 */
  loadFromUrl: () => boolean;
}

/** 生成随机整数数组 */
function randomArray(count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(Math.floor(Math.random() * 99) + 1);
  }
  return arr;
}

export const useVizStore = create<VizState>((set, get) => {
  /** 安全执行算法生成器，失败时设置 error */
  function safeGenerate(algo: Algorithm, data: number[]): Step[] {
    try {
      const steps = Array.from(algo.generate(data));
      if (get().error) set({ error: null });
      return steps;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: `算法「${algo.name}」执行失败: ${msg}`, steps: [], stepIndex: 0, playing: false });
      return [];
    }
  }

  return ({
  // ===== 初始值 =====
  algorithms,
  currentAlgo: null,
  data: randomArray(16),
  steps: [],
  stepIndex: 0,
  playing: false,
  speed: 4,
  compareCount: 0,
  swapCount: 0,

  // ===== 挑战模式初始值 =====
  challengeActive: false,
  challengeData: [],
  challengeSwaps: 0,
  challengeStartTime: 0,
  challengeResult: null,

  // ===== 焦点模式初始值 =====
  focusMode: false,

  // ===== 错误状态初始值 =====
  error: null,

  // ===== 手动模式初始值 =====
  manualMode: false,
  selectedIndices: [],
  hintMessage: '',

  // ===== 书签初始值 =====
  bookmarks: {},

  // ===== 对比模式初始值 =====
  compareMode: false,
  compareAlgo: null,
  compareSteps: [],
  compareStepIndex: 0,
  compareCompareCount: 0,
  compareSwapCount: 0,

  // ===== 操作实现 =====
  toggleBookmark: (stepIndex: number) => {
    const { bookmarks } = get();
    if (bookmarks[stepIndex] !== undefined) {
      const next = { ...bookmarks };
      delete next[stepIndex];
      set({ bookmarks: next });
    } else {
      set({ bookmarks: { ...bookmarks, [stepIndex]: '' } });
    }
  },

  updateBookmarkComment: (stepIndex: number, comment: string) => {
    const { bookmarks } = get();
    if (bookmarks[stepIndex] === undefined) return;
    set({ bookmarks: { ...bookmarks, [stepIndex]: comment } });
  },

  exportBookmarks: () => {
    const { bookmarks, currentAlgo, data } = get();
    return JSON.stringify({ algorithm: currentAlgo?.id, data, bookmarks }, null, 2);
  },

  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),

  startChallenge: () => {
    const { currentAlgo } = get();
    if (!currentAlgo || currentAlgo.dataKind !== 'array') return;
    // 生成随机数据
    const challengeData = randomArray(16);
    // 重新生成算法步骤以计算参考值
    const steps = safeGenerate(currentAlgo, challengeData);
    const algoSwaps = steps.filter((s) => s.type === 'swap').length;
    const algoCompares = steps.filter((s) => s.type === 'compare').length;

    set({
      challengeActive: true,
      challengeData: [...challengeData],
      challengeSwaps: 0,
      challengeStartTime: performance.now(),
      challengeResult: { userSwaps: 0, userTimeMs: 0, algoSwaps, algoCompares },
      data: challengeData,
      steps: [],
      stepIndex: 0,
      playing: false,
      compareCount: 0,
      swapCount: 0,
      selectedIndices: [],
      hintMessage: '',
    });
  },

  challengeSwap: (i: number, j: number) => {
    const { challengeData, challengeSwaps } = get();
    const next = [...challengeData];
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    const newSwaps = challengeSwaps + 1;

    // 检查是否有序
    const isSorted = next.every((v, idx) => idx === 0 || v >= next[idx - 1]);
    const newResult = get().challengeResult;
    const elapsed = performance.now() - get().challengeStartTime;

    set({
      challengeData: next,
      data: next,
      challengeSwaps: newSwaps,
      challengeResult: newResult ? { ...newResult, userSwaps: newSwaps, userTimeMs: elapsed } : null,
    });

    if (isSorted) {
      set({
        challengeActive: false,
        challengeResult: newResult ? { ...newResult, userSwaps: newSwaps, userTimeMs: elapsed } : null,
      });
      dispatchAchievement('speed-runner');
    }
  },

  endChallenge: () => {
    set({ challengeActive: false });
  },

  toggleManualMode: () => {
    const { manualMode } = get();
    if (manualMode) {
      set({ manualMode: false, selectedIndices: [], hintMessage: '' });
    } else {
      set({ manualMode: true, selectedIndices: [], hintMessage: '', playing: false });
    }
  },

  selectIndex: (index: number) => {
    const { selectedIndices, steps, stepIndex, currentAlgo } = get();
    if (!currentAlgo || currentAlgo.dataKind !== 'array') return;

    const cur = new Set(selectedIndices);

    // 点击已选中的 → 取消选中
    if (cur.has(index)) {
      cur.delete(index);
      set({ selectedIndices: [...cur], hintMessage: '' });
      return;
    }

    // 已选两个 → 清空重选
    if (cur.size >= 2) {
      set({ selectedIndices: [index], hintMessage: '' });
      return;
    }

    // 加入选中
    cur.add(index);
    const sel = [...cur];

    if (sel.length < 2) {
      set({ selectedIndices: sel });
      return;
    }

    // 选了两个 → 校验
    const step = steps[stepIndex];
    if (!step || !step.indices || step.indices.length < 2) {
      set({ selectedIndices: [], hintMessage: '该步骤无需选择下标' });
      return;
    }

    const sortedSel = [...sel].sort((a, b) => a - b);
    const sortedStep = [...step.indices].sort((a, b) => a - b);
    const match = sortedSel.length === sortedStep.length &&
      sortedSel.every((v, i) => v === sortedStep[i]);

    if (match) {
      // 校验通过，前进到下一步
      if (stepIndex < steps.length - 1) {
        const newIndex = stepIndex + 1;
        let compareCount = 0;
        let swapCount = 0;
        for (let i = 0; i <= newIndex; i++) {
          if (steps[i].type === 'compare') compareCount++;
          if (steps[i].type === 'swap') swapCount++;
        }
        set({
          stepIndex: newIndex,
          compareCount,
          swapCount,
          selectedIndices: [],
          hintMessage: newIndex >= steps.length - 1 ? '已完成所有步骤！' : '是 正确！',
        });
      } else {
        set({ selectedIndices: [], hintMessage: '已完成所有步骤！' });
      }
    } else {
      set({
        selectedIndices: [],
        hintMessage: `否 应为下标 [${sortedStep.join(', ')}] 的操作，请重试`,
      });
    }
  },

  clearSelection: () => {
    set({ selectedIndices: [], hintMessage: '' });
  },

  selectAlgorithm: (id: string) => {
    const algo = getAlgorithmById(id);
    if (!algo) return;
    const state = get();
    const data = algo.defaultData ?? state.data;
    const steps = safeGenerate(algo, data);

    const updates: Partial<VizState> = {
      currentAlgo: algo,
      data,
      steps,
      stepIndex: 0,
      playing: false,
      compareCount: 0,
      swapCount: 0,
      selectedIndices: [],
      hintMessage: '',
    };

    // 如果是对比模式，也更新对比算法
    if (state.compareMode && state.compareAlgo) {
      const compareSteps = safeGenerate(state.compareAlgo, data);
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
    const steps = safeGenerate(currentAlgo, data);

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
    const steps = safeGenerate(currentAlgo, data);

    const updates: Partial<VizState> = {
      data,
      steps,
      stepIndex: 0,
      playing: false,
      compareCount: 0,
      swapCount: 0,
    };

    if (compareMode && compareAlgo) {
      const compareSteps = safeGenerate(compareAlgo, data);
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
    const steps = safeGenerate(currentAlgo, data);

    const updates: Partial<VizState> = {
      steps,
      stepIndex: 0,
      playing: false,
      compareCount: 0,
      swapCount: 0,
    };

    if (compareMode && compareAlgo) {
      const compareSteps = safeGenerate(compareAlgo, data);
      updates.compareSteps = compareSteps;
      updates.compareStepIndex = 0;
      updates.compareCompareCount = 0;
      updates.compareSwapCount = 0;
    }

    set(updates as VizState);
  },

  clearError: () => set({ error: null }),

  toggleCompareMode: () => {
    const { compareMode, compareAlgo, data } = get();
    if (!compareMode) {
      // 开启对比模式，默认选择第一个不同类的算法
      if (!compareAlgo) {
        const firstAlgo = algorithms.find((a) => a.id !== get().currentAlgo?.id);
        if (firstAlgo) {
          const compareSteps = safeGenerate(firstAlgo, data);
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
        const compareSteps = safeGenerate(compareAlgo, data);
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
    const compareSteps = safeGenerate(algo, data);
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

  /** 生成分享 URL */
  getShareUrl: () => {
    const { currentAlgo, data, stepIndex } = get();
    if (!currentAlgo) return '';

    const params = new URLSearchParams();
    params.set('algo', currentAlgo.id);
    params.set('data', data.join(','));
    if (stepIndex > 0) {
      params.set('step', String(stepIndex));
    }

    return `${window.location.origin}/algo/${currentAlgo.id}?${params.toString()}`;
  },

  /** 从 URL 参数加载状态 */
  loadFromUrl: () => {
    const params = new URLSearchParams(window.location.search);
    const algoId = params.get('algo') || window.location.pathname.split('/').pop();
    const dataStr = params.get('data');
    const stepStr = params.get('step');

    if (algoId) {
      const algo = getAlgorithmById(algoId);
      if (algo) {
        const data = dataStr
          ? dataStr.split(',').map(Number).filter((n) => !isNaN(n))
          : algo.defaultData ?? [];

        if (data.length >= 4 && data.length <= 64) {
          const steps = safeGenerate(algo, data);
          const stepIndex = stepStr ? Math.min(Number(stepStr), steps.length - 1) : 0;

          set({
            currentAlgo: algo,
            data,
            steps,
            stepIndex: Math.max(0, stepIndex),
            playing: false,
            compareCount: 0,
            swapCount: 0,
          });
          return true;
        }
      }
    }
    return false;
  },
  });
});
