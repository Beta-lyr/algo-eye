// ============================================================
// Controls — 底栏控制栏（组合子组件）
// 职责：协调引擎时钟 + 键盘快捷键，子组件负责展示
// ============================================================

import { useState, useCallback } from 'react';
import { useVizStore } from '../store/useVizStore';
import { useT } from '../i18n';
import { usePlaybackClock, useKeyboardShortcuts } from '../hooks';
import { BookmarkBar } from './controls/BookmarkBar';
import { PlaybackControls } from './controls/PlaybackControls';
import { DataControls } from './controls/DataControls';
import { CompareToggle, CompareProgress } from './controls/CompareControls';
import { ChallengeControls } from './controls/ChallengeControls';
import { MetaControls } from './controls/MetaControls';

export function Controls() {
  const steps = useVizStore((s) => s.steps);
  const stepIndex = useVizStore((s) => s.stepIndex);
  const playing = useVizStore((s) => s.playing);
  const setStepIndex = useVizStore((s) => s.setStepIndex);
  const setPlaying = useVizStore((s) => s.setPlaying);
  const manualMode = useVizStore((s) => s.manualMode);
  const toggleManualMode = useVizStore((s) => s.toggleManualMode);
  const compareMode = useVizStore((s) => s.compareMode);
  const syncCompareStep = useVizStore((s) => s.syncCompareStep);
  const toggleFocusMode = useVizStore((s) => s.toggleFocusMode);
  const t = useT();

  const [showShortcuts, setShowShortcuts] = useState(false);

  const { stop, controllerRef } = usePlaybackClock();

  const togglePlay = useCallback(() => {
    const ctrl = controllerRef.current;
    if (!ctrl || steps.length === 0) return;
    if (playing) {
      ctrl.pause();
      setPlaying(false);
    } else {
      if (manualMode) toggleManualMode();
      if (stepIndex >= steps.length - 1) setStepIndex(0);
      ctrl.play();
      setPlaying(true);
    }
  }, [playing, steps, stepIndex, setStepIndex, setPlaying, manualMode, toggleManualMode, controllerRef]);

  const stepForward = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      if (compareMode) syncCompareStep();
    }
  }, [stepIndex, steps.length, setStepIndex, compareMode, syncCompareStep]);

  const stepBack = useCallback(() => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }, [stepIndex, setStepIndex]);

  useKeyboardShortcuts({
    togglePlay,
    stepBack,
    stepForward,
    toggleFocusMode,
    toggleShortcuts: () => setShowShortcuts((v) => !v),
  });

  const handleReset = useCallback(() => {
    stop();
    setPlaying(false);
    useVizStore.getState().reset();
  }, [stop, setPlaying]);

  return (
    <footer className="controls-wrap">
      <BookmarkBar />

      <div className="controls">
        <CompareToggle />

        <ChallengeControls />

        <PlaybackControls togglePlay={togglePlay} stepForward={stepForward} stepBack={stepBack} />

        <DataControls />

        <CompareProgress />

        <MetaControls showShortcuts={showShortcuts} setShowShortcuts={setShowShortcuts} />

        <button className="btn" onClick={handleReset}>
          {t.controls.reset}
        </button>
      </div>
    </footer>
  );
}
