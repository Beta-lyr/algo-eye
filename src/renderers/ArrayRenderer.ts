// ============================================================
// ArrayRenderer — 排序 / 搜索柱状图渲染器
// 纯函数：同一 snapshot 永远画同一帧
// ============================================================

import type { Renderer } from './Renderer';
import type { DrawOpts } from './Renderer';
import type { Snapshot, ElementState } from '../engine/types';

/** 状态 → 颜色映射（与设计系统 token 一致） */
const STATE_COLORS: Record<ElementState, string> = {
  default: '#33ff66',
  compare: '#ffb000',
  swap: '#ff5555',
  sorted: '#00e5ff',
  visit: '#b388ff',
  current: '#ffb000',
  path: '#00e676',
  pivot: '#ff79c6',
};

export const ArrayRenderer: Renderer<Snapshot> = {
  draw(ctx: CanvasRenderingContext2D, snap: Snapshot, opts: DrawOpts): void {
    const { canvasWidth, canvasHeight } = opts;
    const { data, states, pointers } = snap;

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (data.length === 0) return;

    const maxVal = Math.max(...data, 1);
    const barGap = 6;
    const paddingX = 40;
    const paddingBottom = 28;
    const barAreaHeight = canvasHeight - paddingBottom;

    // 自适应柱宽
    const barWidth = Math.max(
      4,
      (canvasWidth - paddingX * 2 - barGap * (data.length - 1)) / data.length,
    );

    // 逐个绘制
    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      const state: ElementState = states[i] ?? 'default';
      const color = STATE_COLORS[state] ?? STATE_COLORS.default;
      const barHeight = (val / maxVal) * barAreaHeight;
      const x = paddingX + i * (barWidth + barGap);
      const y = barAreaHeight - barHeight;

      // ===== 辉光 =====
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;

      // ===== 柱体 =====
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // ===== 重置辉光 =====
      ctx.shadowBlur = 0;

      // ===== 数值（柱顶） =====
      ctx.fillStyle = '#2e5e3e';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(String(val), x + barWidth / 2, y - 2);

      // ===== 下标（柱底） =====
      ctx.fillStyle = '#3a6b4a';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      ctx.fillText(String(i), x + barWidth / 2, barAreaHeight + 4);

      // ===== 指针标签（如 'j', 'j+1', 'pivot'） =====
      if (pointers && pointers[i]) {
        ctx.fillStyle = '#ffb000';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffb000';
        ctx.textBaseline = 'bottom';
        ctx.fillText(pointers[i], x + barWidth / 2, y - 14);
        ctx.shadowBlur = 0;
      }
    }
  },
};
