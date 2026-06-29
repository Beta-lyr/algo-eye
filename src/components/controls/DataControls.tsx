import { useState } from 'react';
import { useVizStore } from '../../store/useVizStore';
import { useT } from '../../i18n';

export function DataControls() {
  const data = useVizStore((s) => s.data);
  const randomizeData = useVizStore((s) => s.randomizeData);
  const setData = useVizStore((s) => s.setData);
  const setPlaying = useVizStore((s) => s.setPlaying);
  const t = useT();

  const [customInput, setCustomInput] = useState('');

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val >= 4 && val <= 64) {
      setPlaying(false);
      randomizeData(val);
    }
  };

  const handleRandom = () => {
    setPlaying(false);
    randomizeData(data.length);
  };

  const handleCustomData = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const raw = customInput.trim();
    if (!raw) return;
    const parts = raw.split(/[,\s]+/);
    const nums = parts.map(Number).filter((n) => !isNaN(n));
    if (nums.length >= 4 && nums.length <= 64) {
      setPlaying(false);
      setData(nums);
      setCustomInput('');
    }
  };

  return (
    <>
      <div className="ctrl-group">
        <label>{t.controls.dataSize}</label>
        <input className="num-input" type="number" value={data.length} min={4} max={64} onChange={handleCountChange} />
      </div>

      <button className="btn" onClick={handleRandom}>
        {t.controls.randomData}
      </button>

      <input
        className="data-input"
        placeholder={t.controls.customData.replace('{data}', data.join(','))}
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        onKeyDown={handleCustomData}
      />
    </>
  );
}
