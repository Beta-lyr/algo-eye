# 项目架构说明

## 目录结构

```
algo-eye/
├── src/
│   ├── components/          # React 组件
│   ├── pages/              # 页面组件
│   ├── hooks/              # 自定义 Hooks
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript 类型定义
│   ├── styles/             # 全局样式
│   ├── assets/             # 静态资源
│   ├── App.tsx             # 根组件（路由配置）
│   ├── main.tsx            # 入口文件
│   └── vite-env.d.ts       # Vite 类型声明
├── public/                 # 公共静态资源
├── docs/                   # 项目文档
├── .env.example           # 环境变量示例
├── index.html             # HTML 入口
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── tsconfig.app.json      # 应用 TypeScript 配置
├── tsconfig.node.json     # Node.js TypeScript 配置
├── vite.config.ts         # Vite 配置
└── .oxlintrc.json         # OxLint 配置
```

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: Zustand
- **代码高亮**: Prism.js
- **样式**: CSS Modules + 全局 CSS

## 命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

## 开发规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 样式使用 CSS Modules 或全局 CSS
- 遵循 ESLint/OxLint 规则
- 提交前运行 `npm run lint` 和 `npm run type-check`

## 环境变量

复制 `.env.example` 为 `.env.local` 并配置：

```bash
cp .env.example .env.local
```

## 下一步

根据 `docs/算法可视化网站-前端设计与技术方案.md` 实现具体业务代码。
