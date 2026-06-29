import { useState, useEffect } from 'react';

const STEPS = [
  {
    title: '欢迎使用 ALGO::VIZ',
    desc: '这是一个终端风格的算法可视化学习工具。通过动画演示，帮助你直观理解各种算法的工作原理。',
  },
  {
    title: '左侧面板 — 选择算法',
    desc: '左侧目录树按分类排列了 36 种算法。点击任意算法即可切换到对应的可视化。支持搜索和难度过滤。',
  },
  {
    title: '底部控制栏 — 播放控制',
    desc: '使用 ▶ 按钮播放动画，⏮ ⏭ 单步前进/后退。进度条可点击跳转，还可以添加书签标记关键步骤。',
  },
  {
    title: '键盘快捷键',
    desc: 'Space 播放/暂停 · ← → 步进 · F 焦点模式 · ? 查看全部快捷键',
  },
  {
    title: '深入理解',
    desc: '点击标题栏的 ▸ 讲解按钮，查看算法的详细说明、复杂度分析和伪代码。',
  },
];

export function Tutorial() {
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
          <button className="btn" onClick={close}>跳过</button>
          <div className="tutorial-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`dot${i === step ? ' active' : ''}`} />
            ))}
          </div>
          {step < STEPS.length - 1 ? (
            <button className="btn primary" onClick={() => setStep((s) => s + 1)}>下一步</button>
          ) : (
            <button className="btn primary" onClick={close}>开始使用</button>
          )}
        </div>
      </div>
    </div>
  );
}
