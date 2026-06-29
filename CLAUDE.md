# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Algo Eye — 算法可视化学习网站，终端 CRT 复古风格。纯前端静态站，核心架构是"算法生成器 → 引擎回放 → 渲染器绘制"三段式管线。新增算法只需实现 `Algorithm` 接口，引擎与控制栏零改动。

## 常用命令

```bash
npm run dev          # 开发服务器
npm run build        # tsc -b && vite build
npm run lint         # oxlint
npm run type-check   # tsc --noEmit
```

提交前必须运行 `npm run lint` 和 `npm run type-check`。

## 技术栈

- React 19 + TypeScript 6 + Vite 8
- 路由：React Router v7 | 状态：Zustand | 国际化：自研 i18n
- Lint：OxLint（非 ESLint）| 样式：全局终端主题 CSS

## 架构

```
UI 层 → 引擎层(纯TS) → 算法层(纯函数) → 状态层(Zustand) → i18n层
```

**核心数据流**：算法 Generator yield Step → 引擎收集 Step[] → StepPlayer 回放 → Renderer.draw(ctx, snapshot) → onStep 驱动代码高亮

## 关键接口

```ts
// 新增算法只实现这个
interface Algorithm {
  id: string; name: string;
  category: 'sorting' | 'searching' | 'graph' | 'data-structure' | 'string' | 'dynamic-programming';
  complexity: { time: string; space: string; stable?: boolean };
  codeLines: string[];
  dataKind: Snapshot['kind'];
  generate(data: number[]): Generator<Step>;
}
```

渲染器是**纯函数**：同一 snapshot 永远画同一帧。

## 设计系统约束

- **只做暗色模式**，主色磷光绿 `#33ff66` + 琥珀 `#ffb000`
- **禁止**渐变、毛玻璃、霓虹虹彩
- 字体：JetBrains Mono（正文）/ VT323（终端大字）
- CRT 特效：扫描线 + shadowBlur 辉光 + 漂移扫描带
- `prefers-reduced-motion` 下关闭动画

## 当前状态

32 个算法：排序(10) | 搜索(5) | 数据结构(4) | 图(7) | 字符串(3) | 动态规划(3)

## 新增算法 Checklist

1. `src/algorithms/<category>/` 创建文件，实现 `Algorithm` 接口
2. `src/algorithms/index.ts` 导入注册
3. 新数据形态：扩展 `engine/types.ts` 的 `Snapshot['kind']` 和 `DataKind`
4. 新渲染器：`src/renderers/` 实现 `Renderer` 接口，在 `VizStage.tsx` 注册
5. 更新 `src/i18n/locales/zh.ts` 和 `en.ts` 的算法名称
6. 运行 `npm run lint && npm run type-check`

## 设计方案

- V1 方案：`docs/Algo-Eye-V1-技术方案.md`
- V2 方案：`docs/Algo-Eye-V2-技术方案.md`
- UI 视觉稿：`docs/algo-viz-ui-mockup.html`
