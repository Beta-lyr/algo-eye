// ============================================================
// 中文翻译
// ============================================================

export const zh: Record<string, any> = {
  // 通用
  common: {
    about: '关于',
    github: 'GITHUB',
    loading: '加载中...',
    ready: '就绪',
    apply: '应用',
    reset: '重置',
    cancel: '取消',
    confirm: '确认',
    switchLang: 'Switch to English',
  },

  // 顶栏
  topbar: {
    tagline: 'phosphor terminal for algorithms',
    live: 'LIVE',
    elements: '个元素',
  },

  // 导航分类
  nav: {
    sorting: '排序',
    searching: '搜索',
    graph: '图',
    'data-structure': '数据结构',
    string: '字符串',
    'dynamic-programming': '动态规划',
    playground: '自定义代码',
  },

  // 算法分类（详细）
  category: {
    sorting: '排序算法',
    searching: '搜索算法',
    graph: '图算法',
    'data-structure': '数据结构',
    string: '字符串匹配',
    'dynamic-programming': '动态规划',
  },

  // V3 Playground 自定义代码页
  playground: {
    apiRef: 'viz API 速查',
    editor: '代码编辑器',
    data: '数据',
    run: '▸ 运行',
    running: '运行中...',
    compareDesc: '比较 i,j',
    swapDesc: '交换 i,j',
    setDesc: '赋值 [i]=v',
    markDesc: '标记持久状态',
    pointerDesc: '打指针标签',
    visitDesc: '访问 i',
    logDesc: '自由文本步骤',
    doneDesc: '完成（全标记 sorted）',
    valueDesc: '读取 [i]',
    lengthDesc: '数据长度',
    errorLength: '数据长度须在 2-64 之间',
    errorNumber: '数据含非数字',
  },

  // Landing 页
  landing: {
    subtitle: 'Phosphor Terminal for Algorithms',
    tagline: '看算法跑，让逻辑可见',
    cta: '▸ 进入终端',
    footer: 'React + TypeScript + Canvas 2D · CRT 复古终端风格',
    algoCount: '{count} 个算法',
    categoryDesc: {
      sorting: '冒泡·选择·插入·快速·归并·堆·希尔·基数·计数·桶',
      searching: '线性·二分·跳跃·插值·指数',
      graph: 'BFS·DFS·Dijkstra·A*·Bellman-Ford·Prim·Kruskal',
      'data-structure': 'BST·堆·链表·哈希表',
      string: 'KMP·Rabin-Karp·Boyer-Moore',
      'dynamic-programming': 'LCS·背包·编辑距离',
    },
  },

  // 左侧面板
  tree: {
    title: '算法目录',
    hint: '/tree',
    diffAll: '全部',
    diffBeginner: '入门',
    diffIntermediate: '进阶',
    diffAdvanced: '高级',
    searchPlaceholder: '搜索算法…',
  },

  // 可视化区域
  viz: {
    title: '可视化',
    selectAlgo: '请选择一个算法',
    time: '时间',
    space: '空间',
    stable: '稳定',
    inPlace: '原地',
    yes: '是',
    no: '否',
    compareMode: '▸ 对比模式',
    focusMode: '焦点模式',
    fullscreen: '全屏',
    learn: '讲解',
    clickHint: '— 请点击对应的柱体',
    selectedHint: '已选中 [{i}], 请选择另一个',
    mainProgress: '主: {a}/{b} · 对比: {c}/{d}',
    trendTitle: '复杂度趋势',
    compares: '比较',
    swaps: '交换',
    challengeSwapCount: '交换 {n} 次',
  },

  // 图例
  legend: {
    // 图算法
    empty: '空地',
    wall: '墙',
    visited: '已访问',
    frontier: '前沿',
    path: '最短路径',
    // 排序算法
    unsorted: '未处理',
    comparing: '比较中',
    swapping: '交换中',
    sorted: '已排序',
  },

  // 代码面板
  code: {
    title: '代码',
    line: '行',
    selectAlgo: '选择算法以查看代码',
    currentStep: '当前步骤',
    ready: '▸ 就绪',
  },

  // 统计面板
  stats: {
    comparisons: '比较次数',
    swaps: '交换次数',
    currentStep: '当前步骤',
    totalSteps: '总步骤',
    visits: '访问次数',
    pathLength: '路径长度',
  },

  // 引导教程
  tutorial: {
    skip: '跳过',
    next: '下一步',
    start: '开始使用',
    step1Title: '欢迎使用 ALGO::VIZ',
    step1Desc: '这是一个终端风格的算法可视化学习工具。通过动画演示，帮助你直观理解各种算法的工作原理。',
    step2Title: '左侧面板 — 选择算法',
    step2Desc: '左侧目录树按分类排列了 36 种算法。点击任意算法即可切换到对应的可视化。支持搜索和难度过滤。',
    step3Title: '底部控制栏 — 播放控制',
    step3Desc: '使用 ▶ 按钮播放动画，⏮ ⏭ 单步前进/后退。进度条可点击跳转，还可以添加书签标记关键步骤。',
    step4Title: '键盘快捷键',
    step4Desc: 'Space 播放/暂停 · ← → 步进 · F 焦点模式 · ? 查看全部快捷键',
    step5Title: '深入理解',
    step5Desc: '点击标题栏的 ▸ 讲解按钮，查看算法的详细说明、复杂度分析和伪代码。',
  },

  // 讲解页
  learn: {
    notFound: '算法未找到',
    notFoundDesc: '请求的算法讲解页面不存在',
    backHome: '返回首页',
    home: '首页',
    viz: '可视化',
    sections: {
      overview: '概述',
      coreIdea: '核心思想',
      keySteps: '关键步骤',
      complexity: '复杂度分析',
      useCases: '适用场景',
      pitfalls: '常见误用',
      variants: '变体与改进',
      pseudoCode: '伪代码',
    },
    viewViz: '▸ 查看可视化演示',
  },

  // 手动模式提示
  hint: {
    noSelection: '该步骤无需选择下标',
    allDone: '已完成所有步骤！',
    correct: '[是] 正确！',
    wrong: '[否] 应为下标 [{i}] 的操作，请重试',
  },

  // 控制栏
  controls: {
    prev: '上一步',
    next: '下一步',
    play: '播放',
    pause: '暂停',
    speed: '速度',
    dataSize: '数据量',
    randomData: '随机数据',
    customData: '自定义数据: {data} (回车应用)',
    reset: '重置',
    bookmarkAdd: '添加书签',
    bookmarkRemove: '移除书签',
    bookmarkPlaceholder: '点击添加注释…',
    export: '导出',
    compareMode: '对比模式',
    manualMode: '手动模式',
    challengeMode: '挑战模式',
    challengeExit: '退出',
    swaps: '交换 {n} 次',
    screenshot: '截图',
    share: '分享链接',
    copied: '[已复制]',
    achievements: '成就',
    shortcuts: '快捷键',
    shortcutPanel: '键盘快捷键',
    shortcutPlay: '播放 / 暂停',
    shortcutPrev: '上一步',
    shortcutNext: '下一步',
    shortcutFocus: '焦点模式（全屏画布）',
    shortcutPanelToggle: '切换此面板',
    challengeResultTime: '你用时 {t} · 交换 {n} 次',
    challengeResultAlgo: '算法交换 {s} 次 · 比较 {c} 次',
  },

  // 算法名称（用于显示）
  algorithms: {
    'bubble-sort': '冒泡排序',
    'selection-sort': '选择排序',
    'insertion-sort': '插入排序',
    'quick-sort': '快速排序',
    'merge-sort': '归并排序',
    'heap-sort': '堆排序',
    'shell-sort': '希尔排序',
    'radix-sort': '基数排序',
    'counting-sort': '计数排序',
    'bucket-sort': '桶排序',
    'linear-search': '线性搜索',
    'binary-search': '二分搜索',
    'jump-search': '跳跃搜索',
    'interpolation-search': '插值搜索',
    'exponential-search': '指数搜索',
    'binary-search-tree': '二叉搜索树',
    'heap': '堆',
    'linked-list': '链表',
    'hash-table': '哈希表',
    'avl-tree': 'AVL 树',
    'red-black-tree': '红黑树',
    'bfs': '广度优先搜索',
    'dfs': '深度优先搜索',
    'dijkstra': 'Dijkstra 最短路径',
    'astar': 'A* 算法',
    'bellman-ford': 'Bellman-Ford',
    'prim': 'Prim MST',
    'kruskal': 'Kruskal MST',
    'floyd-warshall': 'Floyd-Warshall',
    'kmp': 'KMP 字符串匹配',
    'rabin-karp': 'Rabin-Karp',
    'boyer-moore': 'Boyer-Moore',
    'lcs': '最长公共子序列',
    'knapsack': '0-1 背包',
    'edit-distance': '编辑距离',
    'matrix-chain': '矩阵链乘法',
  },

  // 步骤消息模板
  steps: {
    compare: '比较 a[{i}]={a} 与 a[{j}]={b}',
    swap: '交换 a[{i}] ↔ a[{j}]',
    set: '设置 a[{i}] = {value}',
    markSorted: '标记 a[{i}] 已排序',
    visit: '访问节点 {node}',
    current: '当前节点 {node}',
    found: '找到目标！',
    notFound: '未找到目标',
    done: '排序完成！',
  },
} as const;
