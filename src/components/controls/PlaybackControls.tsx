import { useVizStore } from '../../store/useVizStore';
import { useT } from '../../i18n';

interface PlaybackControlsProps {
  togglePlay: () => void;
  stepForward: () => void;
  stepBack: () => void;
}

export function PlaybackControls({ togglePlay, stepForward, stepBack }: PlaybackControlsProps) {
  const steps = useVizStore((s) => s.steps);
  const stepIndex = useVizStore((s) => s.stepIndex);
  const playing = useVizStore((s) => s.playing);
  const speed = useVizStore((s) => s.speed);
  const setSpeed = useVizStore((s) => s.setSpeed);
  const t = useT();

  const disabled = steps.length === 0;
  const isAtEnd = stepIndex >= steps.length - 1;
  const isAtStart = stepIndex === 0;

  return (
    <>
      <div className="ctrl-group">
        <button className="btn" disabled={disabled || isAtStart} onClick={stepBack} title={t.controls.prev}>
          ⏮
        </button>
        <button className="btn primary" disabled={disabled} onClick={togglePlay} title={playing ? t.controls.pause : t.controls.play}>
          {playing ? '⏸' : '▶'}
        </button>
        <button className="btn" disabled={disabled || isAtEnd} onClick={stepForward} title={t.controls.next}>
          ⏭
        </button>
      </div>

      <div className="speed">
        <label>{t.controls.speed}</label>
        <input type="range" min={1} max={10} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        <span className="val">{speed}×</span>
      </div>
    </>
  );
}
