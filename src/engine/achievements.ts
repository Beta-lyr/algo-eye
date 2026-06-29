export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export const CATEGORIES: { id: string; achId: string; label: string }[] = [
  { id: 'sort', achId: 'sorting-master', label: '排序大师' },
  { id: 'search', achId: 'search-guru', label: '搜索达人' },
  { id: 'graph', achId: 'graph-explorer', label: '图探索者' },
  { id: 'data-structure', achId: 'ds-expert', label: '数据结构专家' },
  { id: 'string', achId: 'string-theorist', label: '字符串理论家' },
  { id: 'dp', achId: 'dp-wizard', label: 'DP 魔法师' },
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'sorting-master', name: '排序大师', desc: '查看全部 10 个排序算法', icon: '⋮⋰' },
  { id: 'search-guru', name: '搜索达人', desc: '查看全部 5 个搜索算法', icon: '⌕' },
  { id: 'graph-explorer', name: '图探索者', desc: '查看全部 8 个图算法', icon: '◈' },
  { id: 'ds-expert', name: '数据结构专家', desc: '查看全部 6 个数据结构算法', icon: '⎔' },
  { id: 'string-theorist', name: '字符串理论家', desc: '查看全部 3 个字符串算法', icon: '⌨' },
  { id: 'dp-wizard', name: 'DP 魔法师', desc: '查看全部 3 个动态规划算法', icon: '▤' },
  { id: 'speed-runner', name: '竞速者', desc: '完成一次挑战模式', icon: '!' },
  { id: 'bookworm', name: '书虫', desc: '查看任意算法的讲解页面', icon: '▸' },
  { id: 'shortcut-king', name: '快捷键之王', desc: '打开快捷键帮助面板', icon: '⌨' },
  { id: 'all-seeing', name: '全视之眼', desc: '查看全部 36 个算法', icon: '◎' },
];

const UNLOCKED_KEY = 'algo-eye-achievements';

export function getUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

function saveUnlocked(ids: Set<string>): void {
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify([...ids]));
}

export function tryUnlock(id: string): Achievement | null {
  const unlocked = getUnlocked();
  if (unlocked.has(id)) return null;
  unlocked.add(id);
  saveUnlocked(unlocked);
  return ALL_ACHIEVEMENTS.find((a) => a.id === id) ?? null;
}

// ===== 跟踪已查看的算法 =====

const VIEWED_KEY = 'algo-eye-viewed-algos';

export function getViewedAlgos(): Set<string> {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

export function markAlgoViewed(id: string): boolean {
  const viewed = getViewedAlgos();
  if (viewed.has(id)) return false;
  viewed.add(id);
  localStorage.setItem(VIEWED_KEY, JSON.stringify([...viewed]));
  return true;
}
