// ============================================================
// AnimationController — 动画时钟
// 用 requestAnimationFrame + 累积时间驱动步骤推进
// 调速 = 改变 interval；暂停 = 停止 RAF 循环
// ============================================================

export class AnimationController {
  /** RAF 句柄 */
  private rafId: number | null = null;
  /** 上一帧时间戳 */
  private lastTime = 0;
  /** 累积时间（ms） */
  private accumulated = 0;
  /** 基准间隔：1x 速度时每步耗时（ms） */
  private readonly baseInterval = 500;
  /** 当前速度倍数 */
  private speed = 4;
  /** 每步回调 */
  private callback: (() => void) | null = null;
  /** 是否正在运行 */
  private _running = false;

  get running(): boolean {
    return this._running;
  }

  /** 设置速度（1–10） */
  setSpeed(speed: number): void {
    this.speed = Math.max(1, Math.min(10, speed));
  }

  /** 设置每步触发回调 */
  onTick(cb: () => void): void {
    this.callback = cb;
  }

  /** 开始播放 */
  play(): void {
    if (this._running) return;
    this._running = true;
    this.lastTime = performance.now();
    this.accumulated = 0;
    this.scheduleFrame();
  }

  /** 暂停 */
  pause(): void {
    this._running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** 停止并重置累积时间 */
  stop(): void {
    this.pause();
    this.accumulated = 0;
  }

  /** RAF 循环 */
  private scheduleFrame(): void {
    this.rafId = requestAnimationFrame(this.tick);
  }

  /** 每帧回调 */
  private tick = (): void => {
    if (!this._running) return;

    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    // 防止切标签页后的大跳跃（最多 1 秒）
    const clampedDt = Math.min(dt, 1000);
    this.accumulated += clampedDt;

    const interval = this.baseInterval / this.speed;

    // 一帧可能推进多步（高速时）
    while (this.accumulated >= interval) {
      this.accumulated -= interval;
      this.callback?.();
    }

    this.scheduleFrame();
  };
}
