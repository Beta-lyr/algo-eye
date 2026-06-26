// ============================================================
// Controls — 底栏控制栏
// 播放/暂停/单步/速度/数据量/随机/重置
// store 是唯一状态源，AnimationController 仅负责播放时钟
// ============================================================

import { useRef, useCallback, useEffect, useState } from 'react';
import { useVizStore } from '../store/useVizStore';
import { AnimationController } from '../engine/AnimationController';

export function Controls() {
  const steps = useVizStore((s) => s.steps);
  const stepIndex = useVizStore((s) => s.stepIndex);
  const playing = useVizStore((s) => s.playing);
  const speed = useVizStore((s) => s.speed);
  const data = useVizStore((s) => s.data);

  const setStepIndex = useVizStore((s) => s.setStepIndex);
  const setPlaying = useVizStore((s) => s.setPlaying);
  const setSpeed = useVizStore((s) => s.setSpeed);
  const setData = useVizStore((s) => s.setData);
  const randomizeData = useVizStore((s) => s.randomizeData);
  const reset = useVizStore((s) => s.reset);

  // AnimationController ref — 仅用于播放时钟
  const controllerRef = useRef<AnimationController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = new AnimationController();
  }

  // 同步速度
  useEffect(() => {
    controllerRef.current?.setSpeed(speed);
  }, [speed]);

  // 设置时钟回调：每一步推进 stepIndex
  useEffect(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;

    ctrl.onTick(() => {
      // 使用 useVizStore.getState() 获取最新状态
      const state = useVizStore.getState();
      if (state.stepIndex < state.steps.length - 1) {
        state.setStepIndex(state.stepIndex + 1);
      } else {
        // 到达末尾，停止播放
        ctrl.pause();
        state.setPlaying(false);
      }
    });

    return () => {
      ctrl.onTick(() => {});
    };
  }, []);

  // 当 steps 变化时（算法/数据切换），停止播放并重置
  // 通过比较 steps 引用来判断
  const stepsRef = useRef(steps);
  useEffect(() => {
    if (stepsRef.current !== steps) {
      stepsRef.current = steps;
      controllerRef.current?.stop();
    }
  }, [steps]);

  // 播放/暂停
  const togglePlay = useCallback(() => {
    const ctrl = controllerRef.current;
    if (!ctrl || steps.length === 0) return;

    if (playing) {
      ctrl.pause();
      setPlaying(false);
    } else {
      // 如果在末尾，从头开始
      if (stepIndex >= steps.length - 1) {
        setStepIndex(0);
      }
      ctrl.play();
      setPlaying(true);
    }
  }, [playing, steps, stepIndex, setPlaying, setStepIndex]);

  // 单步前进
  const stepForward = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }, [stepIndex, steps.length, setStepIndex]);

  // 单步后退
  const stepBack = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  }, [stepIndex, setStepIndex]);

  // 重置
  const handleReset = useCallback(() => {
    controllerRef.current?.stop();
    setPlaying(false);
    reset();
  }, [reset, setPlaying]);

  // 随机数据
  const handleRandom = useCallback(() => {
    controllerRef.current?.stop();
    setPlaying(false);
    randomizeData(data.length);
  }, [randomizeData, data.length, setPlaying]);

  // 速度变更
  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSpeed(Number(e.target.value));
    },
    [setSpeed],
  );

  // 数据量变更
  const handleCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (val >= 4 && val <= 64) {
        controllerRef.current?.stop();
        setPlaying(false);
        randomizeData(val);
      }
    },
    [randomizeData, setPlaying],
  );

  // 自定义数据输入
  const [customInput, setCustomInput] = useState('');
  const handleCustomData = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      const raw = customInput.trim();
      if (!raw) return;

      const parts = raw.split(/[,\s]+/);
      const nums = parts.map(Number).filter((n) => !isNaN(n));

      if (nums.length >= 4 && nums.length <= 64) {
        controllerRef.current?.stop();
        setPlaying(false);
        setData(nums);
        setCustomInput('');
      }
    },
    [customInput, setData, setPlaying],
  );

  const disabled = steps.length === 0;
  const isAtEnd = stepIndex >= steps.length - 1;
  const isAtStart = stepIndex === 0;

  return (
    <footer className="controls">
      {/* 播放控制 */}
      <div className="ctrl-group">
        <button
          className="btn"
          disabled={disabled || isAtStart}
          onClick={stepBack}
          title="上一步"
        >
          ⏮
        </button>
        <button
          className="btn primary"
          disabled={disabled}
          onClick={togglePlay}
          title={playing ? '暂停' : '播放'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <button
          className="btn"
          disabled={disabled || isAtEnd}
          onClick={stepForward}
          title="下一步"
        >
          ⏭
        </button>
      </div>

      {/* 速度 */}
      <div className="speed">
        <label>速度</label>
        <input
          type="range"
          min={1}
          max={10}
          value={speed}
          onChange={handleSpeedChange}
        />
        <span className="val">{speed}×</span>
      </div>

      {/* 数据量 */}
      <div className="ctrl-group">
        <label>数据量</label>
        <input
          className="num-input"
          type="number"
          value={data.length}
          min={4}
          max={64}
          onChange={handleCountChange}
        />
      </div>

      {/* 随机数据 */}
      <button className="btn" onClick={handleRandom}>
        随机数据
      </button>

      {/* 自定义数据 */}
      <input
        className="data-input"
        placeholder={`自定义数据: ${data.join(',')} (回车应用)`}
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        onKeyDown={handleCustomData}
      />

      <div className="spacer" />

      {/* 重置 */}
      <button className="btn" onClick={handleReset}>
        重置
      </button>
    </footer>
  );
}
