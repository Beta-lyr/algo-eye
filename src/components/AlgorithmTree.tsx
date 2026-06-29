import { useState, useMemo } from 'react';
import { useVizStore } from '../store/useVizStore';
import { useT } from '../i18n';
import type { Algorithm, AlgorithmDifficulty } from '../algorithms/types';

const CATEGORY_ORDER: AlgorithmCategory[] = [
  'sorting',
  'searching',
  'graph',
  'data-structure',
  'string',
  'dynamic-programming',
];

type AlgorithmCategory = Algorithm['category'];

const DIFFICULTIES: { key: AlgorithmDifficulty | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'beginner', label: '入门' },
  { key: 'intermediate', label: '进阶' },
  { key: 'advanced', label: '高级' },
];

export function AlgorithmTree() {
  const algorithms = useVizStore((s) => s.algorithms);
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const selectAlgorithm = useVizStore((s) => s.selectAlgorithm);
  const t = useT();

  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<AlgorithmDifficulty | 'all'>('all');

  const grouped = useMemo(() => {
    const g: Record<string, Algorithm[]> = {};
    const q = search.toLowerCase().trim();
    for (const algo of algorithms) {
      if (q && !algo.name.toLowerCase().includes(q) && !algo.id.toLowerCase().includes(q)) continue;
      if (diffFilter !== 'all' && algo.difficulty !== diffFilter) continue;
      (g[algo.category] ??= []).push(algo);
    }
    return g;
  }, [algorithms, search, diffFilter]);

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

  const hasFilter = search.trim().length > 0 || diffFilter !== 'all';

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
      <div className="diff-filters">
        {DIFFICULTIES.map((d) => (
          <span
            key={d.key}
            className={`diff-pill${diffFilter === d.key ? ' active' : ''}`}
            onClick={() => setDiffFilter(d.key)}
          >
            {d.label}
          </span>
        ))}
      </div>
      <div className="tree">
        {CATEGORY_ORDER.map((cat) => {
          const list = grouped[cat];
          if (!list || list.length === 0) return null;
          const isOpen = hasFilter ? true : openCategories.has(cat);

          return (
            <div key={cat} className={`grp${isOpen ? ' open' : ''}`}>
              <div
                className="grp-hd"
                onClick={() => !hasFilter && toggleCategory(cat)}
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
                    <span className="leaf-name">{algo.name}</span>
                    {algo.difficulty && (
                      <span className={`leaf-diff ${algo.difficulty}`} />
                    )}
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
