// ============================================================
// StringRenderer — 字符串匹配渲染器
// 渲染文本和模式，高亮匹配位置
// ============================================================

import type { Renderer } from './Renderer';
import type { Snapshot } from '../engine/types';

const COLORS: Record<string, string> = {
  default: '#33ff66',
  compare: '#ffb000',
  swap: '#ff5555',
  sorted: '#00e5ff',
  visit: '#b388ff',
  current: '#ffb000',
  path: '#33ff66',
  pivot: '#ff79c6',
  match: '#00e5ff',
  mismatch: '#ff5555',
};

export const StringRenderer: Renderer<Snapshot> = {
  draw(ctx, snap, opts) {
    const { canvasWidth, canvasHeight } = opts;
    const { text = '', pattern = '', textStates = {}, patternStates = {} } = snap;

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

    if (!text && !pattern) return;

    const cellSize = Math.min(40, (canvasWidth - 80) / Math.max(text.length, pattern.length, 1));
    const startX = 40;
    const textY = canvasHeight * 0.35;
    const patternY = canvasHeight * 0.55;

    // 绘制文本标签
    ctx.fillStyle = '#5cb574';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('T:', startX - 8, textY + cellSize * 0.7);
    ctx.fillText('P:', startX - 8, patternY + cellSize * 0.7);

    // 绘制文本
    ctx.textAlign = 'center';
    for (let i = 0; i < text.length; i++) {
      const x = startX + i * cellSize;
      const state = textStates[i] || 'default';
      const color = COLORS[state] || COLORS.default;

      // 背景
      ctx.fillStyle = color + '20';
      ctx.fillRect(x, textY, cellSize - 2, cellSize);

      // 边框
      ctx.strokeStyle = color;
      ctx.lineWidth = state === 'default' ? 1 : 2;
      ctx.strokeRect(x, textY, cellSize - 2, cellSize);

      // 辉光
      if (state !== 'default') {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
      }

      // 字符
      ctx.fillStyle = color;
      ctx.font = `${cellSize * 0.6}px "JetBrains Mono", monospace`;
      ctx.fillText(text[i], x + cellSize / 2 - 1, textY + cellSize * 0.7);

      ctx.shadowBlur = 0;

      // 下标
      ctx.fillStyle = '#2e5e3e';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(i.toString(), x + cellSize / 2 - 1, textY + cellSize + 14);
    }

    // 绘制模式
    for (let i = 0; i < pattern.length; i++) {
      const x = startX + i * cellSize;
      const state = patternStates[i] || 'default';
      const color = COLORS[state] || COLORS.default;

      // 背景
      ctx.fillStyle = color + '20';
      ctx.fillRect(x, patternY, cellSize - 2, cellSize);

      // 边框
      ctx.strokeStyle = color;
      ctx.lineWidth = state === 'default' ? 1 : 2;
      ctx.strokeRect(x, patternY, cellSize - 2, cellSize);

      // 辉光
      if (state !== 'default') {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
      }

      // 字符
      ctx.fillStyle = color;
      ctx.font = `${cellSize * 0.6}px "JetBrains Mono", monospace`;
      ctx.fillText(pattern[i], x + cellSize / 2 - 1, patternY + cellSize * 0.7);

      ctx.shadowBlur = 0;

      // 下标
      ctx.fillStyle = '#2e5e3e';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(i.toString(), x + cellSize / 2 - 1, patternY + cellSize + 14);
    }

    // 图例
    const legendY = canvasHeight - 30;
    const legendItems = [
      { color: COLORS.default, label: 'Default' },
      { color: COLORS.compare, label: 'Comparing' },
      { color: COLORS.path, label: 'Match' },
      { color: COLORS.swap, label: 'Mismatch' },
    ];

    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    let legendX = startX;

    for (const item of legendItems) {
      // 色块
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, legendY, 10, 10);

      // 标签
      ctx.fillStyle = '#5cb574';
      ctx.fillText(item.label, legendX + 14, legendY + 9);

      legendX += ctx.measureText(item.label).width + 30;
    }
  },
};
