import { useState } from 'react';
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

type DiffFilter = 'all' | 'easy' | 'medium' | 'hard';

export function ExampleLibrary({ dataKind, onSelect }: Props) {
  const t = useT();
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('all');
  const byKind = EXAMPLES.filter((ex) => ex.dataKind === dataKind);
  const filtered = diffFilter === 'all' ? byKind : byKind.filter((ex) => ex.difficulty === diffFilter);

  return (
    <div className="example-library">
      <div className="pane-hd">{t.playground.examples}</div>
      <div className="filter-bar">
        {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
          <button
            key={d}
            className={`filter-tag${diffFilter === d ? ' active' : ''}`}
            onClick={() => setDiffFilter(d)}
          >
            {d === 'all' ? t.playground.diffAll : DIFFICULTY_LABEL[d]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-hint">{t.playground.noExamples}</div>
      ) : (
        filtered.map((ex) => (
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
        ))
      )}
    </div>
  );
}
