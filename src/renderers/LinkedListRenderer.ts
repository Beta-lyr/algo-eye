// ============================================================
// LinkedListRenderer — 链表渲染器
// 横向节点 + 箭头连线
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

/** 节点尺寸 */
const NODE_WIDTH = 80;
const NODE_HEIGHT = 40;
const NODE_GAP = 30;

/** 链表节点 */
interface LinkedListNode {
  id: number;
  value: number;
  next: LinkedListNode | null;
}

/**
 * 绘制箭头
 */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
): void {
  const headLen = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 箭头
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle - Math.PI / 6),
    toY - headLen * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    toX - headLen * Math.cos(angle + Math.PI / 6),
    toY - headLen * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export const LinkedListRenderer: Renderer<Snapshot> = {
  draw(ctx: CanvasRenderingContext2D, snap: Snapshot, opts): void {
    const { canvasWidth, canvasHeight } = opts;
    const { linkedList, nodeStates = {} } = snap;

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

    if (!linkedList) return;

    // 收集所有节点
    const nodes: LinkedListNode[] = [];
    let current: LinkedListNode | null = linkedList as LinkedListNode;
    while (current) {
      nodes.push(current);
      current = current.next;
    }

    if (nodes.length === 0) return;

    // 计算布局
    const totalWidth = nodes.length * (NODE_WIDTH + NODE_GAP) - NODE_GAP;
    const startX = Math.max(20, (canvasWidth - totalWidth) / 2);
    const startY = canvasHeight / 2 - NODE_HEIGHT / 2;

    // 绘制标题
    ctx.fillStyle = '#5cb574';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Linked List', 20, 25);

    // 绘制 head 指针
    ctx.fillStyle = '#ffb000';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('head', startX + NODE_WIDTH / 2, startY - 15);

    // 绘制节点和连线
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const x = startX + i * (NODE_WIDTH + NODE_GAP);
      const y = startY;
      const state: ElementState = nodeStates[node.id] ?? 'default';
      const color = STATE_COLORS[state] ?? STATE_COLORS.default;

      // 绘制连线到下一个节点
      if (node.next) {
        const nextX = x + NODE_WIDTH + NODE_GAP;
        const nextY = y + NODE_HEIGHT / 2;
        drawArrow(ctx, x + NODE_WIDTH, y + NODE_HEIGHT / 2, nextX, nextY, '#2f4a2f');
      }

      // 节点背景
      ctx.fillStyle = '#0d130d';
      ctx.fillRect(x, y, NODE_WIDTH, NODE_HEIGHT);

      // 节点边框
      ctx.strokeStyle = color;
      ctx.lineWidth = state === 'default' ? 1 : 2;

      // 辉光效果
      if (state !== 'default') {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
      }

      ctx.strokeRect(x, y, NODE_WIDTH, NODE_HEIGHT);
      ctx.shadowBlur = 0;

      // 节点值
      ctx.fillStyle = color;
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(node.value), x + NODE_WIDTH / 2, y + NODE_HEIGHT / 2);

      // 下标
      ctx.fillStyle = '#2e5e3e';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`[${i}]`, x + NODE_WIDTH / 2, y + NODE_HEIGHT + 15);
    }

    // 绘制 null
    const nullX = startX + nodes.length * (NODE_WIDTH + NODE_GAP);
    ctx.fillStyle = '#2e5e3e';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('null', nullX + 20, startY + NODE_HEIGHT / 2);

    // 绘制箭头到 null
    if (nodes.length > 0) {
      const lastX = startX + (nodes.length - 1) * (NODE_WIDTH + NODE_GAP) + NODE_WIDTH;
      drawArrow(ctx, lastX, startY + NODE_HEIGHT / 2, nullX, startY + NODE_HEIGHT / 2, '#2f4a2f');
    }

    // 图例
    const legendY = canvasHeight - 30;
    const legendItems = [
      { color: STATE_COLORS.default, label: 'Default' },
      { color: STATE_COLORS.compare, label: 'Comparing' },
      { color: STATE_COLORS.current, label: 'Current' },
      { color: STATE_COLORS.path, label: 'Found' },
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
