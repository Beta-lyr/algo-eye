// ============================================================
// 算法讲解内容 — 每个算法的详细说明
// 用于 /algo/:id/learn 页面
// ============================================================

export interface AlgorithmExplanation {
  /** 算法 ID */
  id: string;
  /** 概述 */
  overview: string;
  /** 核心思想 */
  coreIdea: string;
  /** 复杂度分析 */
  complexityAnalysis: string;
  /** 适用场景 */
  useCases: string[];
  /** 常见误用 */
  pitfalls: string[];
  /** 变体与改进 */
  variants: string[];
  /** 关键步骤 */
  keySteps: string[];
}

const explanations: Record<string, AlgorithmExplanation> = {
  // ===== 排序算法 =====
  'bubble-sort': {
    id: 'bubble-sort',
    overview: '冒泡排序是最简单的排序算法之一，通过重复遍历数组，比较相邻元素并交换位置，使较大的元素逐渐"冒泡"到数组末尾。',
    coreIdea: '每一轮遍历中，比较相邻元素，如果顺序错误就交换。经过 n-1 轮后，数组有序。',
    complexityAnalysis: '时间复杂度 O(n²)，因为需要两层嵌套循环。空间复杂度 O(1)，只使用常数额外空间。是稳定排序。',
    useCases: ['教学演示', '小规模数据（n < 50）', '几乎有序的数组（优化后可提前终止）'],
    pitfalls: ['大规模数据效率极低', '不适用于生产环境'],
    variants: ['鸡尾酒排序（双向冒泡）', '优化冒泡（检测是否已有序）'],
    keySteps: ['外层循环控制轮数', '内层循环比较相邻元素', '如果 arr[j] > arr[j+1] 则交换', '每轮结束，最大元素归位'],
  },

  'selection-sort': {
    id: 'selection-sort',
    overview: '选择排序每轮从未排序区间选择最小元素，放到已排序区间的末尾。',
    coreIdea: '维护已排序和未排序两个区间，每轮从未排序区间找最小值，与未排序区间的第一个元素交换。',
    complexityAnalysis: '时间复杂度 O(n²)，无论输入如何都需要 O(n²) 次比较。空间复杂度 O(1)。不稳定排序。',
    useCases: ['小规模数据', '交换成本高的场景（因为每轮最多交换一次）', '嵌入式系统（内存受限）'],
    pitfalls: ['大规模数据效率低', '不稳定（相等元素可能改变相对顺序）'],
    variants: ['双向选择排序（同时找最大和最小）'],
    keySteps: ['维护已排序区间边界', '遍历未排序区间找最小值', '将最小值与未排序区间首元素交换', '已排序区间边界右移'],
  },

  'insertion-sort': {
    id: 'insertion-sort',
    overview: '插入排序将每个元素插入到已排序区间的正确位置，类似于整理扑克牌。',
    coreIdea: '从第二个元素开始，将当前元素插入到前面已排序区间的正确位置。',
    complexityAnalysis: '平均时间复杂度 O(n²)，最好情况 O(n)（已排序数组）。空间复杂度 O(1)。稳定排序。',
    useCases: ['小规模数据（n < 50）', '几乎有序的数组', '作为高级排序算法的子过程（如 TimSort）', '在线排序（边接收边排序）'],
    pitfalls: ['大规模数据效率低'],
    variants: ['二分插入排序（用二分查找找插入位置）', '希尔排序（缩小增量排序）'],
    keySteps: ['从第二个元素开始', '保存当前元素为 key', '将 key 与已排序区间从右到左比较', '将大于 key 的元素右移', '将 key 插入正确位置'],
  },

  'quick-sort': {
    id: 'quick-sort',
    overview: '快速排序是分治算法的经典应用，通过选择一个基准元素（pivot）将数组分为两部分，递归排序。',
    coreIdea: '选择一个 pivot，将小于 pivot 的元素放左边，大于 pivot 的元素放右边，然后递归处理左右两部分。',
    complexityAnalysis: '平均时间复杂度 O(n log n)，最坏情况 O(n²)（已排序数组且选首元素为 pivot）。空间复杂度 O(log n)（递归栈）。不稳定排序。',
    useCases: ['通用排序', '大规模数据', '内存受限场景（原地排序）'],
    pitfalls: ['最坏情况性能差（可通过随机选择 pivot 避免）', '递归深度可能导致栈溢出'],
    variants: ['三路快排（处理大量重复元素）', '内省排序（检测到退化时切换到堆排序）', '随机化快排'],
    keySteps: ['选择 pivot', '分区操作：将数组分为 <pivot 和 >pivot 两部分', '将 pivot 放到正确位置', '递归排序左右两部分'],
  },

  'merge-sort': {
    id: 'merge-sort',
    overview: '归并排序是稳定的分治排序算法，将数组递归拆分为单个元素，然后合并为有序数组。',
    coreIdea: '递归拆分数组直到每个子数组只有一个元素，然后将两个有序子数组合并为一个有序数组。',
    complexityAnalysis: '时间复杂度稳定为 O(n log n)。空间复杂度 O(n)（需要额外数组）。稳定排序。',
    useCases: ['需要稳定排序的场景', '链表排序', '外部排序（数据在磁盘上）', '并行计算'],
    pitfalls: ['需要 O(n) 额外空间', '小规模数据不如插入排序'],
    variants: ['自底向上归并（迭代实现）', 'TimSort（Python 默认排序，结合归并和插入）'],
    keySteps: ['递归拆分数组为两半', '递归排序左右两半', '合并两个有序子数组', '合并时使用双指针比较'],
  },

  'heap-sort': {
    id: 'heap-sort',
    overview: '堆排序利用堆数据结构进行排序，先建堆然后反复取出堆顶元素。',
    coreIdea: '将数组构建成最大堆，然后反复将堆顶（最大值）与末尾元素交换并调整堆。',
    complexityAnalysis: '时间复杂度稳定为 O(n log n)。空间复杂度 O(1)（原地排序）。不稳定排序。',
    useCases: ['需要保证最坏情况性能的场景', '嵌入式系统', '优先队列实现'],
    pitfalls: ['不稳定', '缓存不友好（跳跃访问数组）'],
    variants: ['Smoothsort', '斐波那契堆'],
    keySteps: ['构建最大堆 O(n)', '将堆顶与末尾元素交换', '堆大小减一', '对堆顶执行下沉操作', '重复直到堆大小为 1'],
  },

  'shell-sort': {
    id: 'shell-sort',
    overview: '希尔排序是插入排序的改进版，通过设置不同的增量（gap）对间隔元素进行插入排序。',
    coreIdea: '先对间隔较大的元素排序，然后逐步缩小间隔，最终进行间隔为 1 的插入排序。大间隔排序能让元素快速接近正确位置。',
    complexityAnalysis: '时间复杂度取决于增量序列，一般为 O(n^1.3) 到 O(n^2)。空间复杂度 O(1)。不稳定排序。',
    useCases: ['中等规模数据', '嵌入式系统', '作为更复杂排序的替代方案'],
    pitfalls: ['性能依赖增量序列选择', '不稳定'],
    variants: ['Knuth 增量序列 (1, 4, 13, 40, ...)', 'Sedgewick 增量序列', 'Hibbard 增量序列'],
    keySteps: ['选择增量序列', '对每个增量进行间隔插入排序', '逐步缩小增量', '最终进行普通插入排序（gap=1）'],
  },

  'radix-sort': {
    id: 'radix-sort',
    overview: '基数排序按位排序，从最低位到最高位（LSD）或从最高位到最低位（MSD），使用稳定排序作为子过程。',
    coreIdea: '将整数按位数切割成不同的数字，然后按每个位数分别比较。从最低位开始，逐位排序直到最高位。',
    complexityAnalysis: '时间复杂度 O(nk)，k 是最大数的位数。空间复杂度 O(n+k)。稳定排序（使用稳定的子排序）。',
    useCases: ['整数排序', '固定长度的字符串排序', '当 k 较小时比比较排序更快'],
    pitfalls: ['只适用于整数或可转换为整数的数据', '当 k 很大时效率不如比较排序'],
    variants: ['LSD 基数排序（最低位优先）', 'MSD 基数排序（最高位优先）'],
    keySteps: ['找到最大数确定位数', '从最低位开始', '对当前位使用计数排序', '移动到更高位', '重复直到最高位'],
  },

  'counting-sort': {
    id: 'counting-sort',
    overview: '计数排序是非比较排序算法，通过统计每个值出现的次数来排序。',
    coreIdea: '统计每个值出现的次数，然后根据计数结果将元素放到正确位置。',
    complexityAnalysis: '时间复杂度 O(n+k)，k 是值域范围。空间复杂度 O(k)。稳定排序。',
    useCases: ['值域范围较小的整数排序', '作为基数排序的子过程', '需要稳定排序且值域有限'],
    pitfalls: ['当 k 很大时空间消耗大', '只适用于整数'],
    variants: ['原地计数排序'],
    keySteps: ['统计每个值出现的次数', '计算累计计数（确定每个值的位置范围）', '从后往前遍历原数组', '根据累计计数放置元素'],
  },

  'bucket-sort': {
    id: 'bucket-sort',
    overview: '桶排序将元素分配到不同的桶中，每个桶内单独排序，最后合并。',
    coreIdea: '将数据分布到有限数量的桶中，每个桶分别排序（可用其他排序算法），然后按顺序合并。',
    complexityAnalysis: '平均时间复杂度 O(n+k)，k 是桶的数量。最坏情况 O(n²)（所有元素在一个桶里）。空间复杂度 O(n+k)。稳定排序（桶内使用稳定排序）。',
    useCases: ['均匀分布的数据', '浮点数排序', '外部排序'],
    pitfalls: ['数据分布不均匀时性能退化', '需要预估数据分布'],
    variants: ['Proxmap 排序', '样本排序'],
    keySteps: ['确定桶的数量和范围', '将元素分配到对应桶', '每个桶内排序', '按顺序合并所有桶'],
  },

  // ===== 搜索算法 =====
  'linear-search': {
    id: 'linear-search',
    overview: '线性搜索是最简单的搜索算法，从数组的第一个元素开始逐个检查，直到找到目标或遍历完整个数组。',
    coreIdea: '逐个比较每个元素与目标值，找到即返回。',
    complexityAnalysis: '时间复杂度 O(n)，空间复杂度 O(1)。',
    useCases: ['无序数组', '小规模数据', '链表搜索', '只需搜索一次的场景'],
    pitfalls: ['大规模有序数组效率低（应使用二分搜索）'],
    variants: ['哨兵线性搜索（在末尾放置目标值避免边界检查）'],
    keySteps: ['从第一个元素开始', '比较当前元素与目标值', '如果相等则返回', '否则移动到下一个元素', '遍历完未找到则返回 -1'],
  },

  'binary-search': {
    id: 'binary-search',
    overview: '二分搜索在有序数组中通过不断缩小搜索范围来快速定位目标值。',
    coreIdea: '每次比较中间元素与目标值，如果目标值较小则搜索左半部分，否则搜索右半部分。',
    complexityAnalysis: '时间复杂度 O(log n)，空间复杂度 O(1)（迭代）或 O(log n)（递归）。要求数组有序。',
    useCases: ['有序数组搜索', '查找满足条件的边界值', '数值计算中的二分答案'],
    pitfalls: ['要求数组有序', '不适合频繁插入/删除的场景（应使用平衡二叉搜索树）'],
    variants: ['插值搜索', '指数搜索', '斐波那契搜索'],
    keySteps: ['初始化左右边界', '计算中间位置', '比较中间元素与目标值', '缩小搜索范围', '重复直到找到或范围为空'],
  },

  'jump-search': {
    id: 'jump-search',
    overview: '跳跃搜索在有序数组中按固定步长跳跃，找到目标值所在的区间后进行线性搜索。',
    coreIdea: '以 √n 为步长跳跃，找到 arr[step] > target 的位置后，在前一个块内线性搜索。',
    complexityAnalysis: '时间复杂度 O(√n)，介于线性搜索和二分搜索之间。空间复杂度 O(1)。',
    useCases: ['有序数组', '当跳跃成本低于比较成本时（如链表）'],
    pitfalls: ['要求数组有序', '性能不如二分搜索'],
    variants: ['块搜索'],
    keySteps: ['确定步长 √n', '按步长跳跃直到找到目标区间', '在区间内线性搜索', '返回结果'],
  },

  'interpolation-search': {
    id: 'interpolation-search',
    overview: '插值搜索是二分搜索的改进版，根据目标值在数据分布中的估算位置来选择搜索点。',
    coreIdea: '不是固定选择中间点，而是根据目标值与边界值的比例来估算位置，适用于均匀分布数据。',
    complexityAnalysis: '平均时间复杂度 O(log log n)（均匀分布），最坏 O(n)（分布极不均匀）。空间复杂度 O(1)。',
    useCases: ['均匀分布的有序数组', '电话簿、字典等场景'],
    pitfalls: ['数据分布不均匀时退化为线性搜索', '计算位置需要额外运算'],
    variants: ['递归插值搜索'],
    keySteps: ['估算目标值的位置 pos', '比较 arr[pos] 与目标值', '根据比较结果缩小范围', '重复直到找到或范围为空'],
  },

  'exponential-search': {
    id: 'exponential-search',
    overview: '指数搜索先指数扩展找到目标值所在的范围，然后在该范围内进行二分搜索。',
    coreIdea: '从 1 开始，每次将范围翻倍，直到找到大于目标值的位置，然后在上一个范围内二分搜索。',
    complexityAnalysis: '时间复杂度 O(log n)，空间复杂度 O(1)。适用于无界搜索。',
    useCases: ['无界或很大的有序数组', '不知道数组大小时', '目标值在数组前半部分时效率更高'],
    pitfalls: ['要求数组有序', '如果目标值在末尾，需要多次扩展'],
    variants: ['结合插值搜索'],
    keySteps: ['从索引 1 开始', '指数扩展：i = 1, 2, 4, 8, ...', '找到 arr[i] > target 的位置', '在 [i/2, i] 范围内二分搜索'],
  },

  // ===== 数据结构 =====
  'binary-search-tree': {
    id: 'binary-search-tree',
    overview: '二叉搜索树（BST）是一种有序二叉树，左子树所有节点值小于根节点，右子树所有节点值大于根节点。',
    coreIdea: '利用 BST 性质，每次比较可以排除一半的搜索空间。',
    complexityAnalysis: '平均操作 O(log n)，最坏 O(n)（退化为链表）。空间复杂度 O(n)。',
    useCases: ['动态集合操作（插入、删除、查找）', '实现关联数组', '优先队列'],
    pitfalls: ['可能退化为链表', '需要平衡机制（AVL、红黑树）'],
    variants: ['AVL 树', '红黑树', 'B 树', 'Splay 树'],
    keySteps: ['插入：比较并递归到左/右子树', '搜索：利用 BST 性质缩小范围', '删除：处理三种情况（叶子、单子、双子）'],
  },

  'heap': {
    id: 'heap',
    overview: '堆是一种完全二叉树，满足堆性质：最大堆中父节点值 ≥ 子节点值，最小堆反之。',
    coreIdea: '利用完全二叉树的数组表示，通过上浮和下沉操作维护堆性质。',
    complexityAnalysis: '插入 O(log n)，删除 O(log n)，查看最值 O(1)。建堆 O(n)。',
    useCases: ['优先队列', '堆排序', '图算法（Dijkstra、Prim）', 'Top-K 问题'],
    pitfalls: ['不适合查找任意元素', '不适合合并操作（应使用二项堆）'],
    variants: ['二项堆', '斐波那契堆', '配对堆'],
    keySteps: ['插入：放到末尾，上浮到正确位置', '删除最值：用末尾元素替换根，下沉', '上浮：与父节点比较并交换', '下沉：与较大的子节点比较并交换'],
  },

  'linked-list': {
    id: 'linked-list',
    overview: '链表是一种线性数据结构，元素通过指针连接，不要求内存连续。',
    coreIdea: '每个节点包含数据和指向下一个节点的指针，通过指针遍历访问元素。',
    complexityAnalysis: '插入/删除 O(1)（已知位置），搜索 O(n)。空间复杂度 O(n)。',
    useCases: ['频繁插入/删除的场景', '实现栈和队列', '图的邻接表表示', '哈希表的链地址法'],
    pitfalls: ['不支持随机访问', '额外指针空间开销', '缓存不友好'],
    variants: ['双向链表', '循环链表', '跳表'],
    keySteps: ['头插入：新节点指向原头节点', '尾插入：遍历到最后，新节点接在末尾', '删除：修改前驱节点的指针', '搜索：从头遍历'],
  },

  'hash-table': {
    id: 'hash-table',
    overview: '哈希表通过哈希函数将键映射到数组索引，实现接近 O(1) 的查找、插入和删除。',
    coreIdea: '使用哈希函数计算键的存储位置，通过冲突解决策略处理多个键映射到同一位置的情况。',
    complexityAnalysis: '平均 O(1) 查找/插入/删除，最坏 O(n)（所有键冲突）。空间复杂度 O(n)。',
    useCases: ['关联数组/字典', '缓存实现', '去重', '计数器'],
    pitfalls: ['哈希函数设计不当导致冲突多', '需要处理动态扩容', '无序'],
    variants: ['布谷鸟哈希', '一致性哈希', '布隆过滤器'],
    keySteps: ['计算哈希值：h = hash(key)', '取模得到索引：idx = h % size', '冲突解决：链地址法或开放寻址法', '动态扩容：装载因子过大时扩容'],
  },

  // ===== 图算法 =====
  'bfs': {
    id: 'bfs',
    overview: '广度优先搜索（BFS）从起点开始，逐层访问所有邻居节点，再访问邻居的邻居。',
    coreIdea: '使用队列维护待访问节点，保证按距离从近到远的顺序访问。',
    complexityAnalysis: '时间复杂度 O(V+E)，空间复杂度 O(V)。',
    useCases: ['无权图最短路径', '层序遍历', '连通分量检测', '二分图检测'],
    pitfalls: ['不适合有权图（应使用 Dijkstra）', '空间消耗大'],
    variants: ['双向 BFS', '0-1 BFS'],
    keySteps: ['将起点加入队列', '取出队首节点', '访问所有未访问的邻居', '将邻居加入队列', '重复直到队列为空'],
  },

  'dfs': {
    id: 'dfs',
    overview: '深度优先搜索（DFS）沿着一条路径尽可能深地搜索，然后回溯。',
    coreIdea: '使用栈（或递归）维护待访问节点，优先探索更深层的节点。',
    complexityAnalysis: '时间复杂度 O(V+E)，空间复杂度 O(V)。',
    useCases: ['拓扑排序', '连通分量检测', '环检测', '路径查找', '迷宫求解'],
    pitfalls: ['不保证最短路径', '递归实现可能导致栈溢出'],
    variants: ['迭代加深 DFS', 'IDA*'],
    keySteps: ['访问当前节点', '标记为已访问', '递归访问所有未访问的邻居', '回溯'],
  },

  'dijkstra': {
    id: 'dijkstra',
    overview: 'Dijkstra 算法用于求解非负权图的单源最短路径。',
    coreIdea: '维护一个优先队列，每次取出距离最小的节点，更新其邻居的距离。',
    complexityAnalysis: '时间复杂度 O((V+E)log V)（使用二叉堆），空间复杂度 O(V)。',
    useCases: ['非负权图最短路径', '路由算法', 'GPS 导航'],
    pitfalls: ['不能处理负权边（应使用 Bellman-Ford）', '不能处理负权环'],
    variants: ['A* 算法（加入启发式）', '双向 Dijkstra'],
    keySteps: ['初始化距离数组，起点为 0', '将起点加入优先队列', '取出距离最小的节点', '更新邻居距离', '重复直到队列为空或找到目标'],
  },

  'astar': {
    id: 'astar',
    overview: 'A* 算法是 Dijkstra 的改进版，使用启发式函数引导搜索方向，更快找到目标。',
    coreIdea: 'f(n) = g(n) + h(n)，其中 g(n) 是从起点到 n 的实际距离，h(n) 是从 n 到终点的估算距离。',
    complexityAnalysis: '时间复杂度取决于启发式函数，最好情况 O(E)，最坏退化为 Dijkstra。',
    useCases: ['游戏路径规划', '机器人导航', '地图导航'],
    pitfalls: ['启发式函数设计不当可能导致不是最短路径', '需要可接受的启发式（不高估）'],
    variants: ['IDA*', 'D*', 'Jump Point Search'],
    keySteps: ['初始化 openSet 和 gScore/fScore', '取出 fScore 最小的节点', '如果是目标则回溯路径', '更新邻居的 gScore 和 fScore', '将邻居加入 openSet'],
  },

  'bellman-ford': {
    id: 'bellman-ford',
    overview: 'Bellman-Ford 算法用于求解含负权边的单源最短路径，还能检测负权环。',
    coreIdea: '对所有边进行 V-1 轮松弛操作。如果第 V 轮还能松弛，说明存在负权环。',
    complexityAnalysis: '时间复杂度 O(VE)，空间复杂度 O(V)。',
    useCases: ['含负权边的图', '检测负权环', '汇率套利检测'],
    pitfalls: ['比 Dijkstra 慢', '不能处理负权环（但能检测）'],
    variants: ['SPFA（队列优化）'],
    keySteps: ['初始化距离数组', '进行 V-1 轮松弛', '每轮遍历所有边', '如果 dist[u] + w < dist[v] 则更新', '第 V 轮检查是否存在负权环'],
  },

  'prim': {
    id: 'prim',
    overview: 'Prim 算法用于求解最小生成树（MST），从一个顶点开始逐步扩展。',
    coreIdea: '维护一个已加入 MST 的顶点集合，每次选择连接已加入和未加入顶点的最小权重边。',
    complexityAnalysis: '时间复杂度 O(E log V)（使用优先队列），空间复杂度 O(V+E)。',
    useCases: ['网络布线', '聚类分析', '近似算法'],
    pitfalls: ['只适用于无向图', '需要连通图'],
    variants: ['Prim + 斐波那契堆 O(E + V log V)'],
    keySteps: ['选择一个起点', '将起点的所有边加入优先队列', '取出最小权重边', '如果另一端未加入 MST，则加入', '重复直到所有顶点都加入'],
  },

  'kruskal': {
    id: 'kruskal',
    overview: 'Kruskal 算法用于求解最小生成树（MST），按边权重从小到大选择不形成环的边。',
    coreIdea: '将所有边按权重排序，依次选择不形成环的边加入 MST，使用并查集检测环。',
    complexityAnalysis: '时间复杂度 O(E log E)（排序主导），空间复杂度 O(V+E)。',
    useCases: ['稀疏图的最小生成树', '聚类分析', '网络设计'],
    pitfalls: ['需要排序所有边', '并查集的常数因子'],
    variants: ['逆删除算法'],
    keySteps: ['将所有边按权重排序', '初始化并查集', '依次取出最小边', '如果两端不在同一连通分量则加入 MST', '使用并查集的 union 操作'],
  },

  // ===== 字符串匹配 =====
  'kmp': {
    id: 'kmp',
    overview: 'KMP（Knuth-Morris-Pratt）算法利用已匹配的信息避免回溯，实现 O(n+m) 的字符串匹配。',
    coreIdea: '预处理模式串计算 LPS（最长前缀后缀）数组，失配时根据 LPS 跳过不必要的比较。',
    complexityAnalysis: '时间复杂度 O(n+m)，空间复杂度 O(m)。',
    useCases: ['单模式串匹配', '文本编辑器的查找功能', '生物信息学中的序列匹配'],
    pitfalls: ['实现较复杂', '对于短模式串优势不明显'],
    variants: ['KMP 的改进版'],
    keySteps: ['计算 LPS 数组', '主串和模式串同时遍历', '匹配时两指针都前进', '失配时根据 LPS 跳过模式串指针', '模式串指针到达末尾则匹配成功'],
  },

  'rabin-karp': {
    id: 'rabin-karp',
    overview: 'Rabin-Karp 算法使用滚动哈希进行字符串匹配，适合多模式匹配。',
    coreIdea: '计算模式串的哈希值，然后在文本上滑动窗口计算子串哈希值，哈希匹配时再逐字符验证。',
    complexityAnalysis: '平均时间复杂度 O(n+m)，最坏 O(nm)（哈希冲突多）。空间复杂度 O(1)。',
    useCases: ['多模式串匹配', '抄袭检测', '文本搜索'],
    pitfalls: ['哈希冲突导致性能退化', '需要选择好的哈希函数'],
    variants: ['多模式 Rabin-Karp'],
    keySteps: ['计算模式串哈希值', '计算第一个窗口的哈希值', '滑动窗口更新哈希值（滚动哈希）', '哈希匹配时逐字符验证'],
  },

  'boyer-moore': {
    id: 'boyer-moore',
    overview: 'Boyer-Moore 算法从右向左比较模式串，利用坏字符规则和好后缀规则跳过不必要的比较。',
    coreIdea: '当发生失配时，根据失配字符在模式串中的位置，可以跳过多个字符。',
    complexityAnalysis: '最好时间复杂度 O(n/m)，最坏 O(nm)。实际应用中通常是亚线性的。',
    useCases: ['长文本中的模式匹配', '文本编辑器', 'grep 命令'],
    pitfalls: ['预处理开销较大', '短模式串优势不明显'],
    variants: ['Boyer-Moore-Horspool（只用坏字符规则）', 'Sunday 算法'],
    keySteps: ['预处理坏字符表', '预处理好后缀表', '从右向左比较', '失配时根据规则跳跃', '匹配成功则返回位置'],
  },

  // ===== 动态规划 =====
  'lcs': {
    id: 'lcs',
    overview: '最长公共子序列（LCS）问题：找到两个序列的最长公共子序列（不要求连续）。',
    coreIdea: 'dp[i][j] 表示 text1[0..i-1] 和 text2[0..j-1] 的 LCS 长度。如果 text1[i-1] = text2[j-1]，则 dp[i][j] = dp[i-1][j-1] + 1，否则取 dp[i-1][j] 和 dp[i][j-1] 的最大值。',
    complexityAnalysis: '时间复杂度 O(mn)，空间复杂度 O(mn)（可优化到 O(min(m,n))）。',
    useCases: ['diff 算法', 'DNA 序列比对', '版本控制'],
    pitfalls: ['空间复杂度高', '不适合超长序列'],
    variants: ['最长公共子串（要求连续）', '编辑距离'],
    keySteps: ['初始化 DP 表格', '填充第一行和第一列为 0', '逐行逐列填充', '字符相同则 dp[i][j] = dp[i-1][j-1] + 1', '否则取 max(dp[i-1][j], dp[i][j-1])', '回溯找到具体 LCS'],
  },

  'knapsack': {
    id: 'knapsack',
    overview: '0-1 背包问题：给定物品重量和价值，在容量限制下选择物品使总价值最大。',
    coreIdea: 'dp[i][w] 表示前 i 个物品在容量 w 下的最大价值。对于每个物品，选择放入或不放入。',
    complexityAnalysis: '时间复杂度 O(nW)，空间复杂度 O(nW)（可优化到 O(W)）。',
    useCases: ['资源分配', '投资组合优化', '任务调度'],
    pitfalls: ['当 W 很大时效率低', '伪多项式时间复杂度'],
    variants: ['完全背包（物品可重复选择）', '多重背包', '分组背包'],
    keySteps: ['初始化 DP 表格', '遍历每个物品', '遍历每个容量', '选择放入或不放入取最大值', '回溯找到选择的物品'],
  },

  'edit-distance': {
    id: 'edit-distance',
    overview: '编辑距离（Levenshtein Distance）：将一个字符串转换为另一个字符串所需的最少操作次数（插入、删除、替换）。',
    coreIdea: 'dp[i][j] 表示 word1[0..i-1] 转换为 word2[0..j-1] 的最少操作数。',
    complexityAnalysis: '时间复杂度 O(mn)，空间复杂度 O(mn)（可优化到 O(min(m,n))）。',
    useCases: ['拼写检查', 'DNA 序列比对', '模糊匹配', '自然语言处理'],
    pitfalls: ['空间复杂度高', '对于超长字符串效率低'],
    variants: ['Damerau-Levenshtein（增加换位操作）', '加权编辑距离'],
    keySteps: ['初始化 DP 表格', '第一列 dp[i][0] = i（删除）', '第一行 dp[0][j] = j（插入）', '字符相同则 dp[i][j] = dp[i-1][j-1]', '否则取 min(删除, 插入, 替换) + 1'],
  },
};

/** 获取算法讲解内容 */
export function getExplanation(id: string): AlgorithmExplanation | undefined {
  return explanations[id];
}

/** 获取所有算法 ID */
export function getAllExplanationIds(): string[] {
  return Object.keys(explanations);
}
