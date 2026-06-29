import { useVizStore } from '../../store/useVizStore';
import { useT } from '../../i18n';

export function CompareToggle() {
  const compareMode = useVizStore((s) => s.compareMode);
  const toggleCompareMode = useVizStore((s) => s.toggleCompareMode);
  const t = useT();

  return (
    <button className={`btn ${compareMode ? 'primary' : ''}`} onClick={toggleCompareMode} title={t.controls.compareMode}>
      {compareMode ? `⇔ ${t.controls.compareMode}` : '⇔'}
    </button>
  );
}

export function CompareProgress() {
  const compareMode = useVizStore((s) => s.compareMode);
  const compareSteps = useVizStore((s) => s.compareSteps);
  const compareStepIndex = useVizStore((s) => s.compareStepIndex);

  if (!compareMode || compareSteps.length === 0) return null;

  return (
    <span className="compare-progress">
      vs: {compareStepIndex + 1}/{compareSteps.length}
    </span>
  );
}
