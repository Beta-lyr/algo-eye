import { useRef, useEffect } from 'react';
import { useVizStore } from '../store/useVizStore';
import { AnimationController } from '../engine/AnimationController';

export function usePlaybackClock() {
  const speed = useVizStore((s) => s.speed);
  const controllerRef = useRef<AnimationController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new AnimationController();
  }

  useEffect(() => {
    controllerRef.current?.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;

    ctrl.onTick(() => {
      const state = useVizStore.getState();
      if (state.stepIndex < state.steps.length - 1) {
        state.setStepIndex(state.stepIndex + 1);
        if (state.compareMode) state.syncCompareStep();
      } else {
        ctrl.pause();
        state.setPlaying(false);
      }
    });

    return () => { ctrl.onTick(() => {}); };
  }, []);

  // 监听 steps 变化，算法切换时停止
  const steps = useVizStore((s) => s.steps);
  const stepsRef = useRef(steps);
  useEffect(() => {
    if (stepsRef.current !== steps) {
      stepsRef.current = steps;
      controllerRef.current?.stop();
    }
  }, [steps]);

  return {
    play: () => controllerRef.current?.play(),
    pause: () => controllerRef.current?.pause(),
    stop: () => controllerRef.current?.stop(),
    controllerRef,
  };
}
