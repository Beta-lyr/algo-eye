# 算法可视化学习网站 — 前端设计与技术方案

> 风格:Phosphor Terminal(终端 CRT 复古风) ｜ 范围:纯前端静态站 ｜ MVP:单品类深做(排序先行) ｜ 交互:标准控制 + 可编辑数据
>
> 视觉稿:`outputs/algo-viz-ui-mockup.html`(已确认)

---

## 0. 结论先行

一句话方案:用 **React + TypeScript + Vite + Canvas 2D**,把每个算法抽象成"生成器产出步骤序列 → 引擎回放 → 渲染器按状态色绘制"的三段式管线,UI 套终端 CRT 风格。新增一个算法只需实现一个 `Algorithm` 接口、挑一个现成 `Renderer`,引擎与控制栏零改动——这是整套架构的 payoff,也是项目能从"排序深做"平滑扩展到"图/树/DP"的关键。

下面分四块展开:**设计系统 → 项目架构 → 技术选型 → 实现方案**,末尾给里程碑与风险。

---

## 1. 设计系统:Phosphor Terminal

### 1.1 设计理念(为什么终端 CRT 适合算法可视化)

这是**判断**,不是事实,但逻辑链是:算法的本质是代码与逻辑执行 → 终端是代码的原生载体 → 因此终端风与"看算法跑"在语义上天然合一,代码区、柱状图、步骤说明同处一个视觉语言里,不割裂。同时终端 CRT 在当下 Web 里辨识度极高、几乎无"AI 生成味"(去渐变、去毛玻璃、去紫粉渐变),符合"演示效果是灵魂、不要太大众化"的诉求。

代价(已权衡):长时间高对比绿字略费眼,需靠**控制对比度 + 不滥用辉光 + 文字保持 AA 对比度**缓解;CRT 特效在大画布上有性能成本,见 §5.6 与 §7。

### 1.2 色彩 Token

| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#0a0e0a` | 画布/页面底(略带绿调的近黑) |
| `--bg-panel` | `#0d130d` | 面板底 |
| `--bg-panel-raised` | `#101710` | 顶/底栏渐变 |
| `--border` | `#1f2a1f` | 面板边框 |
| `--border-bright` | `#2f4a2f` | 悬停/聚焦边框 |
| `--green` | `#33ff66` | 磷光主色:正文、默认元素 |
| `--green-dim` | `#5cb574` | 次要文字 |
| `--green-faint` | `#2e5e3e` | 弱文字/标签 |
| `--amber` | `#ffb000` | 强调:当前代码行、比较中、聚焦 |
| `--red` | `#ff5555` | 交换中/错误 |
| `--cyan` | `#00e5ff` | 已排序/锁定/信息 |
| `--purple` | `#b388ff` | 已访问(图算法) |
| `--pink` | `#ff79c6` | 轴点(快排)/关键字 |
| `--green-soft` | `#00e676` | 路径/成功 |

**唯一性约束**:全站只有"磷光绿 + 琥珀"两个主调色,其余颜色是**算法状态语义色**(见 §1.6),不是装饰色。这是对抗"AI 味"的纪律——任何紫粉渐变、毛玻璃、霓虹虹彩一律禁止。

### 1.3 字体

- 主字族:`'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace`(等宽,代码与 UI 统一)
- 终端显示字:`'VT323'`(仅用于 logo / 大号数字 / 算法标题,营造 CRT 字形感)
- 字号:正文 14px,代码 13px,标签 11px(大写 + 字间距 0.12em),终端大字 20–26px
- 行高:文本 1.5,代码 1.4
- 所有标题大写、加字间距——这是"终端感"的核心来源之一

### 1.4 间距与栅格

4px 基线尺: `4 / 8 / 12 / 16 / 24 / 32 / 48`。面板内边距 14–18px,控件间 8–14px。布局栅格:左栏 230px / 中栏自适应 / 右栏 340px,底栏 56px、顶栏 48px。

### 1.5 组件规范

- **面板 Panel**:深底 + 1px `--border` + 可选扫描线叠层 + 内辉光。标题栏 11px 大写弱色。
- **按钮 Button**:等宽大写、描边式(无填充);主操作用琥珀描边;悬停=更亮辉光。**不用**圆角胶囊和填充渐变。
- **代码面板 CodePanel**:绿字黑底,行号弱色,当前行琥珀底 + 左边框 + 辉光;关键字/函数名/数字/注释分色(粉/青/亮绿/弱绿)。
- **画布 Canvas**:主角。暗底 + 40px 网格线(极弱绿)+ 元素用状态色 + `shadowBlur` 辉光。
- **控制栏 Controls**:播放/暂停/单步/速度滑块(琥珀滑块)/数据量输入/随机/自定义数据/重置。
- **徽章 Badge**:描边式,展示时间/空间复杂度、稳定性。

### 1.6 算法状态色映射(关键)

这是可视化网站的语义骨架,所有渲染器共用:

| 状态 | 色 | 语义 |
|---|---|---|
| `default` | 磷光绿 | 未处理 |
| `compare` | 琥珀 | 正在比较 |
| `swap` | 红 | 正在交换 |
| `sorted` | 青 | 已就位/锁定 |
| `visit` | 紫 | 已访问(图/搜索) |
| `current` | 琥珀 | 当前指针/前沿 |
| `path` | 亮绿 | 最短路径/解 |
| `pivot` | 粉 | 轴点(快排) |

设计纪律:状态色不可挪作装饰;同一时刻一个元素只有一个状态(状态机互斥)。

### 1.7 动效与 CRT 特效

- **磷光淡入**:元素出现时辉光从弱到强(bloom)。
- **扫描线漂移**:一条 140px 柔光带缓慢下扫(纯 CSS,`prefers-reduced-motion` 下关)。
- **柱体过渡**:高度/颜色 0.25s `cubic-bezier(.2,.8,.2,1)`,带辉光拖尾。
- **CRT 叠层**:固定层 = 重复线性渐变扫描线 + 径向暗角,`mix-blend-mode:multiply`,极弱闪烁。
- 代码行高亮切换瞬时,不做缓动(代码同步要"咔哒"感,不要"滑"感)。

### 1.8 暗色唯一性

**判断**:CRT 风格只做暗色,不提供亮色模式。理由:亮色会摧毁磷光辉光与扫描线的全部表现力,做了等于自废武功。代价是失去"亮色偏好"用户,但对一个以演示效果为灵魂的站点是合理取舍——标记为**需你确认**。

---

## 2. UI 布局与页面

### 2.1 主工作区(已在视觉稿中落地)

顶栏(logo + 导航 + LIVE 状态) / 左栏(算法目录树) / 中栏(算法标题 + 复杂度徽章 + 画布 + 图例) / 右栏(代码 + 当前步骤 + 统计) / 底栏(控制栏)。这套布局是所有算法的统一壳,换算法只换中右栏内容。

### 2.2 关键页面

1. **Landing**:ASCII logo + 一句标语 + 一个自动循环的排序动画当 hero(纯展示)+ 算法分类入口卡。CTA:"进入终端"。
2. **工作区**:上述主布局,核心页。
3. **算法说明**(可选,工作区内抽屉或子页):伪代码 + 复杂度 + 适用场景 + 常见误用。

**判断**:MVP 只做工作区 + 极简 Landing,说明页推迟——先把"跑起来好看"做到极致。

### 2.3 响应式

桌面优先。≤980px 时三栏纵向堆叠(目录→画布→代码),导航折叠;移动端关闭扫描线漂移与闪烁以省电、降干扰。算法可视化本质是桌面体验,移动端做"能看不卡"即可,不追求等价交互。

---

## 3. 项目架构

### 3.1 总体分层

```
┌─────────────────────────────────────────────┐
│  UI 层(React 组件)                          │
│  Topbar / Tree / VizStage / CodePanel /      │
│  Controls / Stats / Legend                   │
├─────────────────────────────────────────────┤
│  可视化引擎层(框架无关,纯 TS)              │
│  StepPlayer(回放) / Renderer 接口 /         │
│  AnimationController(时钟)                   │
├─────────────────────────────────────────────┤
│  算法层(纯函数,无 DOM)                      │
│  Algorithm 接口 / 各算法生成器 + 元数据      │
├─────────────────────────────────────────────┤
│  数据/状态层(Zustand)                       │
│  store:currentAlgo / data / stepIndex /      │
│  playing / speed / input 校验                │
└─────────────────────────────────────────────┘
```

核心思想:**算法与动画解耦**。算法只负责"我要做哪些步",引擎负责"按速度回放这些步",渲染器负责"把某一步的状态画出来"。三者通过 `Step` 与 `Snapshot` 两个数据契约连接。

### 3.2 核心抽象:Step 录制与回放

这是整套架构的心脏,展开说明推理:

**问题**:动画要支持播放/暂停/单步/调速/跳转/反向,如果算法直接操作 Canvas(像你贴的示例那样 `await sleep` 里画图),就无法跳转和反向,也无法调速重放。

**解法**:把算法执行抽象成"步骤序列"。算法以**生成器函数**运行,每一步 `yield` 一个 `Step`;引擎把步骤收集成数组,再由 `StepPlayer` 按速度回放。这样:暂停=停时钟;调速=改时钟周期;单步=推进一帧;跳转=直接定位到第 k 步。

```ts
type StepType = 'compare'|'swap'|'set'|'visit'|'mark'|'pointer'|'done';

interface Step {
  type: StepType;
  indices?: number[];      // 受影响元素下标
  values?: number[];       // 相关值
  line?: number;           // 对应代码行(供 CodePanel 高亮)
  message?: string;        // 当前步骤说明(右栏)
  snapshot: Snapshot;      // 该步结束时数据完整状态
}

interface Snapshot {
  kind: 'array'|'grid'|'tree'|'graph';
  data: number[] | Cell[][] | TreeNode | GraphData;
  states: Record<number|string, State>;  // 元素id→状态色
}
```

**反向回放的关键权衡**(判断,需注意):要支持"上一步",有两种策略:
- (a) **每步存快照**:跳转/反向 O(1),内存 O(步数)。n≤64 时步数通常几百到几千,完全可接受。
- (b) **从起点重跑到目标**:零额外内存,但反向跳转要重算,大图上慢。

MVP 选 (a),因为数据量小、实现简单。**风险**:图算法/大网格步数可能上万,内存膨胀——到 M4 图算法阶段若 n 大,切到 (b) 或"关键帧+增量"。已在 §7 标记。

### 3.3 目录结构

```
algo-viz/
├── src/
│   ├── components/            # UI 层
│   │   ├── Topbar.tsx
│   │   ├── AlgorithmTree.tsx
│   │   ├── VizStage.tsx
│   │   ├── CodePanel.tsx
│   │   ├── Controls.tsx
│   │   ├── StatsPanel.tsx
│   │   └── crt/CrtOverlay.tsx
│   ├── engine/               # 引擎层(框架无关)
│   │   ├── StepPlayer.ts
│   │   ├── AnimationController.ts
│   │   └── types.ts          # Step / Snapshot / State
│   ├── algorithms/           # 算法层
│   │   ├── types.ts          # Algorithm 接口
│   │   ├── sorting/
│   │   │   ├── bubbleSort.ts
│   │   │   ├── quickSort.ts
│   │   │   └── ...
│   │   ├── searching/
│   │   ├── graph/
│   │   └── index.ts          # 算法注册表
│   ├── renderers/            # 渲染器层
│   │   ├── Renderer.ts       # 接口
│   │   ├── ArrayRenderer.ts  # 排序/搜索柱状图
│   │   ├── GridRenderer.ts   # 图算法网格
│   │   └── TreeRenderer.ts
│   ├── store/                # 状态层
│   │   └── useVizStore.ts
│   ├── styles/
│   │   └── terminal.css      # CRT 主题 + Prism 主题
│   ├── pages/
│   │   ├── Workspace.tsx
│   │   └── Landing.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/
└── package.json
```

### 3.4 关键接口

```ts
// 算法层:新增算法只实现这个
interface Algorithm {
  id: string;
  name: string;
  category: 'sorting'|'searching'|'graph'|'data-structure';
  complexity: { time: string; space: string; stable?: boolean };
  codeLines: string[];                 // 供 CodePanel 显示
  dataKind: Snapshot['kind'];          // 决定用哪个 Renderer
  generate(data: number[]): Generator<Step>;  // 步骤生成器
  defaultData?: number[];
}

// 渲染器层:每种数据形态一个
interface Renderer<TSnapshot> {
  draw(ctx: CanvasRenderingContext2D, snap: TSnapshot, opts: DrawOpts): void;
}

// 引擎层:回放器
class StepPlayer {
  constructor(steps: Step[], renderer: Renderer, canvas: HTMLCanvasElement);
  play(): void; pause(): void;
  stepForward(): void; stepBack(): void;
  seek(index: number): void;
  setSpeed(x: number): void;
  onStep(cb: (step: Step) => void): void;  // 驱动 CodePanel/Stats
}
```

### 3.5 数据流

用户点"播放" → `store.playing=true` → `AnimationController` 按速度发 tick → `StepPlayer` 推进 `stepIndex` → 取 `steps[stepIndex].snapshot` → 调 `renderer.draw(ctx, snapshot)` → 画布更新;同时 `onStep` 回调把 `step.line`/`step.message` 推给 `CodePanel`/`StatsPanel`。用户改数据 → 校验 → 重跑生成器收 step → `player.reset(newSteps)`。

---

## 4. 技术选型

### 4.1 选型表

| 维度 | 选型 | 备选 | 理由(判断) |
|---|---|---|---|
| 框架 | **React 18 + TS** | Vue 3 | 生态、算法可视化开源参考多(visualgo/algoviz 均 React),TS 在 Step/Renderer 契约上防错收益大 |
| 构建 | **Vite** | CRA | 快、现代、配置少;CRA 已过时 |
| 动画引擎 | **Canvas 2D** | WebGL / p5.js | MVP 排序/搜索/网格图 Canvas2D 足够且简单;WebGL 留给 M4 大图(见下) |
| 代码高亮 | **Prism.js + 自定义 CRT 主题** | Shiki | Prism 轻、同步、易做行高亮与 CRT 配色;Shiki 令牌更准但异步且重 |
| 状态管理 | **Zustand** | Redux/Context | 状态就那几个(算法/数据/步号/速度),Redux 过重,Context 易触发多余渲染 |
| 样式 | **CSS Modules + 终端主题 CSS** | Tailwind | CRT 特效(扫描线/辉光/混合模式)用原生 CSS 更直白;组件量不大,Tailwind 收益有限 |
| 路由 | **React Router** | — | Landing / Workspace(/algo/:id) |
| 部署 | **Vercel / GitHub Pages** | — | 纯静态,零后端 |

### 4.2 三个关键决策的权衡展开

**① Canvas 2D vs WebGL(判断)**:Canvas 2D 对柱状图、网格、树节点完全够用,开发与调试成本低,辉光用 `shadowBlur` 即可。WebGL 的优势在数千节点流畅渲染与 3D——MVP 用不上。**但**架构上 `Renderer` 是接口,排序/网格用 Canvas2D 渲染器,将来图算法节点上千时可加一个 `WebglGraphRenderer` 实现同一接口,引擎不动。这是"先简后扩"的典型取舍。**风险标记**:若你后期想做大规模图或 3D 树,WebGL 迁移有工作量,但不是阻塞。

**② 生成器 + 步骤数组 vs 直接动画(事实+判断)**:你贴的示例是"算法里直接 `await sleep` 画图"——简单但无法暂停/调速/跳转/反向。业界主流算法可视化站(visualgo 等)都是步骤录制式。生成器写法对算法实现者最自然(几乎照搬伪代码),收集成数组后支持随机访问。这是事实层面的更优,不只是偏好。

**③ Prism vs Shiki(判断,偏主观)**:选 Prism 因它轻、同步、行高亮简单、自定义主题就是改几条 CSS token。Shiki 视觉更接近 VS Code,但它是异步加载、包体大,对"小段算法代码"性价比低。若你后期要展示多语言复杂代码可换 Shiki。

### 4.3 明确不选什么

- **不选 p5.js**:Canvas 2D 已能覆盖,引第三方库反而少对渲染细节的控制(CRT 辉光要自己调)。
- **不选后端/数据库**:已与你确认纯前端静态站。账号/进度留到验证有需求再加。
- **不选 Tailwind**:CRT 特效靠原生 CSS 与混合模式更直接。
- **不选Redux**:状态简单,Zustand 足够。

---

## 5. 具体实现技术方案

### 5.1 可视化引擎

**AnimationController(时钟)**:用 `requestAnimationFrame` + 累积时间。每个 tick 累加 dt,当累积 ≥ `interval(=baseMs / speed)` 时推进一步并清零累积。暂停=停止 RAF 循环。调速=改 `interval`。注意:速度很高时一帧可能推多步,要 `while` 消费完累积。

**StepPlayer(回放)**:持 `steps[]` 与 `stepIndex`。`stepForward` 推进并触发渲染;`stepBack` 退一步用 `steps[index-1].snapshot`;`seek` 直接定位。`onStep` 回调驱动右栏代码行与统计。DPR 适配:`canvas` 实际像素 = CSS 尺寸 × `devicePixelRatio`,`ctx.scale(dpr,dpr)`。

### 5.2 算法步骤录制(生成器)

```ts
// algorithms/sorting/bubbleSort.ts
export const bubbleSort: Algorithm = {
  id:'bubble-sort', name:'冒泡排序', category:'sorting',
  complexity:{ time:'O(n²)', space:'O(1)', stable:true },
  dataKind:'array',
  codeLines:[ /* 与 CodePanel 一一对应的源码 */ ],
  *generate(arr){
    const a=[...arr]; const n=a.length;
    for(let i=0;i<n-1;i++){
      for(let j=0;j<n-1-i;j++){
        yield { type:'compare', indices:[j,j+1], line:4,
                message:`比较 a[${j}]=${a[j]} 与 a[${j+1}]=${a[j+1]}`,
                snapshot:snap(a,{[j]:'compare',[j+1]:'compare'}) };
        if(a[j]>a[j+1]){
          [a[j],a[j+1]]=[a[j+1],a[j]];
          yield { type:'swap', indices:[j,j+1], line:5,
                  message:`交换 a[${j}] ↔ a[${j+1}]`,
                  snapshot:snap(a,{[j]:'swap',[j+1]:'swap'}) };
        }
      }
      yield { type:'mark', indices:[n-1-i], line:2,
              snapshot:snap(a,{[n-1-i]:'sorted'}) };
    }
    yield { type:'done', snapshot:snap(a, allSorted(a)) };
  }
};
```

`snap()` 是工具:把数组 + 状态 map 打包成 `Snapshot`,并继承上一步的 `sorted` 状态(已锁定的不丢)。这一步很关键,否则排序尾部的"已就位"色会丢。

### 5.3 渲染器

**ArrayRenderer(排序/搜索)**:遍历 `snapshot.data`,按 `states[i]` 选色,画柱(高度按值/max),`ctx.shadowBlur=8` + `shadowColor=状态色` 做辉光,顶上标值、底下标下标。比较的下标上方画 `j`/`j+1` 指针小标。

**GridRenderer(图算法)**:按 `cellSize` 画格子,墙=`--bg`、空=`--bg-panel`、已访问=紫、前沿=琥珀、路径=亮绿、起终点特殊标。Dijkstra 每步点亮已访问格。

**TreeRenderer**:递归布局(中序定位 x,层定位 y),节点圆 + 连线,高亮当前访问节点。

所有渲染器**纯函数**:`draw(ctx, snapshot)` 不改状态,同一 snapshot 永远画出同一帧——这是跳转/反向能正确工作的前提。

### 5.4 代码同步

每个算法给 `codeLines:string[]`,每个 `Step.line` 指向要高亮的行号(从 0 或 1,统一约定)。`CodePanel` 收到 `onStep` 后把 `.cur` 类移到对应行。用 Prism 对 `codeLines` 做一次高亮(静态),行高亮是独立的 CSS 类叠加,不重跑 Prism。

### 5.5 可编辑数据

- **数组类**:输入框 `42,17,88,3`,解析→校验(4–64 个、数值范围、非空)→`setData`→重跑生成器→`player.reset(steps)` 回到第 0 步。校验失败在输入框下显示红色终端提示。
- **图类**:网格编辑器——点击格子切换墙/空,拖拽设起终点,改完即时重建 steps。

### 5.6 CRT 特效实现

- 扫描线/暗角:`.crt-overlay` 固定层,`pointer-events:none`,`repeating-linear-gradient` + `radial-gradient`,`mix-blend-mode:multiply`。
- 辉光:Canvas 元素用 `ctx.shadowBlur`/`shadowColor`;DOM 文字用 `text-shadow` 多层。
- 漂移扫描带:`.crt-sweep` 用 `top` 动画。
- **`prefers-reduced-motion`**:关 sweep/闪烁,保留状态色;这是无障碍底线。

### 5.7 首个端到端实现:冒泡排序(M1 交付物)

从零到跑通的顺序:
1. `engine/types.ts` 定义 `Step/Snapshot/State`。
2. `algorithms/sorting/bubbleSort.ts` 写生成器 + `codeLines` + 元数据。
3. `renderers/ArrayRenderer.ts` 实现 `draw`。
4. `engine/StepPlayer` + `AnimationController` 实现回放。
5. `store/useVizStore` 串起 currentAlgo/data/stepIndex/playing/speed。
6. UI 组件:VizStage(画布)+ CodePanel + Controls + Stats。
7. `CrtOverlay` 套上特效。
8. 打通:选冒泡→随机 16 个数→播放→看柱子按状态色动、代码行同步高亮、步骤说明滚动、统计累加。

这条线打通后,引擎就是成品,后续算法基本只动 `algorithms/` 目录。

### 5.8 扩展路径(为什么这套架构值钱)

新增"快速排序"= 写一个 `quickSort.ts` 实现 `Algorithm` 接口 + 复用 `ArrayRenderer`。新增"Dijkstra"= 写 `dijkstra.ts` + 复用/扩展 `GridRenderer`。**引擎、控制栏、代码面板、统计、CRT 特效全部零改动**。这是"单品类深做"能平滑滑向"全品类"的根本保障。

---

## 6. 里程碑与分期

| 里程碑 | 内容 | 验收 |
|---|---|---|
| **M1**(第 1 周) | 冒泡排序端到端打通(引擎+渲染器+控制+代码同步+CRT) | 播放/暂停/单步/调速/随机数据全可用,代码行同步 |
| **M2**(第 2 周) | 再加 5 个排序(选择/插入/快速/归并/堆)+ 可编辑数据 + 重置 | 6 个排序共用同一引擎,自定义数据可跑 |
| **M3**(第 3 周) | 搜索(线性/二分)+ 数据结构(链表/栈/二叉树)→ 新渲染器 | ArrayRenderer 复用 + TreeRenderer 上线 |
| **M4**(第 4 周) | 图算法(BFS/DFS/Dijkstra)网格编辑 + 墙/起终点 | GridRenderer + 网格编辑器,路径动画 |
| **M5** | Landing 页、性能优化、reduced-motion、部署上线 | Vercel/GitHub Pages 可访问 |

---

## 7. 风险与对策

- **CRT 特效性能**:扫描线叠层是 CSS 几乎零成本;`shadowBlur` 在数百元素时可能掉帧。对策:大 n 关辉光、 capped 元素数、reduced-motion 兜底。(判断)
- **眼疲劳/对比度**:高对比绿字久看累。对策:正文用 `--green-dim` 而非纯绿、辉光不滥用、保证文字 AA 对比度。(需注意)
- **步骤内存膨胀**:图算法步数可能上万,快照策略吃内存。对策:M4 切"关键帧+增量"或重算策略。已标记 §3.2。(判断,届时再决)
- **移动端体验**:CRT 在小屏弱化。对策:降级为"能看不卡",不追求等价交互。(判断)
- **风格跑偏/"AI 味"回流**:开发中易手痒加渐变/毛玻璃。对策:§1.2 的色彩纪律 + 设计走查(可用产品设计套件的 `/设计走查` 在 M1 后自检)。(纪律)
- **TS 类型契约维护**:`Step/Snapshot` 是联合类型,新增数据形态要扩 `kind`。对策:接口先行、注册表集中管理。(工程)

---

## 附:与原始思路的差异说明

你贴的思路方向完全正确,本方案在其基础上做了三处**判断性调整**(均已说明理由):算法不再直接 `await sleep` 画图,改为步骤录制(换取跳转/调速/反向);明确 Canvas 2D 起步、WebGL 留接口(降 MVP 风险);UI 套终端 CRT 设计系统并固化为 token(保证扩展时不走样)。技术栈与你思路一致(React + Canvas + 代码高亮),未做无谓替换。
