// ============================================================
// useVizStore — 全局可视化状态（Zustand）
// 管理：当前算法 / 数据 / 步骤 / 播放状态 / 统计
// 支持对比模式
// 组合模式：各 slice 在 src/store/slices/ 中独立实现
// 对外接口（VizState + useVizStore）保持不变
// ============================================================

import { create } from 'zustand';
import { createPlaybackSlice } from './slices/playbackSlice';
import { createCompareSlice } from './slices/compareSlice';
import { createChallengeSlice } from './slices/challengeSlice';
import { createBookmarkSlice } from './slices/bookmarkSlice';
import { createManualSlice } from './slices/manualSlice';
import { algorithms } from '../algorithms';

export interface VizState {
  // ===== 算法 =====
  algorithms: import('../algorithms/types').Algorithm[];
  currentAlgo: import('../algorithms/types').Algorithm | null;

  // ===== 数据与步骤 =====
  data: number[];
  steps: import('../engine/types').Step[];
  stepIndex: number;

  // ===== 播放状态 =====
  playing: boolean;
  speed: number;
  compareCount: number;
  swapCount: number;

  // ===== 焦点模式 =====
  focusMode: boolean;

  // ===== 错误状态 =====
  error: string | null;

  // ===== 手动模式 =====
  manualMode: boolean;
  selectedIndices: number[];
  hintMessage: string;

  // ===== 书签 =====
  bookmarks: Record<number, string>;
  toggleBookmark: (stepIndex: number) => void;
  updateBookmarkComment: (stepIndex: number, comment: string) => void;
  exportBookmarks: () => string;

  // ===== 挑战模式 =====
  challengeActive: boolean;
  challengeData: number[];
  challengeSwaps: number;
  challengeStartTime: number;
  challengeResult: { userSwaps: number; userTimeMs: number; algoSwaps: number; algoCompares: number } | null;

  // ===== 对比模式 =====
  compareMode: boolean;
  compareAlgo: import('../algorithms/types').Algorithm | null;
  compareSteps: import('../engine/types').Step[];
  compareStepIndex: number;
  compareCompareCount: number;
  compareSwapCount: number;

  // ===== 操作 =====
  toggleManualMode: () => void;
  selectIndex: (index: number) => void;
  clearSelection: () => void;
  selectAlgorithm: (id: string) => void;
  setData: (data: number[]) => void;
  setStepIndex: (index: number) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  randomizeData: (count: number) => void;
  reset: () => void;
  toggleFocusMode: () => void;
  clearError: () => void;
  startChallenge: () => void;
  challengeSwap: (i: number, j: number) => void;
  endChallenge: () => void;
  toggleCompareMode: () => void;
  setCompareAlgo: (id: string) => void;
  syncCompareStep: () => void;
  getShareUrl: () => string;
  loadFromUrl: () => boolean;
  /** V3：接收用户代码（Worker 产出）的 steps，灌入 store 供 VizStage/Controls 播放 */
  loadCustomSteps: (steps: import('../engine/types').Step[], data: number[]) => void;
}

export const useVizStore = create<VizState>((set, get) => ({
  algorithms,

  ...createPlaybackSlice(set, get),
  ...createCompareSlice(set, get),
  ...createChallengeSlice(set, get),
  ...createBookmarkSlice(set, get),
  ...createManualSlice(set, get),
}));
