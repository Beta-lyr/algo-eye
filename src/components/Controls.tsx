// ============================================================
// Controls — 底栏控制栏
// 播放/暂停/单步/速度/数据量/随机/重置
// store 是唯一状态源，AnimationController 仅负责播放时钟
// 支持对比模式
// ============================================================

import { useRef, useCallback, useEffect, useState } from 'react';
import { useVizStore } from '../store/useVizStore';
import { useT } from '../i18n';
import { AnimationController } from '../engine/AnimationController';

export function Controls() {
  const steps = useVizStore((s) => s.steps);
  const stepIndex = useVizStore((s) => s.stepIndex);
  const playing = useVizStore((s) => s.playing);
  const speed = useVizStore((s) => s.speed);
  const data = useVizStore((s) => s.data);
  const compareMode = useVizStore((s) => s.compareMode);
  const compareSteps = useVizStore((s) => s.compareSteps);
  const compareStepIndex = useVizStore((s) => s.compareStepIndex);

  const setStepIndex = useVizStore((s) => s.setStepIndex);
  const setPlaying = useVizStore((s) => s.setPlaying);
  const setSpeed = useVizStore((s) => s.setSpeed);
  const setData = useVizStore((s) => s.setData);
  const randomizeData = useVizStore((s) => s.randomizeData);
  const reset = useVizStore((s) => s.reset);
  const toggleCompareMode = useVizStore((s) => s.toggleCompareMode);
  const syncCompareStep = useVizStore((s) => s.syncCompareStep);
  const getShareUrl = useVizStore((s) => s.getShareUrl);
  const currentAlgo = useVizStore((s) => s.currentAlgo);
  const manualMode = useVizStore((s) => s.manualMode);
  const toggleManualMode = useVizStore((s) => s.toggleManualMode);

  const bookmarks = useVizStore((s) => s.bookmarks);
  const toggleBookmark = useVizStore((s) => s.toggleBookmark);
  const updateBookmarkComment = useVizStore((s) => s.updateBookmarkComment);
  const exportBookmarks = useVizStore((s) => s.exportBookmarks);

  const t = useT();

  // 进度条相关
  const progressRef = useRef<HTMLDivElement>(null);
  const seekStep = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = progressRef.current;
    if (!el || steps.length === 0) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (steps.length - 1));
    setStepIndex(Math.max(0, Math.min(steps.length - 1, idx)));
  }, [steps.length, setStepIndex]);

  const handleExportBookmarks = useCallback(() => {
    const json = exportBookmarks();
    navigator.clipboard.writeText(json).then(() => {
      /* silently succeed */
    });
  }, [exportBookmarks]);

  // 书签编辑状态
  const [editingBookmark, setEditingBookmark] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

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
      const state = useVizStore.getState();

      // 推进主算法
      if (state.stepIndex < state.steps.length - 1) {
        state.setStepIndex(state.stepIndex + 1);

        // 如果是对比模式，同步推进对比算法
        if (state.compareMode) {
          state.syncCompareStep();
        }
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
      // 退出手动模式
      if (manualMode) toggleManualMode();
      // 如果在末尾，从头开始
      if (stepIndex >= steps.length - 1) {
        setStepIndex(0);
      }
      ctrl.play();
      setPlaying(true);
    }
  }, [playing, steps, stepIndex, setPlaying, setStepIndex, manualMode, toggleManualMode]);

  // 单步前进
  const stepForward = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      if (compareMode) {
        syncCompareStep();
      }
    }
  }, [stepIndex, steps.length, setStepIndex, compareMode, syncCompareStep]);

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

  // 分享链接
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const handleShare = useCallback(() => {
    const url = getShareUrl();
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      });
    }
  }, [getShareUrl]);

  // 截图
  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector('.viz-stage canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `algo-eye-${currentAlgo?.id ?? 'screenshot'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, [currentAlgo]);

  const disabled = steps.length === 0;
  const isAtEnd = stepIndex >= steps.length - 1;
  const isAtStart = stepIndex === 0;

  // 对比模式进度
  const compareProgress = compareMode && compareSteps.length > 0
    ? `${compareStepIndex + 1}/${compareSteps.length}`
    : '';

  const bmEntries = Object.entries(bookmarks)
    .map(([s, c]) => ({ step: Number(s), comment: c }))
    .sort((a, b) => a.step - b.step);

  const pct = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0;

  return (
    <footer className="controls-wrap">
      {/* 进度条 */}
      {steps.length > 1 && (
        <div className="progress-row">
          <div className="progress-bar" ref={progressRef} onClick={seekStep}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
            {Object.keys(bookmarks).length > 0 && (
              <div className="bookmark-marks">
                {bmEntries.map(({ step }) => (
                  <div
                    key={step}
                    className="bm-dot"
                    style={{ left: `${(step / (steps.length - 1)) * 100}%` }}
                    title={`Step ${step + 1}${bookmarks[step] ? ': ' + bookmarks[step] : ''}`}
                  />
                ))}
              </div>
            )}
          </div>
          <span className="progress-label">{stepIndex + 1}/{steps.length}</span>
          <button
            className="btn bm-btn"
            onClick={() => toggleBookmark(stepIndex)}
            title={bookmarks[stepIndex] !== undefined ? '移除书签' : '添加书签'}
            disabled={disabled}
          >
            {bookmarks[stepIndex] !== undefined ? '🔖' : '🏷️'}
          </button>
        </div>
      )}

      {/* 书签列表 */}
      {bmEntries.length > 0 && (
        <div className="bookmark-list">
          {bmEntries.map(({ step, comment }) => (
            <div key={step} className="bm-item">
              <span
                className="bm-step"
                onClick={() => setStepIndex(step)}
              >
                #{step + 1}
              </span>
              {editingBookmark === step ? (
                <input
                  className="bm-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => {
                    updateBookmarkComment(step, editText);
                    setEditingBookmark(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateBookmarkComment(step, editText);
                      setEditingBookmark(null);
                    }
                    if (e.key === 'Escape') setEditingBookmark(null);
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className="bm-comment"
                  onClick={() => {
                    setEditingBookmark(step);
                    setEditText(comment);
                  }}
                >
                  {comment || '点击添加注释…'}
                </span>
              )}
              <button className="btn bm-del" onClick={() => toggleBookmark(step)}>
                ✕
              </button>
            </div>
          ))}
          {bmEntries.length > 0 && (
            <button className="btn bm-export" onClick={handleExportBookmarks}>
              📋 导出
            </button>
          )}
        </div>
      )}

      <div className="controls">
        {/* 对比模式开关 */}
        <button
          className={`btn ${compareMode ? 'primary' : ''}`}
          onClick={toggleCompareMode}
          title="对比模式"
        >
          {compareMode ? '⇔ 对比' : '⇔'}
        </button>

        {/* 手动模式开关 */}
        <button
          className={`btn ${manualMode ? 'primary' : ''}`}
          onClick={toggleManualMode}
          title="手动模式"
          disabled={currentAlgo?.dataKind !== 'array'}
        >
          ✋ {manualMode ? '手动' : ''}
        </button>

        {/* 播放控制 */}
        <div className="ctrl-group">
          <button
            className="btn"
            disabled={disabled || isAtStart}
            onClick={stepBack}
            title={t.controls.prev}
          >
            ⏮
          </button>
          <button
            className="btn primary"
            disabled={disabled}
            onClick={togglePlay}
            title={playing ? t.controls.pause : t.controls.play}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <button
            className="btn"
            disabled={disabled || isAtEnd}
            onClick={stepForward}
            title={t.controls.next}
          >
            ⏭
          </button>
        </div>

        {/* 速度 */}
        <div className="speed">
          <label>{t.controls.speed}</label>
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
          <label>{t.controls.dataSize}</label>
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
          {t.controls.randomData}
        </button>

        {/* 自定义数据 */}
        <input
          className="data-input"
          placeholder={t.controls.customData.replace('{data}', data.join(','))}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleCustomData}
        />

        <div className="spacer" />

        {/* 对比模式进度 */}
        {compareMode && compareProgress && (
          <span className="compare-progress">
            vs: {compareProgress}
          </span>
        )}

        {/* 截图 */}
        <button className="btn" onClick={handleScreenshot} title="截图">
          📷
        </button>

        {/* 分享 */}
        <button className="btn" onClick={handleShare} title="分享链接">
          {shareStatus === 'copied' ? '✓ 已复制' : '🔗 分享'}
        </button>

        {/* 重置 */}
        <button className="btn" onClick={handleReset}>
          {t.controls.reset}
        </button>
      </div>
    </footer>
  );
}
