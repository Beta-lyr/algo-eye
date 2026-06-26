// ============================================================
// Landing — 首页（ASCII logo + Hero 动画 + 算法分类入口）
// ============================================================

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVizStore } from '../store/useVizStore';
import { useT } from '../i18n';
import { LanguageSwitch } from '../components/LanguageSwitch';
import type { AlgorithmCategory } from '../algorithms/types';

/** 分类入口卡数据 */
const CATEGORY_KEYS: AlgorithmCategory[] = [
  'sorting',
  'searching',
  'graph',
  'data-structure',
  'string',
  'dynamic-programming',
];

const CATEGORY_ICONS: Record<AlgorithmCategory, string> = {
  sorting: '↕',
  searching: '🔍',
  graph: '◈',
  'data-structure': '⊞',
  string: 'Aa',
  'dynamic-programming': '📊',
};

export function Landing() {
  const navigate = useNavigate();
  const algorithms = useVizStore((s) => s.algorithms);
  const selectAlgorithm = useVizStore((s) => s.selectAlgorithm);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useT();

  // Hero 动画：自动循环播放冒泡排序
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 生成随机数据
    const data = Array.from({ length: 16 }, () => Math.floor(Math.random() * 99) + 1);

    // 生成冒泡排序步骤
    const steps: { data: number[]; states: Record<number, string> }[] = [];
    const arr = [...data];
    const n = arr.length;

    steps.push({ data: [...arr], states: {} });

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // 比较
        steps.push({ data: [...arr], states: { [j]: 'compare', [j + 1]: 'compare' } });

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({ data: [...arr], states: { [j]: 'swap', [j + 1]: 'swap' } });
        }
      }
      // 标记已排序
      const states: Record<number, string> = {};
      for (let k = n - i - 1; k < n; k++) states[k] = 'sorted';
      steps.push({ data: [...arr], states });
    }
    steps.push({ data: [...arr], states: Object.fromEntries(Array.from({ length: n }, (_, i) => [i, 'sorted'])) });

    let stepIndex = 0;
    let frameCount = 0;
    const FRAME_PER_STEP = 3;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;

      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);

      const step = steps[stepIndex];
      const maxVal = Math.max(...step.data, 1);
      const barGap = 6;
      const paddingX = 40;
      const paddingBottom = 28;
      const barAreaHeight = cssH - paddingBottom;
      const barWidth = Math.max(4, (cssW - paddingX * 2 - barGap * (step.data.length - 1)) / step.data.length);

      const STATE_COLORS: Record<string, string> = {
        default: '#33ff66',
        compare: '#ffb000',
        swap: '#ff5555',
        sorted: '#00e5ff',
      };

      for (let i = 0; i < step.data.length; i++) {
        const val = step.data[i];
        const state = step.states[i] ?? 'default';
        const color = STATE_COLORS[state] ?? STATE_COLORS.default;
        const barHeight = (val / maxVal) * barAreaHeight;
        const x = paddingX + i * (barWidth + barGap);
        const y = barAreaHeight - barHeight;

        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      frameCount++;
      if (frameCount >= FRAME_PER_STEP) {
        frameCount = 0;
        stepIndex = (stepIndex + 1) % steps.length;
      }

      requestAnimationFrame(draw);
    };

    const rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleEnter = (category?: AlgorithmCategory) => {
    if (category) {
      const algo = algorithms.find((a) => a.category === category);
      if (algo) {
        selectAlgorithm(algo.id);
        navigate(`/algo/${algo.id}`);
        return;
      }
    }
    // 默认跳转到第一个算法
    const firstAlgo = algorithms[0];
    if (firstAlgo) {
      selectAlgorithm(firstAlgo.id);
      navigate(`/algo/${firstAlgo.id}`);
    }
  };

  return (
    <div className="landing">
      {/* CRT 特效 */}
      <div className="crt-sweep" />
      <div className="crt-overlay" />

      {/* 语言切换 */}
      <div className="landing-lang">
        <LanguageSwitch />
      </div>

      {/* 主内容 */}
      <div className="landing-content">
        {/* ASCII Logo */}
        <div className="landing-logo">
          <pre className="ascii-art">{`
   █████╗ ██╗      ██████╗  ██████╗
  ██╔══██╗██║     ██╔════╝ ██╔════╝
  ███████║██║     ██║  ███╗██║  ███╗
  ██╔══██║██║     ██║   ██║██║   ██║
  ██║  ██║███████╗╚██████╔╝╚██████╔╝
  ╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝
          `}</pre>
          <div className="landing-title">
            ▌ALGO<span className="sep">::</span>VIZ
          </div>
          <div className="landing-subtitle">
            {t.landing.subtitle}
          </div>
        </div>

        {/* Hero 动画 */}
        <div className="landing-hero">
          <canvas ref={canvasRef} />
        </div>

        {/* 标语 */}
        <div className="landing-tagline">
          {t.landing.tagline}
        </div>

        {/* CTA 按钮 */}
        <button className="btn primary landing-cta" onClick={() => handleEnter()}>
          {t.landing.cta}
        </button>

        {/* 算法分类入口卡 */}
        <div className="landing-cards">
          {CATEGORY_KEYS.map((key) => {
            const count = algorithms.filter((a) => a.category === key).length;
            return (
              <div
                key={key}
                className="landing-card"
                onClick={() => handleEnter(key)}
              >
                <div className="card-icon">{CATEGORY_ICONS[key]}</div>
                <div className="card-label">{t.category[key]}</div>
                <div className="card-count">
                  {t.landing.algoCount.replace('{count}', String(count))}
                </div>
                <div className="card-desc">{t.landing.categoryDesc[key]}</div>
              </div>
            );
          })}
        </div>

        {/* 底部信息 */}
        <div className="landing-footer">
          <span className="footer-text">
            {t.landing.footer}
          </span>
          <a
            href="https://github.com/Beta-lyr/algo-eye"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-github"
          >
            ▪ {t.common.github}
          </a>
        </div>
      </div>
    </div>
  );
}
