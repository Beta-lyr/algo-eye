// ============================================================
// Topbar — 顶栏（logo + 导航 + 状态）
// ============================================================

import { useVizStore } from '../store/useVizStore';
import { useT } from '../i18n';
import { LanguageSwitch } from './LanguageSwitch';
import type { AlgorithmCategory } from '../algorithms/types';

const NAV_KEYS: AlgorithmCategory[] = [
  'sorting',
  'searching',
  'graph',
  'data-structure',
];

export function Topbar() {
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const data = useVizStore((s) => s.data);
  const t = useT();

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
        title="GitHub"
      >
        ⬡ {t.common.github}
      </a>
      <div className="tagline">{t.topbar.tagline}</div>
      <nav className="nav">
        {NAV_KEYS.map((key) => (
          <a
            key={key}
            className={currentAlgo?.category === key ? 'active' : ''}
            href="#"
          >
            {t.nav[key]}
          </a>
        ))}
        <a href="#">{t.common.about}</a>
      </nav>
      <div className="status">
        <span className="dot" />
        {t.topbar.live} · {data.length} {t.topbar.elements} · {currentAlgo?.name ?? '—'}
      </div>
      <LanguageSwitch />
    </header>
  );
}
