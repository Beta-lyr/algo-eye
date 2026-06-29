import { tryUnlock, markAlgoViewed, CATEGORIES, getViewedAlgos } from '../engine/achievements';
import type { Achievement } from '../engine/achievements';

const EV_KEY = 'algo-eye-achieve';

export function dispatchAchievement(id: string): Achievement | null {
  const ach = tryUnlock(id);
  if (ach) {
    window.dispatchEvent(new CustomEvent(EV_KEY, { detail: ach }));
  }
  return ach;
}

export function onAchievement(cb: (ach: Achievement) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent).detail);
  window.addEventListener(EV_KEY, handler);
  return () => window.removeEventListener(EV_KEY, handler);
}

/** 标记算法已查看并检查分类成就 / 全收集 */
export function trackAlgoView(
  algoId: string,
  algorithms: { id: string; category: string }[],
): void {
  const firstView = markAlgoViewed(algoId);
  if (!firstView) return;

  // 检查分类成就
  const viewed = getViewedAlgos();
  for (const cat of CATEGORIES) {
    const catAlgos = algorithms.filter((a) => a.category === cat.id);
    const allSeen = catAlgos.every((a) => viewed.has(a.id));
    if (allSeen) {
      dispatchAchievement(cat.achId);
    }
  }

  // 全收集
  if (algorithms.every((a) => viewed.has(a.id))) {
    dispatchAchievement('all-seeing');
  }
}
