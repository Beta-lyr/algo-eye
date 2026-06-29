import { useEffect, useState, useCallback } from 'react';
import { onAchievement } from '../lib/achievementEvents';
import type { Achievement } from '../engine/achievements';

export function AchievementToast() {
  const [queue, setQueue] = useState<Achievement[]>([]);

  useEffect(() => onAchievement((ach) => setQueue((q) => [...q, ach])), []);

  const dismiss = useCallback(() => {
    setQueue((q) => q.slice(1));
  }, []);

  const current = queue[0] ?? null;

  return <ToastInner achievement={current} onDone={dismiss} />;
}

function ToastInner({
  achievement,
  onDone,
}: {
  achievement: Achievement | null;
  onDone: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!achievement) return;
    const a = requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 3200);
    return () => { cancelAnimationFrame(a); clearTimeout(t); };
  }, [achievement, onDone]);

  if (!achievement) return null;

  return (
    <div className={`ach-toast${visible ? ' show' : ''}`}>
      <div className="ach-toast-icon">{achievement.icon}</div>
      <div className="ach-toast-body">
        <div className="ach-toast-title">[*] 成就解锁！</div>
        <div className="ach-toast-name">{achievement.name}</div>
        <div className="ach-toast-desc">{achievement.desc}</div>
      </div>
    </div>
  );
}
