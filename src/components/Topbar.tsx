// ============================================================
// Topbar — 顶栏（logo + 导航 + 状态）
// ============================================================

import { useVizStore } from '../store/useVizStore';

const NAV_ITEMS: { key: string; label: string }[] = [
  { key: 'sorting', label: '排序' },
  { key: 'searching', label: '搜索' },
  { key: 'graph', label: '图' },
  { key: 'data-structure', label: '数据结构' },
];

export function Topbar() {
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const data = useVizStore((s) => s.data);

  return (
    <header className="topbar">
      <div className="logo">
        ▌ALGO<span className="sep">::</span>VIZ
      </div>
      <a
        href="https://github.com/Beta-lyr/algo-eye"
        target="_blank"
        rel="noopener noreferrer"
        className="github-badge"
        title="View on GitHub"
      >
        ⬡ GITHUB
      </a>
      <div className="tagline">phosphor terminal for algorithms</div>
      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            className={currentAlgo?.category === item.key ? 'active' : ''}
            href="#"
          >
            {item.label}
          </a>
        ))}
        <a href="#">关于</a>
      </nav>
      <div className="status">
        <span className="dot" />
        LIVE · {data.length} elements · {currentAlgo?.name ?? '—'}
      </div>
    </header>
  );
}
