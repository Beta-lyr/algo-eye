// ============================================================
// 渲染器层核心接口 — Renderer / DrawOpts
// 渲染器是纯函数：同一 snapshot 永远画同一帧
// ============================================================

import type { Snapshot } from '../engine/types';

/** 绘制参数 */
export interface DrawOpts {
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * 渲染器接口
 * 每种数据形态实现一个 Renderer：
 *   array  → ArrayRenderer（柱状图）
 *   grid   → GridRenderer（网格）
 *   tree   → TreeRenderer（树节点）
 *   graph  → GraphRenderer（图节点+边）
 *
 * draw 必须是纯函数：不改状态，同一 snapshot 永远画出同一帧
 */
export interface Renderer<TSnapshot extends Snapshot = Snapshot> {
  /** 在 canvas 上绘制给定 snapshot */
  draw(ctx: CanvasRenderingContext2D, snap: TSnapshot, opts: DrawOpts): void;
}
