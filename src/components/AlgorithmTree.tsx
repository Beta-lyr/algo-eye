import { useState, useMemo } from 'react';
import { useVizStore } from '../store/useVizStore';
import { useT } from '../i18n';
import type { Algorithm } from '../algorithms/types';

const CATEGORY_ORDER: AlgorithmCategory[] = [
  'sorting',
  'searching',
  'graph',
  'data-structure',
  'string',
  'dynamic-programming',
];

type AlgorithmCategory = Algorithm['category'];

export function AlgorithmTree() {
  const algorithms = useVizStore((s) => s.algorithms);
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const selectAlgorithm = useVizStore((s) => s.selectAlgorithm);
  const t = useT();

  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    const g: Record<string, Algorithm[]> = {};
    const q = search.toLowerCase().trim();
    for (const algo of algorithms) {
      if (q && !algo.name.toLowerCase().includes(q) && !algo.id.toLowerCase().includes(q)) continue;
      (g[algo.category] ??= []).push(algo);
    }
    return g;
  }, [algorithms, search]);

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
        {t.tree.title} <span className="hint">{t.tree.hint}</span>
      </div>
      <input
        className="tree-search"
        placeholder="搜索算法…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="tree">
        {CATEGORY_ORDER.map((cat) => {
          const list = grouped[cat];
          if (!list || list.length === 0) return null;
          const isOpen = search ? true : openCategories.has(cat);

          return (
            <div key={cat} className={`grp${isOpen ? ' open' : ''}`}>
              <div
                className="grp-hd"
                onClick={() => !search && toggleCategory(cat)}
              >
                <span className="chev" />
                {t.category[cat]}
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
