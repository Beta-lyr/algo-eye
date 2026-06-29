// ============================================================
// Learn — 算法讲解页面
// 展示算法的详细说明：概述、核心思想、复杂度分析等
// ============================================================

import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dispatchAchievement } from '../lib/achievementEvents';
import { getAlgorithmById } from '../algorithms';
import { getExplanation } from '../algorithms/explanations';
import { useT } from '../i18n';
import { LanguageSwitch } from '../components/LanguageSwitch';

export function Learn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    dispatchAchievement('bookworm');
  }, []);

  const algo = id ? getAlgorithmById(id) : undefined;
  const explanation = id ? getExplanation(id) : undefined;

  if (!algo || !explanation) {
    return (
      <div className="learn-page">
        <div className="learn-header">
          <Link to="/" className="back-link">← {t.common.reset}</Link>
          <LanguageSwitch />
        </div>
        <div className="learn-content">
          <div className="learn-404">
            <pre className="ascii-error">{`
  ██████╗ ██╗  ██╗ ██╗
  ██╔═══██╗██║  ██║███║
  ██║   ██║███████║╚██║
  ██║   ██║██╔══██║ ██║
  ╚██████╔╝██║  ██║ ██║
   ╚═════╝ ╚═╝  ╚═╝ ╚═╝
            `}</pre>
            <h2>{t.learn.notFound}</h2>
            <p>{t.learn.notFoundDesc}</p>
            <button className="btn primary" onClick={() => navigate('/')}>
              {t.learn.backHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="learn-page">
      {/* 头部 */}
      <div className="learn-header">
        <div className="learn-nav">
          <Link to="/" className="back-link">← {t.learn.home}</Link>
          <Link to={`/algo/${id}`} className="back-link">▸ {t.learn.viz}</Link>
        </div>
        <div className="learn-title">
          <h1>{algo.name}</h1>
          <div className="learn-badges">
            <span className="badge">
              {t.viz.time} <b>{algo.complexity.time}</b>
            </span>
            <span className="badge">
              {t.viz.space} <b>{algo.complexity.space}</b>
            </span>
            {algo.complexity.stable !== undefined && (
              <span className={`badge ${algo.complexity.stable ? 'ok' : ''}`}>
                {t.viz.stable} <b>{algo.complexity.stable ? t.viz.yes : t.viz.no}</b>
              </span>
            )}
          </div>
        </div>
        <LanguageSwitch />
      </div>

      {/* 内容 */}
      <div className="learn-content">
        {/* 概述 */}
        <section className="learn-section">
          <h2 className="section-title">
            <span className="section-icon">◆</span>
            {t.learn.sections.overview}
          </h2>
          <div className="section-body">
            <p>{explanation.overview}</p>
          </div>
        </section>

        {/* 核心思想 */}
        <section className="learn-section">
          <h2 className="section-title">
            <span className="section-icon">◇</span>
            {t.learn.sections.coreIdea}
          </h2>
          <div className="section-body">
            <p className="core-idea">{explanation.coreIdea}</p>
          </div>
        </section>

        {/* 关键步骤 */}
        <section className="learn-section">
          <h2 className="section-title">
            <span className="section-icon">▸</span>
            {t.learn.sections.keySteps}
          </h2>
          <div className="section-body">
            <ol className="steps-list">
              {explanation.keySteps.map((step, i) => (
                <li key={i}>
                  <span className="step-num">{i + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 复杂度分析 */}
        <section className="learn-section">
          <h2 className="section-title">
            <span className="section-icon">◈</span>
            {t.learn.sections.complexity}
          </h2>
          <div className="section-body">
            <p>{explanation.complexityAnalysis}</p>
          </div>
        </section>

        {/* 适用场景 */}
        <section className="learn-section">
          <h2 className="section-title">
            <span className="section-icon">是</span>
            {t.learn.sections.useCases}
          </h2>
          <div className="section-body">
            <ul className="use-cases-list">
              {explanation.useCases.map((useCase, i) => (
                <li key={i}>{useCase}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 常见误用 */}
        <section className="learn-section">
          <h2 className="section-title">
            <span className="section-icon">否</span>
            {t.learn.sections.pitfalls}
          </h2>
          <div className="section-body">
            <ul className="pitfalls-list">
              {explanation.pitfalls.map((pitfall, i) => (
                <li key={i}>{pitfall}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 变体与改进 */}
        <section className="learn-section">
          <h2 className="section-title">
            <span className="section-icon">◎</span>
            {t.learn.sections.variants}
          </h2>
          <div className="section-body">
            <ul className="variants-list">
              {explanation.variants.map((variant, i) => (
                <li key={i}>{variant}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 伪代码 */}
        <section className="learn-section">
          <h2 className="section-title">
            <span className="section-icon">⌘</span>
            {t.learn.sections.pseudoCode}
          </h2>
          <div className="section-body">
            <pre className="code-block">
              {algo.codeLines.join('\n')}
            </pre>
          </div>
        </section>

        {/* CTA */}
        <div className="learn-cta">
          <button
            className="btn primary"
            onClick={() => navigate(`/algo/${id}`)}
          >
            {t.learn.viewViz}
          </button>
        </div>
      </div>
    </div>
  );
}
