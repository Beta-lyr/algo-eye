# Algo Eye

> 算法可视化学习网站 · Phosphor Terminal 风格

一个终端 CRT 复古风格的算法可视化平台，让你"看算法跑，让逻辑可见"。

## ✨ 特性

- 🎨 **Phosphor Terminal 风格** — 磷光绿 + 琥珀主色调，CRT 扫描线与辉光特效
- 🔄 **三段式管线架构** — 算法生成器 → 引擎回放 → 渲染器绘制，解耦彻底
- 📊 **12 个算法** — 6 排序 + 2 搜索 + 1 数据结构 + 3 图算法
- 🎮 **完整控制** — 播放/暂停/单步/调速/跳转/反向回放
- ✏️ **可编辑数据** — 自定义输入数据，实时可视化
- 📱 **响应式** — 桌面优先，移动端可看
- ♿ **无障碍** — `prefers-reduced-motion` 下关闭动效

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📦 技术栈

- **框架**：React 19 + TypeScript 6（严格模式）
- **构建**：Vite 8
- **路由**：React Router v7
- **状态管理**：Zustand
- **代码高亮**：Prism.js（自定义 CRT 主题）
- **样式**：CSS Modules + 全局终端主题 CSS
- **Lint**：OxLint
- **部署**：Vercel / GitHub Pages（纯静态）

## 🏗️ 架构

```
┌─────────────────────────────────────────────┐
│  UI 层 (React 组件)                          │
│  Topbar / Tree / VizStage / CodePanel /      │
│  Controls / Stats / CrtOverlay               │
├─────────────────────────────────────────────┤
│  引擎层 (纯 TS，框架无关)                    │
│  StepPlayer / AnimationController            │
├─────────────────────────────────────────────┤
│  算法层 (纯函数，无 DOM)                      │
│  Algorithm 接口 + 各算法生成器                │
├─────────────────────────────────────────────┤
│  数据/状态层 (Zustand)                       │
│  useVizStore                                 │
└─────────────────────────────────────────────┘
```

**核心数据流**：算法 Generator yield Step → 引擎收集 Step[] → StepPlayer 回放 → Renderer 绘制 Canvas → onStep 驱动代码高亮与统计

## 📊 已实现算法

| 分类 | 算法 | 时间复杂度 |
|------|------|-----------|
| **排序** | 冒泡排序 | O(n²) |
| | 选择排序 | O(n²) |
| | 插入排序 | O(n²) |
| | 快速排序 | O(n log n) |
| | 归并排序 | O(n log n) |
| | 堆排序 | O(n log n) |
| **搜索** | 线性搜索 | O(n) |
| | 二分搜索 | O(log n) |
| **数据结构** | 二叉搜索树 | O(log n) 平均 |
| **图** | BFS | O(V+E) |
| | DFS | O(V+E) |
| | Dijkstra | O((V+E)log V) |

## 🎨 设计系统

### 色彩 Token

| Token | 值 | 用途 |
|-------|-----|------|
| `--green` | `#33ff66` | 磷光主色 |
| `--amber` | `#ffb000` | 强调色 |
| `--red` | `#ff5555` | 交换/错误 |
| `--cyan` | `#00e5ff` | 已排序/锁定 |
| `--purple` | `#b388ff` | 已访问 |
| `--pink` | `#ff79c6` | 轴点 |

### 算法状态色

| 状态 | 色 | 语义 |
|------|-----|------|
| `default` | 磷光绿 | 未处理 |
| `compare` | 琥珀 | 正在比较 |
| `swap` | 红 | 正在交换 |
| `sorted` | 青 | 已就位 |
| `visit` | 紫 | 已访问 |
| `path` | 亮绿 | 最短路径 |

### 设计纪律

- ✅ 只做暗色模式
- ✅ 磷光绿 + 琥珀双主色
- ✅ CRT 扫描线 + 辉光特效
- ❌ 禁止渐变、毛玻璃、霓虹虹彩

## 📁 项目结构

```
src/
├── components/        # UI 组件
├── engine/           # 可视化引擎
├── algorithms/       # 算法实现
├── renderers/        # 渲染器
├── store/            # Zustand 状态
├── styles/           # 样式
└── pages/            # 页面
```

## 🔧 添加新算法

```typescript
// 1. 创建算法文件 src/algorithms/sorting/mySort.ts
export const mySort: Algorithm = {
  id: 'my-sort',
  name: '我的排序',
  category: 'sorting',
  complexity: { time: 'O(n²)', space: 'O(1)' },
  codeLines: ['function sort(arr) {', '  // ...', '}'],
  dataKind: 'array',
  *generate(data) {
    // yield Step 对象
  }
};

// 2. 注册到 src/algorithms/index.ts
import { mySort } from './sorting/mySort';
export const algorithms = [/* ...existing */, mySort];
```

## 📚 文档

- [V1 技术方案](docs/算法可视化网站-前端设计与技术方案.md)
- [V2 迭代方案](docs/Algo-Eye-V2-技术方案.md)
- [UI 视觉稿](docs/algo-viz-ui-mockup.html)

## 📄 License

MIT

---

> **看算法跑，让逻辑可见。**
