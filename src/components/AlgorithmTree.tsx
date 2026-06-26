// ============================================================
// AlgorithmTree — 算法目录树（左侧面板）
// 按分类展示所有可用算法，支持折叠/展开
// ============================================================

import { useState } from 'react';
import { useVizStore } from '../store/useVizStore';
import type { Algorithm, AlgorithmCategory } from '../algorithms/types';

/** 分类中文名 */
const CATEGORY_LABELS: Record<AlgorithmCategory, string> = {
  sorting: '排序算法',
  searching: '搜索算法',
  graph: '图算法',
  'data-structure': '数据结构',
};

/** 分类排序 */
const CATEGORY_ORDER: AlgorithmCategory[] = [
  'sorting',
  'searching',
  'graph',
  'data-structure',
];

export function AlgorithmTree() {
  const algorithms = useVizStore((s) => s.algorithms);
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const selectAlgorithm = useVizStore((s) => s.selectAlgorithm);

  // 按分类分组
  const grouped: Record<string, Algorithm[]> = {};
  for (const algo of algorithms) {
    (grouped[algo.category] ??= []).push(algo);
  }

  // 默认展开排序分类
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(['sorting']),
  );

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  return (
    <aside className="pane">
      <div className="pane-hd">
        算法目录 <span className="hint">/tree</span>
      </div>
      <div className="tree">
        {CATEGORY_ORDER.map((cat) => {
          const list = grouped[cat];
          if (!list || list.length === 0) return null;
          const isOpen = openCategories.has(cat);

          return (
            <div key={cat} className={`grp${isOpen ? ' open' : ''}`}>
              <div
                className="grp-hd"
                onClick={() => toggleCategory(cat)}
              >
                <span className="chev" />
                {CATEGORY_LABELS[cat]}
                <span className="ct">{list.length}</span>
              </div>
              <div className="grp-bd">
                {list.map((algo) => (
                  <div
                    key={algo.id}
                    className={`leaf${algo.id === currentAlgo?.id ? ' active' : ''}`}
                    onClick={() => selectAlgorithm(algo.id)}
                  >
                    {algo.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
