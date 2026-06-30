// ============================================================
// V3 虚拟算法 — 作为 currentAlgo 占位，让 VizStage/Controls 零改动复用
// V3 的 steps 来自 Worker，不走 generate() 路径
// ============================================================

import type { Algorithm } from '../algorithms/types';

export const CUSTOM_ALGO: Algorithm = {
  id: 'custom-code',
  name: '自定义代码',
  category: 'sorting',
  complexity: { time: '—', space: '—', stable: false },
  codeLines: [],
  dataKind: 'array',
  difficulty: 'beginner',
  tags: [],
  relatedAlgorithms: [],
  *generate() {
    // V3 步骤由 Worker 产出后经 loadCustomSteps 灌入 store，不调用此生成器
  },
};
