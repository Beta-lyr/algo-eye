// ============================================================
// TreeRenderer — 二叉树渲染器
// 递归布局（中序定位 x，层定位 y），节点圆 + 连线
// 纯函数：同一 snapshot 永远画同一帧
// ============================================================

import type { Renderer } from './Renderer';
import type { DrawOpts } from './Renderer';
import type { Snapshot, TreeNode, ElementState } from '../engine/types';

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

/** 节点半径 */
const NODE_RADIUS = 22;
/** 垂直间距 */
const LEVEL_HEIGHT = 70;

/**
 * 计算树的宽度（用于布局）
 */
function getTreeWidth(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + getTreeWidth(node.left) + getTreeWidth(node.right);
}

/**
 * 递归绘制树节点
 */
function drawNode(
  ctx: CanvasRenderingContext2D,
  node: TreeNode | null,
  x: number,
  y: number,
  availableWidth: number,
  nodeStates: Record<number, ElementState>,
): void {
  if (!node) return;

  const leftWidth = getTreeWidth(node.left);
  const state: ElementState = nodeStates[node.id] ?? 'default';
  const color = STATE_COLORS[state] ?? STATE_COLORS.default;

  // 计算子节点位置
  const leftX = x - availableWidth / 2 + leftWidth * (availableWidth / (leftWidth + getTreeWidth(node.right) + 1 || 1));
  const rightX = x + availableWidth / 2 - getTreeWidth(node.right) * (availableWidth / (leftWidth + getTreeWidth(node.right) + 1 || 1));
  const childY = y + LEVEL_HEIGHT;

  // 绘制连线到左子节点
  if (node.left) {
    ctx.beginPath();
    ctx.moveTo(x, y + NODE_RADIUS);
    ctx.lineTo(leftX, childY - NODE_RADIUS);
    ctx.strokeStyle = '#2f4a2f';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 绘制连线到右子节点
  if (node.right) {
    ctx.beginPath();
    ctx.moveTo(x, y + NODE_RADIUS);
    ctx.lineTo(rightX, childY - NODE_RADIUS);
    ctx.strokeStyle = '#2f4a2f';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 递归绘制子树
  drawNode(ctx, node.left, leftX, childY, availableWidth / 2, nodeStates);
  drawNode(ctx, node.right, rightX, childY, availableWidth / 2, nodeStates);

  // 绘制节点圆圈
  ctx.beginPath();
  ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#0d130d';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // 辉光效果
  ctx.shadowBlur = 12;
  ctx.shadowColor = color;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 绘制节点值
  ctx.fillStyle = color;
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(node.value), x, y);
}

export const TreeRenderer: Renderer<Snapshot> = {
  draw(ctx: CanvasRenderingContext2D, snap: Snapshot, opts: DrawOpts): void {
    const { canvasWidth, canvasHeight } = opts;
    const { tree, nodeStates = {} } = snap;

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!tree) return;

    // 从顶部居中开始绘制
    const startX = canvasWidth / 2;
    const startY = 40;
    const availableWidth = canvasWidth - 80;

    drawNode(ctx, tree, startX, startY, availableWidth, nodeStates);
  },
};
