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
  },

  // 可视化区域
  viz: {
    title: '可视化',
    selectAlgo: '请选择一个算法',
    time: '时间',
    space: '空间',
    stable: '稳定',
    inPlace: '原地',
    yes: '✓',
    no: '✗',
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
