import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { useT } from '../i18n';

const ARTICLES = [
  {
    id: 'manual',
    title: '使用手册',
    content: `# ALGO::VIZ 使用手册

## 概述

ALGO::VIZ 是一个终端风格的算法可视化学习工具，支持 36 种算法的动画演示和交互式探索。

## 快速开始

1. 从首页点击「进入终端」或直接在 URL 输入 /algo/:id
2. 左侧面板选择要学习的算法
3. 底部控制栏点击 ▶ 播放动画
4. 观察柱状图/树/网格的变化，理解算法执行过程

## 核心功能

### 算法可视化

支持排序、搜索、图算法、数据结构、字符串匹配、动态规划共 6 大类 36 种算法。每种算法都有对应的可视化渲染器。

### 对比模式

开启对比模式后，画布左右分屏，同时运行两个算法对比效率。共享同一份输入数据，同步播放。

### 手动模式

启用手动模式后，你可以自己点击元素执行每一步操作，系统会校验操作是否正确。

### 挑战模式

在挑战模式下，你手动排序，系统计时并统计交换次数，最后与算法本身对比谁更优。

### 书签

在进度条上点击可添加书签标记关键步骤，支持添加注释笔记，可导出为 JSON。

### 键盘快捷键

Space 播放/暂停 · ← 上一步 · → 下一步 · F 焦点模式 · ? 快捷键帮助

### 成就系统

查看算法、完成挑战、打开快捷键面板等行为会触发成就解锁，可在底栏 [*] 按钮查看全部成就。

## 数据操作

- 数据量可调（4–64 个元素）
- 支持随机生成和手动输入自定义数据
- 柱状图悬停显示下标和数值

## 算法讲解

每个算法配有独立的讲解页面（点击标题栏的「讲解」按钮），包含概述、核心思想、复杂度分析和伪代码。`,
  },
  {
    id: 'dev-notes',
    title: '开发想法',
    content: `# 开发想法

## 架构设计

三段式管线：算法 Generator → StepPlayer 收集 Step[] → Renderer.draw(ctx, snapshot)

新增算法只需实现 Algorithm 接口，引擎和控制栏零改动。这种解耦设计使得算法库可以无限扩展。

## 技术选型

- React + TypeScript（Zustand 状态管理）
- Canvas 2D 渲染（无第三方图表库）
- Vite 构建工具
- CRT 终端风格设计（暗色模式 + 磷光绿主题）

## 为什么用 Canvas 而不是 SVG？

Canvas 2D 在频繁重绘场景下性能优于 SVG，且 shadowBlur 可以模拟 CRT 辉光效果。对于树/图等数据结构，Canvas 提供了更自由的绘制能力。

## 风格设计

全暗色模式，主色 #33ff66 磷光绿 + #ffb000 琥珀色强调。CRT 特效包括扫描线、辉光和漂移扫描带。字体使用 JetBrains Mono 和 VT323。

## 未来方向

- 3D 树渲染（Canvas 2D 等距投影已实现基础版本）
- WebGL 渲染器（大数据量性能优化）
- 用户自定义算法脚本
- 算法竞赛模式（多人排序竞速）
- 更多数据结构和算法的可视化`,
  },
];

export function About() {
  const [activeId, setActiveId] = useState('manual');
  const t = useT();
  const article = ARTICLES.find((a) => a.id === activeId) ?? ARTICLES[0];

  return (
    <div className="about-page">
      <div className="about-header">
        <Link to="/" className="back-link">← {t.common.reset}</Link>
        <span className="about-title">▌ALGO<span className="sep">::</span>VIZ</span>
        <LanguageSwitch />
      </div>
      <div className="about-body">
        <aside className="about-sidebar">
          {ARTICLES.map((a) => (
            <div
              key={a.id}
              className={`about-nav-item${a.id === activeId ? ' active' : ''}`}
              onClick={() => setActiveId(a.id)}
            >
              {a.id === 'manual' ? '■' : '◆'} {a.title}
            </div>
          ))}
        </aside>
        <main className="about-content">
          <article className="about-article">
            {article.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return <h1 key={i}>{line.slice(2)}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={i}>{line.slice(3)}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i}>{line.slice(4)}</h3>;
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="about-li">{line.slice(2)}</li>;
              }
              if (line.trim() === '') {
                return <br key={i} />;
              }
              return <p key={i}>{line}</p>;
            })}
          </article>
        </main>
      </div>
    </div>
  );
}
