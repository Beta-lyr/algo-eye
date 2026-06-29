import { useState, useEffect } from 'react';
import { useVizStore } from '../../store/useVizStore';
import { useT } from '../../i18n';

export function ChallengeControls() {
  const challengeActive = useVizStore((s) => s.challengeActive);
  const challengeSwaps = useVizStore((s) => s.challengeSwaps);
  const challengeStartTime = useVizStore((s) => s.challengeStartTime);
  const challengeResult = useVizStore((s) => s.challengeResult);
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const startChallenge = useVizStore((s) => s.startChallenge);
  const endChallenge = useVizStore((s) => s.endChallenge);
  const t = useT();

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!challengeActive) { setElapsed(0); return; }
    const id = setInterval(() => {
      setElapsed(Math.floor((performance.now() - challengeStartTime) / 100) * 100);
    }, 100);
    return () => clearInterval(id);
  }, [challengeActive, challengeStartTime]);

  return (
    <>
      {challengeActive ? (
        <div className="challenge-badge">
          {t.controls.challengeResultTime.replace('{t}', (elapsed / 1000).toFixed(1)).replace('{n}', String(challengeSwaps))}
          <button className="btn" onClick={endChallenge}>✕ {t.controls.challengeExit}</button>
        </div>
      ) : (
        <button
          className={`btn ${challengeResult ? 'primary' : ''}`}
          onClick={startChallenge}
          title={t.controls.challengeMode}
          disabled={currentAlgo?.dataKind !== 'array'}
        >
          ⚔ {t.controls.challengeMode}
        </button>
      )}

      {challengeResult && !challengeActive && (
        <div className="challenge-result">
          {t.controls.challengeResultTime.replace('{t}', (challengeResult.userTimeMs / 1000).toFixed(1)).replace('{n}', String(challengeResult.userSwaps))}
          <span className="vs">vs</span>
          {t.controls.challengeResultAlgo.replace('{s}', String(challengeResult.algoSwaps)).replace('{c}', String(challengeResult.algoCompares))}
        </div>
      )}
    </>
  );
}
