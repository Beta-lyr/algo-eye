import { useT } from '../../i18n';
import { CHALLENGES } from '../../playground/challenges';
import type { PlaygroundChallenge } from '../../playground/challenges';

interface Props {
  activeChallengeId: string | null;
  onSelect: (challenge: PlaygroundChallenge) => void;
  onExit: () => void;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export function ChallengePanel({ activeChallengeId, onSelect, onExit }: Props) {
  const t = useT();

  return (
    <div className="challenge-panel">
      <div className="pane-hd">
        <span>{t.playground.challenges}</span>
        {activeChallengeId && (
          <button className="btn sm" onClick={onExit}>{t.playground.exitChallenge}</button>
        )}
      </div>
      {CHALLENGES.map((ch) => (
        <div
          key={ch.id}
          className={`challenge-item${ch.id === activeChallengeId ? ' active' : ''}`}
          onClick={() => onSelect(ch)}
        >
          <div className="challenge-item-hd">
            <span className="challenge-title">{ch.title}</span>
            <span className={`diff-badge diff-${ch.difficulty}`}>
              {DIFFICULTY_LABEL[ch.difficulty]}
            </span>
          </div>
          <div className="challenge-desc">{ch.description}</div>
        </div>
      ))}
    </div>
  );
}
