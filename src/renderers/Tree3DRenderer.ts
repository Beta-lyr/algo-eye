// ============================================================
// 3D 树渲染器 — 使用 Canvas 2D 模拟等距 3D 树视图
// 无需 Three.js 依赖，保留 CRT 终端风格
// ============================================================

import type { Renderer, DrawOpts } from './Renderer';
import type { Snapshot, TreeNode, ElementState } from '../engine/types';

const COLOR: Record<string, string> = {
  default: '#33ff66',
  comparing: '#ffb000',
  current: '#33ff66',
  visited: '#b388ff',
  swapping: '#ff5555',
  sorted: '#00e676',
  path: '#00e676',
};

function drawNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
  state: ElementState,
  depth: number,
) {
  const r = 18 + Math.max(0, 3 - depth);
  const col = COLOR[state] ?? COLOR.default;

  // Shadow for depth effect
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 2, r, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  // Node body (3D cylinder)
  const grad = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.15, col);
  grad.addColorStop(0.85, col);
  grad.addColorStop(1, '#000000');
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Glow for active states
  if (state === 'current' || state === 'comparing') {
    ctx.shadowColor = col;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Value label
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), x, y - 1);
}

function drawEdge(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  col: string,
) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 + 6;

  ctx.beginPath();
  ctx.moveTo(x1, y1 + 12);
  ctx.quadraticCurveTo(midX, midY, x2, y2 - 10);
  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function calcLayout(
  node: TreeNode,
  x: number,
  y: number,
  xSpan: number,
  yGap: number,
  depth: number,
  layout: Map<number, { x: number; y: number; depth: number }>,
): void {
  layout.set(node.id, { x, y, depth });
  const children = node.children ?? [];
  if (children.length === 0) return;

  const childYGap = yGap;
  const childXSpan = xSpan / children.length;

  for (let i = 0; i < children.length; i++) {
    const cx = x - xSpan / 2 + childXSpan * (i + 0.5);
    calcLayout(children[i], cx, y + childYGap, childXSpan * 0.8, yGap, depth + 1, layout);
  }
}

export const Tree3DRenderer: Renderer<Snapshot> = {
  draw(ctx: CanvasRenderingContext2D, snap: Snapshot, opts: DrawOpts): void {
    const tree = snap.tree;
    if (!tree) return;

    ctx.fillStyle = '#0a0e0a';
    ctx.fillRect(0, 0, opts.canvasWidth, opts.canvasHeight);

    const layout = new Map<number, { x: number; y: number; depth: number }>();
    calcLayout(tree, opts.canvasWidth / 2, 50, opts.canvasWidth * 0.7, 70, 0, layout);

    // Draw edges
    function drawEdges(node: TreeNode) {
      const parent = layout.get(node.id);
      if (!parent) return;
      for (const child of node.children ?? []) {
        const childPos = layout.get(child.id);
        if (childPos) {
          const col = COLOR[snap.nodeStates?.[child.id] ?? 'default'] ?? COLOR.default;
          drawEdge(ctx, parent.x, parent.y, childPos.x, childPos.y, col);
        }
        drawEdges(child);
      }
    }
    drawEdges(tree);

    // Draw nodes
    for (const [id, pos] of layout) {
      const node = findNode(tree, id);
      if (!node) continue;
      const state = snap.nodeStates?.[id] ?? 'default';
      drawNode(ctx, pos.x, pos.y, node.value, state, pos.depth);
    }
  },
};

function findNode(root: TreeNode, id: number): TreeNode | undefined {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return undefined;
}
