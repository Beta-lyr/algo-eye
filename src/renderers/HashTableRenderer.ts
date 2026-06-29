// ============================================================
// HashTableRenderer — 哈希表渲染器
// 桶数组 + 链表可视化（拉链法解决冲突）
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

/** 哈希桶节点 */
interface HashNode {
  key: number;
  value: number;
  next: HashNode | null;
}

/** 绘制箭头 */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
): void {
  const headLen = 8;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

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

export const HashTableRenderer: Renderer<Snapshot> = {
  draw(ctx: CanvasRenderingContext2D, snap: Snapshot, opts): void {
    const { canvasWidth, canvasHeight } = opts;
    const { hashTable, hashTableStates = {} } = snap;

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

    if (!hashTable || hashTable.length === 0) return;

    // 绘制标题
    ctx.fillStyle = '#5cb574';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Hash Table', 20, 25);

    // 计算布局
    const bucketCount = hashTable.length;
    const bucketHeight = 30;
    const bucketWidth = 60;
    const startX = 40;
    const startY = 50;
    const maxChainLen = 5; // 最大显示的链长度

    // 绘制桶数组
    for (let i = 0; i < bucketCount; i++) {
      const y = startY + i * (bucketHeight + 5);
      const state: ElementState = hashTableStates[i] ?? 'default';
      const color = STATE_COLORS[state] ?? STATE_COLORS.default;

      // 桶索引
      ctx.fillStyle = '#2e5e3e';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`[${i}]`, startX - 5, y + bucketHeight / 2 + 4);

      // 桶背景
      ctx.fillStyle = '#0d130d';
      ctx.fillRect(startX, y, bucketWidth, bucketHeight);

      // 桶边框
      ctx.strokeStyle = color;
      ctx.lineWidth = state === 'default' ? 1 : 2;

      if (state !== 'default') {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
      }

      ctx.strokeRect(startX, y, bucketWidth, bucketHeight);
      ctx.shadowBlur = 0;

      // 桶内容
      const bucket: HashNode | null = hashTable[i];
      if (bucket) {
        // 绘制链表
        let current: HashNode | null = bucket;
        let nodeX = startX + bucketWidth + 10;

        // 第一个节点在桶内
        ctx.fillStyle = color;
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${current.key}`, startX + bucketWidth / 2, y + bucketHeight / 2 + 4);

        // 绘制链表后续节点
        current = current.next;
        let chainLen = 0;
        while (current && chainLen < maxChainLen) {
          const nodeState: ElementState = hashTableStates[`${i}-${chainLen + 1}`] ?? 'default';
          const nodeColor = STATE_COLORS[nodeState] ?? STATE_COLORS.default;

          // 绘制箭头
          drawArrow(ctx, nodeX - 10, y + bucketHeight / 2, nodeX, y + bucketHeight / 2, '#2f4a2f');

          // 节点背景
          ctx.fillStyle = '#0d130d';
          ctx.fillRect(nodeX, y, 50, bucketHeight);

          // 节点边框
          ctx.strokeStyle = nodeColor;
          ctx.lineWidth = nodeState === 'default' ? 1 : 2;

          if (nodeState !== 'default') {
            ctx.shadowColor = nodeColor;
            ctx.shadowBlur = 8;
          }

          ctx.strokeRect(nodeX, y, 50, bucketHeight);
          ctx.shadowBlur = 0;

          // 节点值
          ctx.fillStyle = nodeColor;
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${current.key}`, nodeX + 25, y + bucketHeight / 2 + 4);

          current = current.next;
          nodeX += 60;
          chainLen++;
        }

        if (current) {
          ctx.fillStyle = '#2e5e3e';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('...', nodeX, y + bucketHeight / 2 + 4);
        }
      } else {
        // 空桶
        ctx.fillStyle = '#2e5e3e';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('null', startX + bucketWidth / 2, y + bucketHeight / 2 + 4);
      }
    }

    // 图例
    const legendY = canvasHeight - 30;
    const legendItems = [
      { color: STATE_COLORS.default, label: 'Default' },
      { color: STATE_COLORS.compare, label: 'Searching' },
      { color: STATE_COLORS.path, label: 'Found' },
      { color: STATE_COLORS.swap, label: 'Collision' },
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
