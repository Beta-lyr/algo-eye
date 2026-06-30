import { useT } from '../../i18n';
import { EXAMPLES } from '../../playground/examples';
import type { PlaygroundExample } from '../../playground/examples';

interface Props {
  dataKind: 'array' | 'string' | 'grid';
  onSelect: (example: PlaygroundExample) => void;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export function ExampleLibrary({ dataKind, onSelect }: Props) {
  const t = useT();
  const filtered = EXAMPLES.filter((ex) => ex.dataKind === dataKind);

  return (
    <div className="example-library">
      <div className="pane-hd">{t.playground.examples}</div>
      {filtered.map((ex) => (
        <div
          key={ex.id}
          className="example-item"
          onClick={() => onSelect(ex)}
        >
          <div className="example-item-hd">
            <span className="example-title">{ex.title}</span>
            <span className={`diff-badge diff-${ex.difficulty}`}>
              {DIFFICULTY_LABEL[ex.difficulty]}
            </span>
          </div>
          <div className="example-desc">{ex.description}</div>
        </div>
      ))}
    </div>
  );
}
