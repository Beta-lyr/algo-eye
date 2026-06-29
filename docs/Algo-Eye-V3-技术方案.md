# Algo Eye V3 — 技术方案

> 方向:用户自定义代码可视化(让用户写自己的算法代码,引擎录制步骤并复用现有渲染器播放)
>
> 前置状态:V1 引擎 + 12 算法已稳定;V2 已全量落地(36 算法、9 渲染器、对比/手动/书签/分享/挑战/Learn/Tutorial/成就/WebGL/3D)

---

## 0. 结论先行

V3 主攻一件事:**把"步骤来源"从预制生成器换成用户自己写的代码**。用户在编辑器里写算法,调用一个 `viz` API(`viz.compare(i,j)` / `viz.swap(i,j)` / `viz.mark(i,'sorted')` …),API 内部往同一个 `Step[]` 里录制步骤,现有 `StepPlayer` 照常回放、`ArrayRenderer` 照常绘制、控制栏/CRT/统计零改动。

这是项目初心"看算法跑,让逻辑可见"的终极延伸——从 36 个预制 demo 扩展到任意用户代码。市面同类(visualgo / algorithm-visualizer)只可视化预制算法;Python Tutor 做用户代码但是文本式执行流,不是 Canvas 动画 + CRT 风。你卡在这个空档。

**复用度判断(基于读过的真实代码)**:`StepPlayer.reset(steps: Step[])` 已是接收入参步骤数组的入口,`Renderer.draw(ctx, snap, opts)` 是纯函数,`Step.snapshot` 只含可序列化的 number/数组/对象。这意味着把步骤来源从 `Algorithm.generate` 换成"Worker 跑用户代码产出的 `Step[]`",引擎侧几乎不动。95% 复用是事实判断,非夸张。

---

## 1. 核心设计:viz API 录制契约

这是 V3 的心脏。用户代码不直接碰数组,而是通过 `viz` 对象操作——每次调用录制一个 `Step`(含完整 `snapshot`),与现有 `bubbleSort.ts` 里 `yield { ... snapshot: snap(arr, states) }` 的模型完全同构。

### 1.1 API 定义

```ts
// src/playground/vizApi.ts
import type { Step, Snapshot, ElementState, StepType } from '../engine/types';

export interface VizApi {
  // —— 录制操作(每次调用 = 一个 Step)——
  compare(i: number, j: number): void;          // 标记 i,j 为 compare
  swap(i: number, j: number): void;             // 交换并标记 swap
  set(i: number, value: number): void;          // 赋值并标记 current
  mark(i: number, state: ElementState): void;   // 标记持久状态(如 'sorted')
  pointer(i: number, label: string): void;      // 打指针标签(如 'pivot')
  visit(i: number): void;                        // 标记 visit(搜索/图)
  log(message: string): void;                    // 自由文本步骤(不改数据)
  done(): void;                                  // 完成,全部标记 sorted
  // —— 读取(不录制)——
  value(i: number): number;
  readonly length: number;
}
```

### 1.2 录制模型的关键决策

**viz 拥有数据,用户不直接持有数组**(判断)。`viz.swap(i,j)` 内部既改数组又录快照,保证"数据状态"与"录制点"原子一致。用户只通过 `viz.value(i)` / `viz.length` 读数据。

权衡:这限制了用户自由(不能写 `arr[i] = x`),但对"算法可视化"场景这是**特性而非缺陷**——显式 API 调用本身就是教学要点,且杜绝了"用户改了数据但忘记录制"导致快照错乱。代价是写法比原生 JS 略啰嗦,用模板 + 示例弥补。

### 1.3 实现骨架(贴合现有 `snap()` 逻辑)

```ts
export function createViz(data: number[], steps: Step[]): VizApi {
  const arr = [...data];
  const persist: Record<number, ElementState> = {};   // 持久状态(如 sorted),与 bubbleSort 的 sortedIndices 同理

  const snap = (states: Record<number, ElementState>, pointers?: Record<number, string>): Snapshot => ({
    kind: 'array',
    data: [...arr],
    states: { ...persist, ...states },
    ...(pointers ? { pointers } : {}),
  });
  const rec = (type: StepType, indices: number[], line: number | undefined, message: string,
               states: Record<number, ElementState>, pointers?: Record<number, string>) =>
    steps.push({ type, indices, line, message, snapshot: snap(states, pointers) });

  return {
    compare(i, j) { rec('compare', [i, j], line, `比较 [${i}]=${arr[i]} 与 [${j}]=${arr[j]}`, { [i]: 'compare', [j]: 'compare' }, { [i]: 'i', [j]: 'j' }); },
    swap(i, j)    { [arr[i], arr[j]] = [arr[j], arr[i]]; rec('swap', [i, j], line, `交换 [${i}] ↔ [${j}]`, { [i]: 'swap', [j]: 'swap' }); },
    set(i, v)     { arr[i] = v; rec('set', [i], line, `设置 [${i}] = ${v}`, { [i]: 'current' }); },
    mark(i, s)    { persist[i] = s; rec('mark', [i], line, `标记 [${i}] → ${s}`, { [i]: s }); },
    pointer(i, l) { rec('pointer', [i], line, `指针 [${i}] = ${l}`, {}, { [i]: l }); },
    visit(i)      { persist[i] = 'visit'; rec('visit', [i], line, `访问 [${i}]`, { [i]: 'visit' }); },
    log(m)        { rec('pointer', [], line, m, {}); },
    done()        { for (let k = 0; k < arr.length; k++) persist[k] = 'sorted'; rec('done', [], line, '完成', {}); },
    value(i)      { return arr[i]; },
    get length()  { return arr.length; },
  };
}
```

> 注:`line` 在 V3.1 为 `undefined`(用执行轨迹面板代替行高亮);V3.2 经 AST 插桩写入真实行号。

---

## 2. 执行架构:Web Worker 沙箱

用户代码必须在主线程外执行,否则死循环会冻死 UI。

### 2.1 通信协议

```ts
// main → worker
type RunRequest = { type: 'run'; code: string; data: number[]; dataKind: DataKind };

// worker → main
type RunResponse =
  | { type: 'steps'; steps: Step[]; dataKind: DataKind }     // 成功
  | { type: 'error'; message: string; line?: number }        // 语法/运行时错误
  | { type: 'progress'; count: number };                      // 步数上报(超限预警)
```

`Step` 只含可序列化字段(number / number[] / Record),`postMessage` 无需特殊处理——这是现有契约的额外红利。

### 2.2 Worker 执行流程

1. 接收 `{code, data, dataKind}`。
2. `createViz(data, steps)` 构造录制实例。
3. 用 `Function` 构造器把用户代码包成 `function(viz){ <用户代码> }`,再把 `viz` 传入调用——用户代码以 `viz` 为唯一外部依赖。
4. `try { fn(viz) } catch(e) { postError(e) }`。
5. 成功则 `post({type:'steps', steps, dataKind})`。

### 2.3 安全与资源限制(判断,需注意)

- **隔离**:Worker 天然无 DOM/`localStorage`;用 Blob URL 创建 Worker,加 CSP 禁 `fetch`/`importScripts`,只暴露 `viz` + 数学原语。
- **超时**:主线程发 `run` 时起 5s 计时器,超时 `worker.terminate()` 并报"执行超时"。
- **步数上限**:录制到 `MAX_STEPS = 10000` 时 viz API 抛 `StepLimitError`,防止 O(n²) 大数据爆内存(呼应 V1 §3.2 已标记的快照内存风险)。
- **数据规模上限**:n ≤ 64(与现有可编辑数据一致)。

---

## 3. 代码编辑器:CodeMirror 6

**选 CodeMirror 6,不选 Monaco**(判断)。Monaco 约 2MB+,会撑大静态站体积、拖慢首屏;CodeMirror 6 按需约 150KB,API 更现代,足够写算法片段。

- 语言:`@codemirror/lang-javascript`
- 主题:自定义 CRT 主题(磷光绿关键字、暗底),与现有 `terminal.css` token 对齐
- 行号槽:V3.2 用于当前行高亮装饰(由 `step.line` 驱动)
- 模板:按 `dataKind` 提供 starter(如 array 模板内置一个冒泡排序骨架,引导用户改写)

---

## 4. 与现有引擎的集成

### 4.1 复用清单(零改动)

| 现有模块 | V3 复用方式 |
|---|---|
| `StepPlayer` | `reset(workerSteps)` 即可回放 |
| `AnimationController` | 不动,照常驱动 `stepForward` |
| `ArrayRenderer` / `GridRenderer` / `StringRenderer` | 按 `dataKind` 选,`draw` 不动 |
| `Controls` | 播放/暂停/单步/调速/跳转全复用 |
| `StatsPanel` | 比较次数/交换次数/步数照常统计(从 `Step.type` 聚合) |
| `CrtOverlay` | 不动 |

### 4.2 接入点:Playground 作为新"来源"

现有 `Workspace` 从 `useVizStore` 读 `currentAlgo` → 跑 `generate` → `reset(steps)`。V3 加一个并列来源:用户代码。最小侵入做法——在 `useVizStore` 增加 `runCustomCode(code, data, dataKind)`:该方法起 Worker、收 `steps`、调 `reset(steps)` 并切换 `dataKind`。`Workspace` 渲染逻辑不动,只是步骤来源多了个入口。

新增 `src/pages/Playground.tsx`(或 Workspace 内 tab 模式):左 = viz API 速查 + 模板,中 = 画布 + 控制栏(全复用),右 = CodeMirror 编辑器(V3.1) / 编辑器+行高亮(V3.2)。

### 4.3 行同步的两阶段策略(判断,降风险)

V3.1 不做编辑器行级高亮,改为右栏编辑器下方一个**执行轨迹面板**:按顺序列 `compare(3,4)` / `swap(3,4)` / `mark(6,sorted)` …,当前步琥珀高亮,与 `StepPlayer` 同步。终端风天然契合,且零 AST 复杂度。

V3.2 用 `acorn`(~100KB)解析用户代码,遍历 AST 找所有 `viz.X(...)` 调用节点,按其起始行号插桩重写为 `viz.X(..., __line)`,`viz` API 末参收 `line` 写入 `Step.line`,CodeMirror 据此做行装饰高亮。语法错误直接被 acorn 拦截上报。

---

## 5. 目录结构(新增)

```
src/
├── playground/               # V3 新增
│   ├── vizApi.ts             # VizApi 接口 + createViz
│   ├── worker.ts             # Web Worker 入口(执行用户代码)
│   ├── workerClient.ts       # 主线程侧 Worker 管理(发 run / 收 steps / 超时)
│   ├── lineInstrument.ts     # V3.2:acorn AST 插桩
│   ├── templates.ts          # 各 dataKind 的 starter 模板
│   └── protocol.ts           # RunRequest / RunResponse 类型
├── components/
│   └── CodeEditor.tsx        # CodeMirror 6 包装
│   └── TracePanel.tsx        # V3.1 执行轨迹面板
├── pages/
│   └── Playground.tsx        # 自定义代码页
└── store/useVizStore.ts      # 增加 runCustomCode()
```

新增依赖:`@codemirror/state` `@codemirror/view` `@codemirror/lang-javascript` `@codemirror/commands`;V3.2 再加 `acorn`。

---

## 6. 分期里程碑

| 里程碑 | 内容 | 验收 | 周期 |
|---|---|---|---|
| **V3.1** | viz API + Worker 沙箱 + CodeMirror 编辑器 + array 类 + run-to-completion + 执行轨迹面板;复用 StepPlayer/ArrayRenderer/Controls | 用户写冒泡(经 viz API)→ 运行 → 看柱状图动画 + 轨迹同步 | 2 周 |
| **V3.2** | acorn 行插桩 → 编辑器当前行高亮 + 流式步骤(Worker 增量 postMessage,`StepPlayer.append`) + 语法/运行时错误终端式上报 | 编辑器行与动画同步;死循环 5s 超时提示 | 1.5 周 |
| **V3.3** | 扩 dataKind:string(经 StringRenderer 写 KMP)、grid(经 GridRenderer 写 BFS/Dijkstra 自定义地图) | 字符串/图类自定义代码可跑 | 1.5 周 |
| **V3.4** | 模板示例库 + URL 分享(编码用户代码)+ localStorage 存草稿 + 内置"挑战题"(给数据,用户写算法,判定正确性) | 可分享自定义代码链接;3-5 道挑战题 | 1 周 |

---

## 7. 风险与对策

- **沙箱逃逸/死循环**:Worker + 5s 超时 + `MAX_STEPS=10000` + CSP 禁网络。(判断,可控)
- **行同步准确性**:V3.1 先用轨迹面板绕开;V3.2 acorn 插桩是稳健方案,语法错误即拦截。(分阶段降险)
- **用户代码产出非法 snapshot**:viz API 独占 snapshot 构造,用户无法直接造,从根上杜绝。(工程红利)
- **异步步骤 vs 同步引擎**:V3.1 run-to-completion 完全契合现有 `reset`;V3.2 流式需给 `StepPlayer` 加 `append(steps)`,改动局部。(判断)
- **编辑器体积**:CodeMirror 6 按需 ~150KB,守住静态站轻量。(事实)
- **学习曲线**:模板 + viz API 速查 + 示例库;API 故意收窄到 8 个方法。(对策)
- **与 V2 对比/挑战模式重叠**:V2 挑战是"手动拖拽比速度",V3 是"写代码看自己的逻辑跑",定位不同,不冲突。(澄清)

---

## 8. 明确不做(V3 范围外)

- 不做用户代码自动识别任意 JS 控制流并录制(viz API 显式录制是 MVP 的刻意约束;自动插桩是更远的未来)。
- 不做账号/云端保存(V3.4 用 localStorage 已够;后端等决定产品化再说)。
- 不做 tree/graph 类自定义代码(树结构用户难以手写;V3.3 只到 string/grid)。
- 不做多语言(Python/Java)用户代码——JS 单语言起步,降低沙箱与编辑器复杂度。

---

## 附:与 V1/V2 的衔接

V1 建引擎、V2 铺广度与交互。V3 不再铺广度,而是把引擎的"步骤来源"从预制生成器泛化到任意用户代码——这是一次**抽象层级提升**:V2 里"新增算法 = 实现一个 `Algorithm.generate`",V3 里"新增算法 = 用户在浏览器里写一段调用 viz API 的代码"。引擎、渲染器、控制栏一行不改,这正是 V1 §5.8"扩展路径"承诺的最终兑现。
