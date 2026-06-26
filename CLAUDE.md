# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Algo Eye — 算法可视化学习网站，终端 CRT 复古风格（Phosphor Terminal）。纯前端静态站，核心架构是"算法生成器产出步骤序列 → 引擎回放 → 渲染器按状态色绘制"三段式管线。新增算法只需实现 `Algorithm` 接口，引擎与控制栏零改动。

## 常用命令

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器（Vite）
npm run build        # tsc -b && vite build
npm run preview      # 预览生产构建
npm run lint         # oxlint 代码检查
npm run type-check   # tsc --noEmit 类型检查
```

提交前必须运行 `npm run lint` 和 `npm run type-check`。

## 技术栈

- React 19 + TypeScript 6（严格模式）+ Vite 8
- 路由：React Router v7
- 状态管理：Zustand
- 代码高亮：Prism.js（自定义 CRT 主题）
- 样式：CSS Modules + 全局终端主题 CSS
- Lint：OxLint（非 ESLint）
- Node 版本：20（见 `.node-version`）
- 部署目标：Vercel / GitHub Pages（纯静态）

## 架构分层

```
UI 层 (React 组件)
  Topbar / AlgorithmTree / VizStage / CodePanel / Controls / StatsPanel / CrtOverlay
↓
引擎层 (纯 TS，框架无关)
  StepPlayer（回放）/ AnimationController（时钟）/ Step / Snapshot 类型
↓
算法层 (纯函数，无 DOM)
  Algorithm 接口 + 各算法生成器 + 元数据
↓
数据/状态层 (Zustand)
  useVizStore: currentAlgo / data / stepIndex / playing / speed
```

**核心数据流**：算法用 Generator 函数 yield Step → 引擎收集成 Step[] → StepPlayer 按速度回放 → Renderer.draw(ctx, snapshot) 画 Canvas → onStep 回调驱动 CodePanel 高亮与统计。

## 关键接口（实现新算法时必用）

```ts
// 算法接口 — 新增算法只实现这个
interface Algorithm {
  id: string; name: string;
  category: 'sorting' | 'searching' | 'graph' | 'data-structure';
  complexity: { time: string; space: string; stable?: boolean };
  codeLines: string[];
  dataKind: Snapshot['kind'];
  generate(data: number[]): Generator<Step>;
}

// 渲染器接口 — 每种数据形态一个
interface Renderer<TSnapshot> {
  draw(ctx: CanvasRenderingContext2D, snap: TSnapshot, opts: DrawOpts): void;
}
```

渲染器是**纯函数**：同一 snapshot 永远画同一帧，这是跳转/反向回放的前提。

## 设计系统约束（Phosphor Terminal）

- **只做暗色模式**，不提供亮色
- 主色：磷光绿 `#33ff66` + 琥珀 `#ffb000`，其余是算法状态语义色（compare=amber, swap=red, sorted=cyan, visit=purple, pivot=pink）
- 字体：JetBrains Mono（正文）/ VT323（终端大字）
- **禁止**渐变、毛玻璃、霓虹虹彩——这是对抗"AI 味"的纪律
- CRT 特效：扫描线叠层（CSS repeating-linear-gradient）+ shadowBlur 辉光 + 漂移扫描带
- `prefers-reduced-motion` 下关闭 sweep/闪烁

## 当前状态

项目处于初始化阶段（M1 前），基础架构已搭建：Vite + React + TypeScript + 路由骨架。核心业务代码（engine/、algorithms/、renderers/、store/）尚未实现。详细设计方案见 `docs/算法可视化网站-前端设计与技术方案.md`，UI 视觉稿见 `docs/algo-viz-ui-mockup.html`。

## 实现顺序（里程碑）

1. **M1**：冒泡排序端到端 — engine/types → bubbleSort 生成器 → ArrayRenderer → StepPlayer → AnimationController → useVizStore → VizStage + CodePanel + Controls + CrtOverlay
2. **M2**：扩展 5 个排序算法 + 可编辑数据
3. **M3**：搜索算法 + 数据结构（链表/栈/二叉树）+ TreeRenderer
4. **M4**：图算法 + GridRenderer + 网格编辑器
5. **M5**：Landing 页、性能优化、部署
