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

## 架构分层（不可更改）

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

## 设计系统约束（Phosphor Terminal）— 必须遵守

### 核心原则
- **只做暗色模式**，不提供亮色（亮色会摧毁磷光辉光与扫描线的表现力）
- **禁止**渐变、毛玻璃、霓虹虹彩——这是对抗"AI 味"的纪律
- 状态色不可挪作装饰；同一时刻一个元素只有一个状态（状态机互斥）

### 色彩 Token

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg` | `#0a0e0a` | 画布/页面底（略带绿调的近黑） |
| `--bg-panel` | `#0d130d` | 面板底 |
| `--bg-panel-raised` | `#101710` | 顶/底栏渐变 |
| `--border` | `#1f2a1f` | 面板边框 |
| `--border-bright` | `#2f4a2f` | 悬停/聚焦边框 |
| `--green` | `#33ff66` | 磷光主色：正文、默认元素 |
| `--green-dim` | `#5cb574` | 次要文字 |
| `--green-faint` | `#2e5e3e` | 弱文字/标签 |
| `--amber` | `#ffb000` | 强调：当前代码行、比较中、聚焦 |
| `--red` | `#ff5555` | 交换中/错误 |
| `--cyan` | `#00e5ff` | 已排序/锁定/信息 |
| `--purple` | `#b388ff` | 已访问（图算法） |
| `--pink` | `#ff79c6` | 轴点（快排）/关键字 |
| `--green-soft` | `#00e676` | 路径/成功 |

### 算法状态色映射（语义骨架）

| 状态 | 色 | 语义 |
|------|-----|------|
| `default` | 磷光绿 | 未处理 |
| `compare` | 琥珀 | 正在比较 |
| `swap` | 红 | 正在交换 |
| `sorted` | 青 | 已就位/锁定 |
| `visit` | 紫 | 已访问（图/搜索） |
| `current` | 琥珀 | 当前指针/前沿 |
| `path` | 亮绿 | 最短路径/解 |
| `pivot` | 粉 | 轴点（快排） |

### 字体
- 主字族：`'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace`
- 终端显示字：`'VT323'`（仅用于 logo / 大号数字 / 算法标题）
- 字号：正文 14px，代码 13px，标签 11px（大写 + 字间距 0.12em），终端大字 20–26px

### 间距与栅格
- 4px 基线尺：`4 / 8 / 12 / 16 / 24 / 32 / 48`
- 面板内边距 14–18px，控件间 8–14px
- 布局栅格：左栏 230px / 中栏自适应 / 右栏 420px，底栏 56px、顶栏 48px

### CRT 特效
- 扫描线叠层：CSS `repeating-linear-gradient` + `radial-gradient` 暗角
- 辉光：Canvas 用 `ctx.shadowBlur`/`shadowColor`；DOM 文字用 `text-shadow`
- 漂移扫描带：140px 柔光带缓慢下扫（纯 CSS 动画）
- `prefers-reduced-motion` 下关闭 sweep/闪烁，保留状态色

### 组件规范
- **面板 Panel**：深底 + 1px `--border` + 可选扫描线叠层 + 内辉光。标题栏 11px 大写弱色
- **按钮 Button**：等宽大写、描边式（无填充）；主操作用琥珀描边；悬停=更亮辉光。不用圆角胶囊和填充渐变
- **代码面板 CodePanel**：绿字黑底，行号弱色，当前行琥珀底 + 左边框 + 辉光
- **画布 Canvas**：暗底 + 40px 网格线（极弱绿）+ 元素用状态色 + `shadowBlur` 辉光
- **控制栏 Controls**：播放/暂停/单步/速度滑块（琥珀滑块）/数据量输入/随机/自定义数据/重置
- **徽章 Badge**：描边式，展示时间/空间复杂度、稳定性

### 动效规范
- 磷光淡入：元素出现时辉光从弱到强（bloom）
- 柱体过渡：高度/颜色 0.25s `cubic-bezier(.2,.8,.2,1)`，带辉光拖尾
- 代码行高亮切换瞬时，不做缓动（代码同步要"咔哒"感，不要"滑"感）

## 目录结构

```
src/
├── components/            # UI 层
│   ├── Topbar.tsx
│   ├── AlgorithmTree.tsx
│   ├── VizStage.tsx
│   ├── CodePanel.tsx
│   ├── Controls.tsx
│   ├── StatsPanel.tsx
│   └── crt/CrtOverlay.tsx
├── engine/               # 引擎层（框架无关）
│   ├── StepPlayer.ts
│   ├── AnimationController.ts
│   └── types.ts          # Step / Snapshot / State
├── algorithms/           # 算法层
│   ├── types.ts          # Algorithm 接口
│   ├── sorting/
│   ├── searching/
│   ├── graph/
│   ├── data-structure/
│   └── index.ts          # 算法注册表
├── renderers/            # 渲染器层
│   ├── Renderer.ts       # 接口
│   ├── ArrayRenderer.ts  # 排序/搜索柱状图
│   ├── GridRenderer.ts   # 图算法网格
│   └── TreeRenderer.ts
├── store/                # 状态层
│   └── useVizStore.ts
├── styles/
│   ├── global.css
│   └── terminal.css      # CRT 主题 + Prism 主题
├── pages/
│   ├── Workspace.tsx
│   └── Landing.tsx
├── App.tsx
└── main.tsx
```

## 当前状态（12 个算法）

| 分类 | 算法 |
|------|------|
| 排序 | 冒泡、选择、插入、快速、归并、堆 |
| 搜索 | 线性搜索、二分搜索 |
| 数据结构 | 二叉搜索树 |
| 图 | BFS、DFS、Dijkstra |

## 新增算法 Checklist

1. 在 `src/algorithms/<category>/` 下创建新文件
2. 实现 `Algorithm` 接口（id、name、category、complexity、codeLines、dataKind、generate）
3. 在 `src/algorithms/index.ts` 中导入并注册
4. 如果需要新的数据形态，在 `engine/types.ts` 扩展 `Snapshot['kind']`
5. 如果需要新的渲染器，在 `src/renderers/` 下创建并实现 `Renderer` 接口
6. 运行 `npm run lint` 和 `npm run type-check` 确认无误

## 设计方案参考

- 详细设计方案：`docs/算法可视化网站-前端设计与技术方案.md`
- V2 迭代方案：`docs/Algo-Eye-V2-技术方案.md`
- UI 视觉稿：`docs/algo-viz-ui-mockup.html`
