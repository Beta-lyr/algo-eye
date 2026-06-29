import { ALL_ACHIEVEMENTS, getUnlocked } from '../engine/achievements';

export function AchievementsPanel({ onClose }: { onClose: () => void }) {
  const unlocked = getUnlocked();

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="ach-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-hd">
          <span>[*] 成就 ({unlocked.size}/{ALL_ACHIEVEMENTS.length})</span>
          <span className="close" onClick={onClose}>✕</span>
        </div>
        <div className="ach-grid">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const has = unlocked.has(ach.id);
            return (
              <div key={ach.id} className={`ach-card${has ? ' unlocked' : ''}`}>
                <div className="ach-card-icon">{has ? ach.icon : '?'}</div>
                <div className="ach-card-body">
                  <div className="ach-card-name">{ach.name}</div>
                  <div className="ach-card-desc">{ach.desc}</div>
                </div>
                {has && <div className="ach-card-check">✓</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
