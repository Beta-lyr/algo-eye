import { useT } from '../../i18n';
import type { ChallengeResult } from '../../playground/challenges';

export interface RunStats {
  total: number;
  compare: number;
  swap: number;
  visit: number;
  mark: number;
  duration: number;
}

interface Props {
  stats: RunStats;
  challengeResult: ChallengeResult | null;
  onClose: () => void;
}

export function RunSummary({ stats, challengeResult, onClose }: Props) {
  const t = useT();

  return (
    <div className="overlay" onClick={onClose}>
      <div className="run-summary" onClick={(e) => e.stopPropagation()}>
        <div className="run-summary-hd">
          <span>{t.playground.runComplete}</span>
          <button className="btn" onClick={onClose}>✕</button>
        </div>

        <div className="run-summary-body">
          <div className="stat-row">
            <span className="stat-label">{t.playground.statSteps}</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">{t.playground.statCompare}</span>
            <span className="stat-value">{stats.compare}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">{t.playground.statSwap}</span>
            <span className="stat-value">{stats.swap}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">{t.playground.statVisit}</span>
            <span className="stat-value">{stats.visit}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">{t.playground.statMark}</span>
            <span className="stat-value">{stats.mark}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">{t.playground.statDuration}</span>
            <span className="stat-value">{stats.duration}ms</span>
          </div>

          {challengeResult && (
            <div className={`challenge-result ${challengeResult.passed ? 'passed' : 'failed'}`}>
              <div className="result-badge">
                {challengeResult.passed ? t.playground.passed : t.playground.failed}
              </div>
              <div className="result-message">{challengeResult.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
