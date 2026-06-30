// ============================================================
// V3 starter 模板——按 dataKind 提供骨架，引导用户改写
// 最小骨架阶段只提供 array 类的冒泡排序骨架
// ============================================================

export const BUBBLE_TEMPLATE = `// 用 viz API 录制排序过程
// 可用：viz.compare / viz.swap / viz.set / viz.mark / viz.pointer / viz.visit / viz.log / viz.done
// 读取：viz.value(i) / viz.length
const n = viz.length;
for (let i = 0; i < n - 1; i++) {
  for (let j = 0; j < n - i - 1; j++) {
    viz.compare(j, j + 1);
    if (viz.value(j) > viz.value(j + 1)) {
      viz.swap(j, j + 1);
    }
  }
  viz.mark(n - 1 - i, 'sorted');
}
viz.done();
`;

export interface CodeTemplate {
  id: string;
  label: string;
  code: string;
}

export const TEMPLATES: CodeTemplate[] = [
  { id: 'bubble', label: '冒泡排序', code: BUBBLE_TEMPLATE },
];
