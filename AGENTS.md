# AGENTS.md — Algo Eye

## Commands (run in order before commit)

```bash
npm run lint         # oxlint（非 ESLint）
npm run type-check   # tsc --noEmit（strict + verbatimModuleSyntax + erasableSyntaxOnly）
npm run build        # tsc -b && vite build
npm run dev          # vite dev server
npm run preview      # vite preview
```

没有测试框架；`lint` + `type-check` 通过即视为验证通过。

## Architecture

```
算法 Generator(yield Step) → 引擎(StepPlayer 收集 Step[]) → StepPlayer 回放 → Renderer.draw(ctx, snapshot) → onStep 驱动 CodePanel 高亮
```

三段式管线，新增算法只需实现 `Algorithm` 接口（`src/algorithms/types.ts`），引擎与控制栏零改动。

## Key conventions

- **状态管理**：单一 Zustand store `useVizStore`（`src/store/useVizStore.ts`）
- **路由**：React Router v7，页面位于 `src/pages/` — `/` Landing, `/algo/:id` Workspace, `/algo/:id/learn` Learn
- **i18n**：自研，基于 Zustand + 持久化到 localStorage key `algo-eye-locale`，翻译字典在 `src/i18n/locales/`
- **步骤消息翻译**：`src/i18n/messageTranslator.ts` — 基于中文子串精确匹配 + 正则模式替换，新增算法需要添加对应的翻译模式
- **引擎层纯 TS**（无 React 依赖）：`src/engine/StepPlayer.ts` + `src/engine/AnimationController.ts`（基于 requestAnimationFrame 累积时间驱动）
- **Renderer 纯函数**：同一 snapshot 永远画同一帧，跳转/反向回放依赖此前提
- **CSS**：`terminal.css`（1400 行全局终端主题）+ CSS Modules，非 Tailwind/CSS-in-JS

## Adding a new algorithm

1. 在 `src/algorithms/<category>/` 创建文件，实现 `Algorithm` 接口（`generate(): Generator<Step>`）
2. 导入并注册到 `src/algorithms/index.ts`
3. 更新 `src/i18n/locales/zh.ts` 和 `en.ts` 添加算法名称
4. 如果步骤消息需要翻译，在 `messageTranslator.ts` 添加模式
5. 运行 `npm run lint && npm run type-check`

## Adding a new data kind / renderer

1. 扩展 `src/engine/types.ts` — `DataKind` + `Snapshot` 新字段
2. 在 `src/renderers/` 创建 `Renderer<Snapshot>` 实现
3. 在 `src/components/VizStage.tsx` 导入并注册到 `getRenderer()` 函数

## Keyboard shortcuts (Workspace)

| Key | Action |
|-----|--------|
| `Space` | 播放 / 暂停 |
| `←` | 上一步 |
| `→` | 下一步 |
| `F` | 焦点模式（隐藏侧栏/代码面板） |
| `?` | 快捷键帮助面板 |

## Features added after V2

- **键盘快捷键** — `Controls.tsx` 全局 keydown 监听
- **CodePanel 自动滚动** — `CodePanel.tsx:61` useEffect + scrollIntoView
- **侧边栏搜索过滤** — `AlgorithmTree.tsx` 搜索输入框，匹配算法名/id
- **异常安全** — `useVizStore.ts` 内 `safeGenerate()` 包装所有 `algo.generate()`，失败时设置 `error` 状态 + 底部横幅
- **Focus mode** — `Workspace.tsx` 的 `.main.focus` CSS 隐藏首尾 pane，快捷键 F
- **柱状图悬停 tooltip** — `VizStage.tsx` 的 `xyToIndex` 映射函数 + `.bar-tooltip` CSS
- **全屏按钮** — Fullscreen API，按钮在 viz-hd badges 区域
- **书签 UI** — 进度条（点击跳转）+ 书签标记 + 列表（注释编辑）+ 导出 JSON
- **首次加载修复** — store `currentAlgo: null` 确保 Workspace effect 触发 `selectAlgorithm`

## Design constraints

- 只做暗色模式，主色磷光绿 `#33ff66` + 琥珀 `#ffb000`
- 禁止渐变、毛玻璃、霓虹虹彩
- 字体：JetBrains Mono（正文）/ VT323（终端大字）
- CRT 特效：扫描线 + shadowBlur 辉光 + 漂移扫描带（`src/styles/terminal.css`）
- `prefers-reduced-motion` 下关闭动画
- 数据量 4–64 个元素（Controls 限制）
- ArrayRenderer 在 >32 数据量时关闭辉光和标签以优化性能
