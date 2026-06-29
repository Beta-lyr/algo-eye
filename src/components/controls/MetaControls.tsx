import { useState, useCallback, useEffect } from 'react';
import { useVizStore } from '../../store/useVizStore';
import { useT } from '../../i18n';
import { dispatchAchievement } from '../../lib/achievementEvents';
import { AchievementsPanel } from '../AchievementsPanel';

interface MetaControlsProps {
  showShortcuts: boolean;
  setShowShortcuts: (v: boolean) => void;
}

export function MetaControls({ showShortcuts, setShowShortcuts }: MetaControlsProps) {
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const manualMode = useVizStore((s) => s.manualMode);
  const toggleManualMode = useVizStore((s) => s.toggleManualMode);
  const getShareUrl = useVizStore((s) => s.getShareUrl);
  const t = useT();

  const [showAchievements, setShowAchievements] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    if (showShortcuts) dispatchAchievement('shortcut-king');
  }, [showShortcuts]);

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector('.viz-stage canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `algo-eye-${currentAlgo?.id ?? 'screenshot'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, [currentAlgo]);

  const handleShare = useCallback(() => {
    const url = getShareUrl();
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      });
    }
  }, [getShareUrl]);

  return (
    <>
      <button
        className={`btn ${manualMode ? 'primary' : ''}`}
        onClick={toggleManualMode}
        title={t.controls.manualMode}
        disabled={currentAlgo?.dataKind !== 'array'}
      >
        ✋ {manualMode ? t.controls.manualMode : ''}
      </button>

      <div className="spacer" />

      <button className="btn" onClick={handleScreenshot} title={t.controls.screenshot}>
        {t.controls.screenshot}
      </button>

      <button className="btn" onClick={handleShare} title={t.controls.share}>
        {shareStatus === 'copied' ? t.controls.copied : t.controls.share}
      </button>

      <button className="btn" onClick={() => setShowAchievements((v) => !v)} title={t.controls.achievements}>
        [*]
      </button>

      <button className="btn" onClick={() => setShowShortcuts(!showShortcuts)} title={t.controls.shortcuts}>
        ⌨
      </button>

      {showAchievements && <AchievementsPanel onClose={() => setShowAchievements(false)} />}

      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-hd">
              ⌨ {t.controls.shortcutPanel}
              <span className="close" onClick={() => setShowShortcuts(false)}>✕</span>
            </div>
            <div className="shortcuts-body">
              <div className="shortcut-row"><kbd>Space</kbd><span>{t.controls.shortcutPlay}</span></div>
              <div className="shortcut-row"><kbd>←</kbd><span>{t.controls.shortcutPrev}</span></div>
              <div className="shortcut-row"><kbd>→</kbd><span>{t.controls.shortcutNext}</span></div>
              <div className="shortcut-row"><kbd>F</kbd><span>{t.controls.shortcutFocus}</span></div>
              <div className="shortcut-row"><kbd>?</kbd><span>{t.controls.shortcutPanelToggle}</span></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
