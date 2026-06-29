# Algo Eye 重构方案

> 目标：在 V3 启动前，把 Controls.tsx / useVizStore.ts 的"大组件 + 大 store"结构拆成可维护的形态，**不改变任何对外行为**，为 V3 用户自定义代码可视化铺路。

---

## 0. 结论先行

**判断：这确实是一个真实的、中等程度的设计问题，不只是"格式不优雅"。** 功能完全正常，但继续往上堆 V3 会让复杂度失控。值得在 V3 前做一次**定向、增量**的重构，而不是大爆炸式重写。

**事实（可直接验证）：**
- `Controls.tsx` 557 行，单个组件内混了：进度条+书签、书签列表（可编辑）、播放控制、速度/数据量/随机/自定义数据、对比开关+进度、手动开关、挑战徽章+结果+100ms 计时器、截图、分享、成就面板、快捷键面板、键盘监听。
- `Controls.tsx` 内约 30 个 `useVizStore` selector、约 10 个 `useState`、6 个 `useEffect`。
- `useVizStore.ts` 603 行，`interface VizState` 约 50 个成员，横跨：算法注册、数据/步骤/播放、统计、焦点、错误、手动模式、书签、挑战、对比、核心操作。
- `safeGenerate` 在 `selectAlgorithm / setData / randomizeData / reset / toggleCompareMode / setCompareAlgo` 等 5+ 处重复（主算法 + 对比算法各跑一遍，逻辑几乎一致）。
- 统计聚合的 `for (i=0;i<=index;i++)` 计数循环在 `setStepIndex / syncCompareStep / selectIndex` 3 处重复，每次 O(n)。
- 挑战模式 100ms `setInterval` → `setElapsed`，每次触发整个 `Controls` 重渲染（包括所有 selector 订阅）。

**我的判断（非事实）：**
- 当前结构是"能跑且跑得稳"的——逻辑（手动校验、挑战胜利检测、对比同步）都嵌在 store action 里，是经过验证的正确代码，**重构的首要纪律是不破坏这些行为**。
- 真正的痛点不是"行数多"，而是**关注点未分离**：挑战计时器拖着重渲染、引擎时钟（AnimationController）耦合在 JSX 组件里、store 内部缺少 slice 边界导致 V3 难以插入新的 step 来源。
- 不必拆成多个 store、不必引入 Redux、不必大爆炸重写——Zustand 的 slice 模式（单 store、多个 slice creator 组合）就能解决绝大部分问题。

---

## 1. 问题清单（按修复价值排序）

| # | 问题 | 位置 | 影响 | 严重度 |
|---|------|------|------|--------|
| P1 | 统计计数循环重复，且每次 O(n) | setStepIndex / syncCompareStep / selectIndex | 步进时反复全量扫描 steps，数据量大时有性能损耗 | 中 |
| P2 | safeGenerate + compareSteps 重建逻辑重复 5+ 处 | useVizStore 多个 action | 改一处漏一处的高危区，V3 接入新 step 源时极易踩坑 | 高 |
| P3 | 挑战 100ms 计时器 setState 拖垮整组件重渲染 | Controls.tsx elapsed | 挑战期间持续重渲染全部 selector 订阅 | 中 |
| P4 | 引擎时钟（AnimationController ref + onTick）耦合在 JSX 组件 | Controls.tsx | 组件既管 UI 又管播放时钟，V3 难复用 | 中 |
| P5 | 单组件混 7 大功能域 | Controls.tsx | 阅读困难、局部状态散落、无法按域测试 | 中 |
| P6 | 单 store ~50 成员无内部边界 | useVizStore.ts | 心智负担重、V3 新增 slice 时无处下手 | 中 |
| P7 | 无任何单元测试 | 全项目 | 重构无安全网，只能靠手动冒烟 | 高（约束重构节奏） |

---

## 2. 重构原则与"不做"清单

**做：**
- 行为对齐优先：每个阶段结束跑一遍冒烟用例（见 §6），任何行为差异即视为未完成。
- 增量、可回滚：每阶段一个 PR/commit，独立可合并、独立可回退。
- 先抽纯函数（可测）、再拆组件（可读）、再切 slice（可扩展）。
- 公共 API（`useVizStore` 对外接口、`Controls` 渲染结果）**保持不变**——Workspace.tsx 不需要改动。

**不做：**
- ❌ 拆成多个独立 store（Zustand 单 store + slice 足够，多 store 反而增加跨 store 同步成本）。
- ❌ 引入 Redux / MobX / Recoil（无收益，徒增依赖）。
- ❌ 大爆炸重写（一次性重写 1000+ 行验证过的逻辑，风险不可控）。
- ❌ 为重构而重构——只动有明确收益的部分，P5/P6 视 V3 进度可延后。

---

## 3. 分阶段方案

> 顺序按"低风险高价值"排列。阶段 1+2+3 在 V3 前完成；阶段 4 可与 V3 并行；阶段 5 视测量结果决定。

### 阶段 1：抽取纯函数 helper + 补单测（安全网）

**目标：** 把可独立的逻辑抽成纯函数，并补上项目第一批单测，给后续阶段兜底。

**新增文件：**

`src/lib/stats.ts`
```ts
/** 前缀和预算，把 O(n) 计数降为 O(1) 查询 */
export function buildStats(steps: Step[]) {
  const compare = new Array(steps.length + 1).fill(0);
  const swap = new Array(steps.length + 1).fill(0);
  for (let i = 0; i < steps.length; i++) {
    compare[i + 1] = compare[i] + (steps[i].type === 'compare' ? 1 : 0);
    swap[i + 1] = swap[i] + (steps[i].type === 'swap' ? 1 : 0);
  }
  return {
    compareUpTo: (i: number) => compare[i + 1],
    swapUpTo: (i: number) => swap[i + 1],
  };
}

/** 查询到 index（含）为止的累计比较/交换数 */
export function computeStats(steps: Step[], index: number) {
  let c = 0, s = 0;
  for (let i = 0; i <= index; i++) {
    if (steps[i].type === 'compare') c++;
    if (steps[i].type === 'swap') s++;
  }
  return { compareCount: c, swapCount: s };
}
```

`src/lib/shareUrl.ts` — 抽 `getShareUrl` / `loadFromUrl` 里的 URL 编解码：`buildShareUrl(origin, algoId, data, stepIndex)` + `parseShareUrl(search, pathname)`，纯函数，可单测。

`src/lib/challenge.ts` — 抽挑战纯逻辑：`isSorted(arr)` + `buildChallengeResult(...)`。

**改造点：**
- `setStepIndex / syncCompareStep / selectIndex` 调 `computeStats`（或预算前缀和）替换内联循环。
- `getShareUrl / loadFromUrl` 委托给 `shareUrl.ts`。
- 挑战胜利检测、result 构造委托给 `challenge.ts`。

**新增测试（vitest，项目当前无测试）：**
- `stats.test.ts`：空 steps、全 compare、全 swap、混合、越界 index。
- `shareUrl.test.ts`：往返编解码、step=0 省略、data 越界裁剪。
- `challenge.test.ts`：已序/未序/单元素。

**风险：** 极低。纯函数抽取 + 委托调用，行为等价性可由测试保证。

---

### 阶段 2：拆分 Controls 为子组件（按域切分，仅展示层）

**目标：** 把 557 行的 `Controls` 按功能域拆成展示型子组件，每个子组件只订阅自己关心的 slice，局部状态就近持有。

**拆分清单：**

| 子组件 | 职责 | 自身局部状态 | 订阅 slice |
|--------|------|--------------|-----------|
| `PlaybackControls` | ⏮ ▶ ⏭ + 速度滑块 | 无 | steps/stepIndex/playing/speed |
| `DataControls` | 数据量/随机/自定义输入 | `customInput`（就近搬过来） | data |
| `BookmarkBar` | 进度条+书签标记+书签列表（可编辑）+导出 | `editingBookmark` / `editText` | steps/stepIndex/bookmarks |
| `ChallengeControls` | 挑战徽章+结果+**100ms 计时器** | `elapsed`（搬进来，只重渲染自己） | challenge* |
| `CompareToggle` + `CompareProgress` | 对比开关 + 进度 | 无 | compareMode/compareSteps/compareStepIndex |
| `MetaControls` | 成就按钮+面板、快捷键按钮+面板、截图、分享、重置 | `showAchievements` / `showShortcuts` / `shareStatus` | currentAlgo |

**关键收益：**
- 挑战计时器的 100ms 重渲染被**隔离在 `ChallengeControls` 内**，不再拖垮整个底栏（P3 解决）。
- 书签编辑状态就近持有，不再污染顶层（P5 部分）。
- 每个子组件可独立 snapshot 测试。

**纪律：** 本阶段**只搬代码、不改逻辑**——任何"顺手优化"都推到后续阶段。行为对齐靠 §6 冒烟用例。

**风险：** 低-中。纯结构搬运，但 props 传递易出错，需逐个子组件验证。

---

### 阶段 3：抽 hook——引擎时钟与键盘（解耦 UI 与引擎）

**目标：** 把"播放时钟"和"键盘监听"从 JSX 组件里抽到自定义 hook，让组件只剩展示职责，并为 V3 复用时钟铺路。

`src/hooks/usePlaybackClock.ts`
```ts
/** 封装 AnimationController 生命周期 + onTick → setStepIndex(+对比同步) */
export function usePlaybackClock() {
  // 内部持有 controllerRef、同步 speed、注册 onTick
  // 返回 { play, pause, stop } 供 PlaybackControls 使用
}
```

`src/hooks/useKeyboardShortcuts.ts`
```ts
/** 封装 Space/←/→/F/? 的全局监听，依赖项由调用方传入 */
export function useKeyboardShortcuts(handlers: { togglePlay; stepBack; stepForward; toggleFocus }) { ... }
```

**收益：**
- `Controls` 不再直接 `new AnimationController()`，引擎耦合消除（P4 解决）。
- V3 的用户代码沙箱也能复用 `usePlaybackClock` 驱动 StepPlayer。
- 键盘逻辑可独立测试（jsdom 模拟按键）。

**风险：** 中。`useEffect` 依赖项与闭包捕获是常见陷阱，需保证 `onTick` 内用 `useVizStore.getState()` 取最新值（现有代码已是这样，保持即可）。

---

### 阶段 4：store slice 模式（内部重组，对外接口不变）

**目标：** 把 603 行单 store 按域切成 slice creator，组合进同一个 `create()`，**公共 `useVizStore` 类型与导出名保持不变**。

**slice 划分：**

```
src/store/slices/
  playbackSlice.ts   // algorithms/currentAlgo/data/steps/stepIndex/playing/speed + selectAlgorithm/setData/setStepIndex/...
  compareSlice.ts    // compareMode/compareAlgo/compareSteps/... + toggleCompareMode/setCompareAlgo/syncCompareStep
  challengeSlice.ts  // challenge* + startChallenge/challengeSwap/endChallenge
  bookmarkSlice.ts   // bookmarks + toggleBookmark/updateBookmarkComment/exportBookmarks
  manualSlice.ts     // manualMode/selectedIndices/hintMessage + toggleManualMode/selectIndex/clearSelection
```

**关键重构：** 在 `playbackSlice` 内集中一个 `rebuildSteps(state, algo, data)` helper，统一处理"主算法 + 对比算法"的 safeGenerate + steps 重置 + 统计清零，消除 5+ 处重复（P2 解决）。`selectAlgorithm / setData / randomizeData / reset` 全部委托给它。

**组合方式：**
```ts
export const useVizStore = create<VizState>((...a) => ({
  ...createPlaybackSlice(...a),
  ...createCompareSlice(...a),
  ...createChallengeSlice(...a),
  ...createBookmarkSlice(...a),
  ...createManualSlice(...a),
}));
```

**纪律：**
- `VizState` interface 不拆分对外（仍是单一接口），只是**实现**按 slice 文件组织。
- 每个 slice 自带单测（用 `vi.mock` 或直接测纯函数部分）。
- 行为对齐靠 §6 冒烟 + slice 单测双重保证。

**风险：** 中-高。slice 之间的隐式依赖（如 `selectAlgorithm` 会触发 compare slice 的重建）是最大陷阱，必须显式化为 `rebuildSteps` 的参数传递，避免 slice 互相 `get()` 形成隐式耦合。

**与 V3 关系：** 本阶段可与 V3 并行——V3 主要新增 `userCodeSlice`（自定义代码、Worker 产物、沙箱状态），正好作为一个新 slice 接入，验证 slice 模式的可扩展性。

---

### 阶段 5：性能优化（按测量决定，可选）

**目标：** 在前 4 阶段结构稳定后，用 React DevTools Profiler 实测重渲染热点，按需优化。

**候选手段：**
- `useShallow` 包裹返回数组/对象的 selector（如 `selectedIndices`、`bookmarks`），避免引用变化导致的误渲染。
- `stats.ts` 改用前缀和预算（steps 变化时算一次，步进时 O(1) 查询），消除 P1。
- 大数据量（64 元素）下渲染帧率若低于 60，考虑 `React.memo` 子组件 + canvas 双缓冲。

**纪律：** 不盲目优化——先测，有数据再动。每项优化单独一个 commit，可独立回退。

**风险：** 低（可观测驱动，无行为变更）。

---

## 4. 重构与 V3 的衔接

| V3 需求 | 重构提供的支撑 |
|---------|---------------|
| 用户代码生成的 Step[] 喂给播放器 | 阶段 3 的 `usePlaybackClock` 可复用；StepPlayer.reset 已接受 Step[] |
| 自定义代码沙箱状态管理 | 阶段 4 的 slice 模式——新增 `userCodeSlice` 即可 |
| 沙箱内 compare/swap/mark 调用 | 阶段 1 的纯函数（stats/challenge）可被 Worker 内复用 |
| CodeMirror 编辑器面板 | 阶段 2 的子组件拆分让 Workspace 布局更灵活，新增 `CodeEditorPanel` 不挤压 Controls |

**建议节奏：** V3 启动前完成阶段 1+2+3；阶段 4 与 V3 并行推进；阶段 5 视 V3 落地后的实测决定。

---

## 5. 工作量估算

| 阶段 | 预估 | 是否阻塞 V3 |
|------|------|-------------|
| 1 抽 helper + 单测 | 0.5 天 | 是（安全网） |
| 2 拆子组件 | 1 天 | 是（结构清晰后才好接 V3） |
| 3 抽 hook | 0.5 天 | 是（引擎复用） |
| 4 store slice | 1-1.5 天 | 否（可并行 V3） |
| 5 性能 | 0.5 天（按需） | 否 |

合计约 3-4 天，其中 2 天为 V3 前置必做。

---

## 6. 验收：行为对齐冒烟用例

> 每个阶段结束后，人工跑一遍以下场景，行为必须与重构前**完全一致**。任何差异即视为该阶段未完成。

1. **播放**：选冒泡排序 → ▶ 播放 → 中途 ⏸ → ⏭ 单步 → ⏮ 后退 → 到末尾自动停。
2. **数据**：改数据量 4→64 → 随机 → 自定义输入 `3,1,4,1,5,9` 回车 → 重置。
3. **对比**：开对比 → 换对比算法 → 播放时主/对比同步推进 → 关对比。
4. **手动**：开手动 → 点两个元素 → 正确则前进 / 错误则提示 → 关手动恢复播放。
5. **挑战**：开挑战 → 交换若干次 → 排序完成触发胜利 → 结果显示用时/次数 vs 算法参考值。
6. **书签**：在某步加书签 → 编辑注释 → 进度条出现标记 → 点书签跳转 → 导出 JSON 到剪贴板 → 删书签。
7. **分享**：点分享 → URL 复制 → 新窗口粘贴打开 → 算法/数据/步数恢复。
8. **焦点**：按 F 隐藏侧栏 → 再按恢复。
9. **快捷键**：Space/←/→/F/? 各自生效；输入框内按键不触发快捷键。

**自动化补充：** `npm run lint`（oxlint）+ `npx tsc --noEmit`（TS6 strict）每阶段必须 0 error。

---

## 7. 风险与对策

| 风险 | 对策 |
|------|------|
| 重构破坏手动校验/挑战胜利检测等微妙逻辑 | 阶段 1 先抽纯函数 + 单测；每阶段跑 §6 冒烟 |
| slice 间隐式 `get()` 耦合 | 阶段 4 显式化为参数传递，`rebuildSteps(state, algo, data)` |
| useEffect 依赖项/闭包陈旧值 | hook 内一律用 `getState()` 取最新值，不依赖闭包捕获 |
| 拆子组件时 props 漏传 | 逐个子组件迁移 + 即时冒烟，不做批量搬运 |
| 重构挤占 V3 时间 | 阶段 1+2+3 限定 2 天内完成；阶段 4+5 不阻塞 V3 |

---

_本方案与 V1/V2/V3 技术方案并排存放，作为 V3 前置的结构性准备。重构的边界是"不改对外行为、不改架构范式（仍是 Zustand 单 store + 三段管线），只做内部关注点分离"。_
