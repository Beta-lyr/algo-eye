// ============================================================
// GridRenderer — 网格渲染器（图算法：BFS/DFS/Dijkstra）
// 按 cellSize 画格子，墙/空/已访问/前沿/路径/起终点
// 纯函数：同一 snapshot 永远画同一帧
// ============================================================

import type { Renderer } from './Renderer';
import type { DrawOpts } from './Renderer';
import type { Snapshot, ElementState } from '../engine/types';

/** 状态 → 颜色映射 */
const STATE_COLORS: Record<ElementState, string> = {
  default: '#33ff66',
  compare: '#ffb000',
  swap: '#ff5555',
  sorted: '#00e5ff',
  visit: '#b388ff',
  current: '#ffb000',
  path: '#00e676',
  pivot: '#ff79c6',
  match: '#00e5ff',
  mismatch: '#ff5555',
};

/** 特殊格子颜色 */
const WALL_COLOR = '#0a0e0a';
const EMPTY_COLOR = '#0d130d';
const START_COLOR = '#33ff66';
const TARGET_COLOR = '#ff5555';

export const GridRenderer: Renderer<Snapshot> = {
  draw(ctx: CanvasRenderingContext2D, snap: Snapshot, opts: DrawOpts): void {
    const { canvasWidth, canvasHeight } = opts;
    const { data, states, cols, start, target } = snap;

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!cols || data.length === 0) return;

    const rows = Math.ceil(data.length / cols);
    const cellGap = 2;
    const paddingX = 20;
    const paddingY = 20;
    const availableWidth = canvasWidth - paddingX * 2;
    const availableHeight = canvasHeight - paddingY * 2;
    const cellSize = Math.max(
      8,
      Math.min(
        (availableWidth - cellGap * (cols - 1)) / cols,
        (availableHeight - cellGap * (rows - 1)) / rows,
      ),
    );

    const startX = paddingX + (availableWidth - (cellSize * cols + cellGap * (cols - 1))) / 2;
    const startY = paddingY + (availableHeight - (cellSize * rows + cellGap * (rows - 1))) / 2;

    // 绘制网格
    for (let i = 0; i < data.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (cellSize + cellGap);
      const y = startY + row * (cellSize + cellGap);
      const state: ElementState = states[i] ?? 'default';

      // 确定格子颜色
      let color: string;
      if (data[i] === -1) {
        // 墙
        color = WALL_COLOR;
      } else if (start && row === start[0] && col === start[1]) {
        // 起点
        color = START_COLOR;
      } else if (target && row === target[0] && col === target[1]) {
        // 终点
        color = TARGET_COLOR;
      } else if (state === 'path') {
        // 最短路径
        color = STATE_COLORS.path;
      } else if (state === 'current') {
        // 当前前沿
        color = STATE_COLORS.current;
      } else if (state === 'visit') {
        // 已访问
        color = STATE_COLORS.visit;
      } else if (state === 'compare') {
        // 正在探索
        color = STATE_COLORS.compare;
      } else {
        // 默认空格
        color = EMPTY_COLOR;
      }

      // 绘制格子
      ctx.fillStyle = color;

      // 辉光效果（路径和当前节点）
      if (state === 'path' || state === 'current' || state === 'compare') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(x, y, cellSize, cellSize);

      // 起终点标记
      if (start && row === start[0] && col === start[1]) {
        ctx.fillStyle = '#0d130d';
        ctx.font = `bold ${Math.max(10, cellSize * 0.5)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', x + cellSize / 2, y + cellSize / 2);
      } else if (target && row === target[0] && col === target[1]) {
        ctx.fillStyle = '#0d130d';
        ctx.font = `bold ${Math.max(10, cellSize * 0.5)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('T', x + cellSize / 2, y + cellSize / 2);
      }
    }

    ctx.shadowBlur = 0;
  },
};
