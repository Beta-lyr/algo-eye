// ============================================================
// StepPlayer — 步骤回放器
// 持 steps[] + stepIndex，支持：
//   播放/暂停、单步前进/后退、跳转、重置
// 通过 AnimationController 驱动自动播放
// ============================================================

import type { Step } from './types';
import { AnimationController } from './AnimationController';

export type StepCallback = (step: Step, index: number) => void;

export class StepPlayer {
  /** 全部步骤 */
  private steps: Step[] = [];
  /** 当前步骤下标 */
  private index = 0;
  /** 动画时钟 */
  private controller: AnimationController;
  /** 步骤变更回调 */
  private onStepCallback: StepCallback | null = null;

  constructor() {
    this.controller = new AnimationController();
    this.controller.onTick(() => this.stepForward());
  }

  // ========== 步骤操作 ==========

  /** 加载新步骤序列并回到第 0 步 */
  reset(steps: Step[]): void {
    this.controller.pause();
    this.steps = steps;
    this.index = 0;
    this.emit();
  }

  /** 前进一步（手动或时钟驱动） */
  stepForward(): boolean {
    if (this.index < this.steps.length - 1) {
      this.index++;
      this.emit();
      // 到达末尾自动暂停
      if (this.index >= this.steps.length - 1) {
        this.controller.pause();
      }
      return true;
    }
    return false;
  }

  /** 后退一步 */
  stepBack(): boolean {
    if (this.index > 0) {
      this.index--;
      this.emit();
      return true;
    }
    return false;
  }

  /** 跳转到指定步骤 */
  seek(index: number): void {
    if (index >= 0 && index < this.steps.length) {
      this.index = index;
      this.emit();
    }
  }

  // ========== 播放控制 ==========

  /** 开始 / 恢复播放 */
  play(): void {
    if (this.isAtEnd) {
      // 已到末尾，从头开始
      this.index = 0;
      this.emit();
    }
    this.controller.play();
  }

  /** 暂停 */
  pause(): void {
    this.controller.pause();
  }

  /** 停止并回到开头 */
  stop(): void {
    this.controller.stop();
    this.index = 0;
    this.emit();
  }

  // ========== 状态查询 ==========

  get currentStep(): Step {
    return this.steps[this.index];
  }

  get currentIndex(): number {
    return this.index;
  }

  get totalSteps(): number {
    return this.steps.length;
  }

  get isAtEnd(): boolean {
    return this.steps.length === 0 || this.index >= this.steps.length - 1;
  }

  get isAtStart(): boolean {
    return this.index === 0;
  }

  get playing(): boolean {
    return this.controller.running;
  }

  /** 设置播放速度（1–10） */
  setSpeed(speed: number): void {
    this.controller.setSpeed(speed);
  }

  // ========== 回调 ==========

  /** 注册步骤变更回调（驱动 CodePanel / StatsPanel） */
  onStep(cb: StepCallback): void {
    this.onStepCallback = cb;
  }

  // ========== 内部 ==========

  private emit(): void {
    if (this.steps.length > 0 && this.index < this.steps.length) {
      this.onStepCallback?.(this.steps[this.index], this.index);
    }
  }
}
