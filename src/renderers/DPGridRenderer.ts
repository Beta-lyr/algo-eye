// ============================================================
// DPGridRenderer — 动态规划表格渲染器
// 二维表格单元格高亮
// ============================================================

import type { Renderer } from './Renderer';
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
};

export const DPGridRenderer: Renderer<Snapshot> = {
  draw(ctx: CanvasRenderingContext2D, snap: Snapshot, opts): void {
    const { canvasWidth, canvasHeight } = opts;
    const { dpGrid, dpGridStates = {}, dpLabels = {} } = snap;

    // 清空画布
    ctx.fillStyle = '#0a0e0a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制网格背景
    ctx.strokeStyle = 'rgba(51, 255, 102, 0.06)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    if (!dpGrid || dpGrid.length === 0) return;

    const rows = dpGrid.length;
    const cols = dpGrid[0]?.length ?? 0;
    if (rows === 0 || cols === 0) return;

    // 计算单元格大小
    const cellSize = Math.min(
      50,
      (canvasWidth - 120) / (cols + 1),
      (canvasHeight - 120) / (rows + 1),
    );
    const startX = 80;
    const startY = 60;

    // 绘制标题
    ctx.fillStyle = '#5cb574';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DP Table', 20, 25);

    // 绘制列标题（j）
    ctx.fillStyle = '#2e5e3e';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (let j = 0; j < cols; j++) {
      const x = startX + (j + 1) * cellSize + cellSize / 2;
      ctx.fillText(dpLabels[`col-${j}`] ?? `${j}`, x, startY - 5);
    }

    // 绘制行标题（i）
    ctx.textAlign = 'right';
    for (let i = 0; i < rows; i++) {
      const y = startY + (i + 1) * cellSize + cellSize / 2 + 4;
      ctx.fillText(dpLabels[`row-${i}`] ?? `${i}`, startX - 5, y);
    }

    // 绘制表格
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = startX + (j + 1) * cellSize;
        const y = startY + (i + 1) * cellSize;
        const key = `${i}-${j}`;
        const state: ElementState = dpGridStates[key] ?? 'default';
        const color = STATE_COLORS[state] ?? STATE_COLORS.default;
        const value = dpGrid[i][j];

        // 单元格背景
        if (state !== 'default') {
          ctx.fillStyle = color + '20';
          ctx.fillRect(x, y, cellSize, cellSize);
        }

        // 单元格边框
        ctx.strokeStyle = color;
        ctx.lineWidth = state === 'default' ? 1 : 2;

        if (state !== 'default') {
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
        }

        ctx.strokeRect(x, y, cellSize, cellSize);
        ctx.shadowBlur = 0;

        // 单元格值
        ctx.fillStyle = color;
        ctx.font = `${Math.min(14, cellSize * 0.4)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          value !== undefined && value !== null ? String(value) : '-',
          x + cellSize / 2,
          y + cellSize / 2,
        );
      }
    }

    // 图例
    const legendY = canvasHeight - 30;
    const legendItems = [
      { color: STATE_COLORS.default, label: 'Unfilled' },
      { color: STATE_COLORS.current, label: 'Current' },
      { color: STATE_COLORS.compare, label: 'Comparing' },
      { color: STATE_COLORS.path, label: 'Result' },
    ];

    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    let legendX = 20;

    for (const item of legendItems) {
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, legendY, 10, 10);
      ctx.fillStyle = '#5cb574';
      ctx.fillText(item.label, legendX + 14, legendY + 9);
      legendX += ctx.measureText(item.label).width + 30;
    }
  },
};
