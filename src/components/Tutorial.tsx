import { useState, useEffect } from 'react';
import { useT } from '../i18n';

export function Tutorial() {
  const t = useT();

  const STEPS = [
    { title: t.tutorial.step1Title, desc: t.tutorial.step1Desc },
    { title: t.tutorial.step2Title, desc: t.tutorial.step2Desc },
    { title: t.tutorial.step3Title, desc: t.tutorial.step3Desc },
    { title: t.tutorial.step4Title, desc: t.tutorial.step4Desc },
    { title: t.tutorial.step5Title, desc: t.tutorial.step5Desc },
  ];

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('algo-eye-tutorial-seen');
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem('algo-eye-tutorial-seen', '1');
    setOpen(false);
  };

  if (!open) return null;

  const current = STEPS[step];

  return (
    <div className="tutorial-overlay" onClick={close}>
      <div className="tutorial-panel" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-hd">
          <span className="tutorial-step">{step + 1} / {STEPS.length}</span>
          <span className="close" onClick={close}>✕</span>
        </div>
        <div className="tutorial-body">
          <div className="tutorial-icon">◆</div>
          <h2 className="tutorial-title">{current.title}</h2>
          <p className="tutorial-desc">{current.desc}</p>
        </div>
        <div className="tutorial-ft">
          <button className="btn" onClick={close}>{t.tutorial.skip}</button>
          <div className="tutorial-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`dot${i === step ? ' active' : ''}`} />
            ))}
          </div>
          {step < STEPS.length - 1 ? (
            <button className="btn primary" onClick={() => setStep((s) => s + 1)}>{t.tutorial.next}</button>
          ) : (
            <button className="btn primary" onClick={close}>{t.tutorial.start}</button>
          )}
        </div>
      </div>
    </div>
  );
}
