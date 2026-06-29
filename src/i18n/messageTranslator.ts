// ============================================================
// 消息翻译器 — 将算法步骤消息翻译成目标语言
// 基于模式匹配，支持带参数的消息
// ============================================================

import type { Locale } from './index';

/** 消息模式翻译表 */
const MESSAGE_PATTERNS: Record<string, Record<Locale, string>> = {
  // 排序相关
  '开始冒泡排序': {
    zh: '开始冒泡排序',
    en: 'Starting Bubble Sort',
  },
  '开始快速排序': {
    zh: '开始快速排序',
    en: 'Starting Quick Sort',
  },
  '开始归并排序': {
    zh: '开始归并排序',
    en: 'Starting Merge Sort',
  },
  '开始选择排序': {
    zh: '开始选择排序',
    en: 'Starting Selection Sort',
  },
  '开始插入排序': {
    zh: '开始插入排序',
    en: 'Starting Insertion Sort',
  },
  '开始堆排序': {
    zh: '开始堆排序',
    en: 'Starting Heap Sort',
  },
  '开始希尔排序': {
    zh: '开始希尔排序',
    en: 'Starting Shell Sort',
  },
  '开始基数排序': {
    zh: '开始基数排序',
    en: 'Starting Radix Sort',
  },
  '开始计数排序': {
    zh: '开始计数排序',
    en: 'Starting Counting Sort',
  },
  '开始桶排序': {
    zh: '开始桶排序',
    en: 'Starting Bucket Sort',
  },
  '排序完成': {
    zh: '排序完成',
    en: 'Sorting complete',
  },
  '所有元素已按升序排列': {
    zh: '所有元素已按升序排列',
    en: 'All elements are sorted in ascending order',
  },
  // 搜索相关
  '开始线性搜索': {
    zh: '开始线性搜索',
    en: 'Starting Linear Search',
  },
  '开始二分搜索': {
    zh: '开始二分搜索',
    en: 'Starting Binary Search',
  },
  '开始跳跃搜索': {
    zh: '开始跳跃搜索',
    en: 'Starting Jump Search',
  },
  '开始插值搜索': {
    zh: '开始插值搜索',
    en: 'Starting Interpolation Search',
  },
  '开始指数搜索': {
    zh: '开始指数搜索',
    en: 'Starting Exponential Search',
  },
  '搜索完成': {
    zh: '搜索完成',
    en: 'Search complete',
  },
  '找到目标': {
    zh: '找到目标',
    en: 'Target found',
  },
  '未找到目标': {
    zh: '未找到目标',
    en: 'Target not found',
  },
  // 字符串匹配相关
  '开始 KMP 搜索': {
    zh: '开始 KMP 搜索',
    en: 'Starting KMP Search',
  },
  '开始 Rabin-Karp 搜索': {
    zh: '开始 Rabin-Karp 搜索',
    en: 'Starting Rabin-Karp Search',
  },
  '开始 Boyer-Moore 搜索': {
    zh: '开始 Boyer-Moore 搜索',
    en: 'Starting Boyer-Moore Search',
  },
  '找到匹配': {
    zh: '找到匹配',
    en: 'Match found',
  },
  '未找到匹配': {
    zh: '未找到匹配',
    en: 'No match found',
  },
  '计算 LPS': {
    zh: '计算 LPS',
    en: 'Computing LPS',
  },
  '构建坏字符表': {
    zh: '构建坏字符表',
    en: 'Building bad character table',
  },
  '哈希匹配': {
    zh: '哈希匹配',
    en: 'Hash match',
  },
  '滚动哈希': {
    zh: '滚动哈希',
    en: 'Rolling hash',
  },
  '坏字符规则': {
    zh: '坏字符规则',
    en: 'Bad character rule',
  },
  // 树结构相关
  '初始化空 AVL 树': {
    zh: '初始化空 AVL 树',
    en: 'Initialize empty AVL tree',
  },
  'AVL 树构建完成': {
    zh: 'AVL 树构建完成',
    en: 'AVL tree construction complete',
  },
  '旋转完成，树已恢复平衡': {
    zh: '旋转完成，树已恢复平衡',
    en: 'Rotation complete, tree rebalanced',
  },
  '旋转完成，树已平衡': {
    zh: '旋转完成，树已平衡',
    en: 'Rotation complete, tree balanced',
  },
  // 红黑树相关
  '初始化空红黑树': {
    zh: '初始化空红黑树',
    en: 'Initialize empty Red-Black tree',
  },
  '红黑树构建完成': {
    zh: '红黑树构建完成',
    en: 'Red-Black tree construction complete',
  },
  '父节点是根，设为黑色': {
    zh: '父节点是根，设为黑色',
    en: 'Parent is root, set to BLACK',
  },
  // Floyd-Warshall 相关
  'Floyd-Warshall 完成：所有节点对最短路径已计算': {
    zh: 'Floyd-Warshall 完成：所有节点对最短路径已计算',
    en: 'Floyd-Warshall complete: all-pairs shortest paths computed',
  },
};

/** 正则模式翻译 */
const REGEX_PATTERNS: Array<{
  pattern: RegExp;
  replacement: Record<Locale, string | ((match: RegExpMatchArray) => string)>;
}> = [
  // 第 N 轮：外层循环 i = X
  {
    pattern: /第 (\d+) 轮：外层循环 i = (\d+)/,
    replacement: {
      zh: '第 $1 轮：外层循环 i = $2',
      en: 'Round $1: outer loop i = $2',
    },
  },
  // 第 N 轮完成，arr[X]=Y 已就位
  {
    pattern: /第 (\d+) 轮完成，arr\[(\d+)\]=(\d+) 已就位/,
    replacement: {
      zh: '第 $1 轮完成，arr[$2]=$3 已就位',
      en: 'Round $1 complete, arr[$2]=$3 is in place',
    },
  },
  // 比较 arr[X]=Y 与 arr[Z]=W
  {
    pattern: /比较 arr\[(\d+)\]=(\d+) 与 arr\[(\d+)\]=(\d+)/,
    replacement: {
      zh: '比较 arr[$1]=$2 与 arr[$3]=$4',
      en: 'Compare arr[$1]=$2 with arr[$3]=$4',
    },
  },
  // 比较 arr[X]=Y < pivot=Z?
  {
    pattern: /比较 arr\[(\d+)\]=(\d+) < pivot=(\d+)\?/,
    replacement: {
      zh: '比较 arr[$1]=$2 < pivot=$3?',
      en: 'Compare arr[$1]=$2 < pivot=$3?',
    },
  },
  // 交换 arr[X] ↔ arr[Y]
  {
    pattern: /交换 arr\[(\d+)\] ↔ arr\[(\d+)\]/,
    replacement: {
      zh: '交换 arr[$1] ↔ arr[$2]',
      en: 'Swap arr[$1] ↔ arr[$2]',
    },
  },
  // 交换 arr[X]=Y ↔ arr[Z]=W
  {
    pattern: /交换 arr\[(\d+)\]=(\d+) ↔ arr\[(\d+)\]=(\d+)/,
    replacement: {
      zh: '交换 arr[$1]=$2 ↔ arr[$3]=$4',
      en: 'Swap arr[$1]=$2 ↔ arr[$3]=$4',
    },
  },
  // 分区 [X..Y]，pivot = arr[Z] = W
  {
    pattern: /分区 \[(\d+)\.\.(\d+)\]，pivot = arr\[(\d+)\] = (\d+)/,
    replacement: {
      zh: '分区 [$1..$2]，pivot = arr[$3] = $4',
      en: 'Partition [$1..$2], pivot = arr[$3] = $4',
    },
  },
  // 轴点 arr[X]=Y 归位
  {
    pattern: /轴点 arr\[(\d+)\]=(\d+) 归位/,
    replacement: {
      zh: '轴点 arr[$1]=$2 归位',
      en: 'Pivot arr[$1]=$2 in place',
    },
  },
  // n = X
  {
    pattern: /n = (\d+)/,
    replacement: {
      zh: 'n = $1',
      en: 'n = $1',
    },
  },
  // 增量 gap = X
  {
    pattern: /增量 gap = (\d+)/,
    replacement: {
      zh: '增量 gap = $1',
      en: 'Gap = $1',
    },
  },
  // 取出 arr[X] = Y，gap = Z
  {
    pattern: /取出 arr\[(\d+)\] = (\d+)，gap = (\d+)/,
    replacement: {
      zh: '取出 arr[$1] = $2，gap = $3',
      en: 'Take arr[$1] = $2, gap = $3',
    },
  },
  // 比较 arr[X]=Y > Z，右移
  {
    pattern: /比较 arr\[(\d+)\]=(\d+) > (\d+)，右移/,
    replacement: {
      zh: '比较 arr[$1]=$2 > $3，右移',
      en: 'Compare arr[$1]=$2 > $3, shift right',
    },
  },
  // 插入 arr[X] = Y
  {
    pattern: /插入 arr\[(\d+)\] = (\d+)/,
    replacement: {
      zh: '插入 arr[$1] = $2',
      en: 'Insert arr[$1] = $2',
    },
  },
  // 按X位排序，exp = Y
  {
    pattern: /按(.+)排序，exp = (\d+)/,
    replacement: {
      zh: '按$1排序，exp = $2',
      en: 'Sort by $1, exp = $2',
    },
  },
  // X位排序完成
  {
    pattern: /(.+)排序完成/,
    replacement: {
      zh: '$1排序完成',
      en: '$1 sort complete',
    },
  },
  // X位=Y，放置 arr[Z]=W 到位置 V
  {
    pattern: /(.+)=\d+，放置 arr\[(\d+)\]=(\d+) 到位置 (\d+)/,
    replacement: {
      zh: '$1，放置 arr[$2]=$3 到位置 $4',
      en: '$1, place arr[$2]=$3 at position $4',
    },
  },
  // 范围：min=X，max=Y，range=Z
  {
    pattern: /范围：min=(\d+)，max=(\d+)，range=(\d+)/,
    replacement: {
      zh: '范围：min=$1，max=$2，range=$3',
      en: 'Range: min=$1, max=$2, range=$3',
    },
  },
  // 范围：min=X，max=Y，桶数=Z
  {
    pattern: /范围：min=(\d+)，max=(\d+)，桶数=(\d+)/,
    replacement: {
      zh: '范围：min=$1，max=$2，桶数=$3',
      en: 'Range: min=$1, max=$2, buckets=$3',
    },
  },
  // 计数：X 出现 Y 次
  {
    pattern: /计数：(\d+) 出现 (\d+) 次/,
    replacement: {
      zh: '计数：$1 出现 $2 次',
      en: 'Count: $1 appears $2 times',
    },
  },
  // 累计计数完成
  {
    pattern: /累计计数完成/,
    replacement: {
      zh: '累计计数完成',
      en: 'Cumulative count complete',
    },
  },
  // 放置 X 到位置 Y
  {
    pattern: /放置 (\d+) 到位置 (\d+)/,
    replacement: {
      zh: '放置 $1 到位置 $2',
      en: 'Place $1 at position $2',
    },
  },
  // 将 X 放入桶 Y
  {
    pattern: /将 (\d+) 放入桶 (\d+)/,
    replacement: {
      zh: '将 $1 放入桶 $2',
      en: 'Put $1 into bucket $2',
    },
  },
  // 桶 X 排序完成：[Y]
  {
    pattern: /桶 (\d+) 排序完成：\[(.+)\]/,
    replacement: {
      zh: '桶 $1 排序完成：[$2]',
      en: 'Bucket $1 sorted: [$2]',
    },
  },
  // 写回 arr[X] = Y
  {
    pattern: /写回 arr\[(\d+)\] = (\d+)/,
    replacement: {
      zh: '写回 arr[$1] = $2',
      en: 'Write back arr[$1] = $2',
    },
  },
  // 合并 [X..Y] 与 [Z..W]
  {
    pattern: /合并 \[(\d+)\.\.(\d+)\] 与 \[(\d+)\.\.(\d+)\]/,
    replacement: {
      zh: '合并 [$1..$2] 与 [$3..$4]',
      en: 'Merge [$1..$2] with [$3..$4]',
    },
  },
  // 合并完成 [X..Y]
  {
    pattern: /合并完成 \[(\d+)\.\.(\d+)\]/,
    replacement: {
      zh: '合并完成 [$1..$2]',
      en: 'Merge complete [$1..$2]',
    },
  },
  // 搜索相关
  // 开始X搜索（数据已排序），目标值 target = Y
  {
    pattern: /开始(.+)搜索（数据已排序），目标值 target = (\d+)/,
    replacement: {
      zh: '开始$1搜索（数据已排序），目标值 target = $2',
      en: 'Starting $1 Search (sorted data), target = $2',
    },
  },
  // 开始X搜索（数据已排序且均匀分布），目标值 target = Y
  {
    pattern: /开始(.+)搜索（数据已排序且均匀分布），目标值 target = (\d+)/,
    replacement: {
      zh: '开始$1搜索（数据已排序且均匀分布），目标值 target = $2',
      en: 'Starting $1 Search (sorted & uniform data), target = $2',
    },
  },
  // 开始X搜索，目标值 target = Y
  {
    pattern: /开始(.+)搜索，目标值 target = (\d+)/,
    replacement: {
      zh: '开始$1搜索，目标值 target = $2',
      en: 'Starting $1 Search, target = $2',
    },
  },
  // 搜索区间 [X..Y]，mid = Z，arr[Z] = W
  {
    pattern: /搜索区间 \[(\d+)\.\.(\d+)\]，mid = (\d+)，arr\[(\d+)\] = (\d+)/,
    replacement: {
      zh: '搜索区间 [$1..$2]，mid = $3，arr[$4] = $5',
      en: 'Search range [$1..$2], mid = $3, arr[$4] = $5',
    },
  },
  // 搜索区间 [X..Y]，估算位置 pos = Z，arr[Z] = W
  {
    pattern: /搜索区间 \[(\d+)\.\.(\d+)\]，估算位置 pos = (\d+)，arr\[(\d+)\] = (\d+)/,
    replacement: {
      zh: '搜索区间 [$1..$2]，估算位置 pos = $3，arr[$4] = $5',
      en: 'Search range [$1..$2], estimated pos = $3, arr[$4] = $5',
    },
  },
  // 搜索完成，目标 X 位于下标 Y
  {
    pattern: /搜索完成，目标 (\d+) 位于下标 (\d+)/,
    replacement: {
      zh: '搜索完成，目标 $1 位于下标 $2',
      en: 'Search complete, target $1 at index $2',
    },
  },
  // 搜索完成，未找到目标值 X
  {
    pattern: /搜索完成，未找到目标值 (\d+)/,
    replacement: {
      zh: '搜索完成，未找到目标值 $1',
      en: 'Search complete, target $1 not found',
    },
  },
  // 检查 arr[X] = Y === Z?
  {
    pattern: /检查 arr\[(\d+)\] = (\d+) === (\d+)\?/,
    replacement: {
      zh: '检查 arr[$1] = $2 === $3?',
      en: 'Check arr[$1] = $2 === $3?',
    },
  },
  // 检查 arr[X] = Y < Z
  {
    pattern: /检查 arr\[(\d+)\] = (\d+) < (\d+)/,
    replacement: {
      zh: '检查 arr[$1] = $2 < $3',
      en: 'Check arr[$1] = $2 < $3',
    },
  },
  // arr[X] = Y ≠ Z，继续
  {
    pattern: /arr\[(\d+)\] = (\d+) ≠ (\d+)，继续/,
    replacement: {
      zh: 'arr[$1] = $2 ≠ $3，继续',
      en: 'arr[$1] = $2 ≠ $3, continue',
    },
  },
  // 跳跃：arr[X] = Y < Z，继续跳跃
  {
    pattern: /跳跃：arr\[(\d+)\] = (\d+) < (\d+)，继续跳跃/,
    replacement: {
      zh: '跳跃：arr[$1] = $2 < $3，继续跳跃',
      en: 'Jump: arr[$1] = $2 < $3, continue jumping',
    },
  },
  // 找到区间 [X..Y]，开始线性搜索
  {
    pattern: /找到区间 \[(\d+)\.\.(\d+)\]，开始线性搜索/,
    replacement: {
      zh: '找到区间 [$1..$2]，开始线性搜索',
      en: 'Found range [$1..$2], start linear search',
    },
  },
  // 指数扩展：i = X，arr[X] = Y ≤ Z
  {
    pattern: /指数扩展：i = (\d+)，arr\[(\d+)\] = (\d+) ≤ (\d+)/,
    replacement: {
      zh: '指数扩展：i = $1，arr[$2] = $3 ≤ $4',
      en: 'Exponential expansion: i = $1, arr[$2] = $3 ≤ $4',
    },
  },
  // 找到范围 [X..Y]，开始二分搜索
  {
    pattern: /找到范围 \[(\d+)\.\.(\d+)\]，开始二分搜索/,
    replacement: {
      zh: '找到范围 [$1..$2]，开始二分搜索',
      en: 'Found range [$1..$2], start binary search',
    },
  },
  // 二分搜索：区间 [X..Y]，mid = Z，arr[Z] = W
  {
    pattern: /二分搜索：区间 \[(\d+)\.\.(\d+)\]，mid = (\d+)，arr\[(\d+)\] = (\d+)/,
    replacement: {
      zh: '二分搜索：区间 [$1..$2]，mid = $3，arr[$4] = $5',
      en: 'Binary search: range [$1..$2], mid = $3, arr[$4] = $5',
    },
  },
  // arr[X] = Y < Z，搜索右半部分
  {
    pattern: /arr\[(\d+)\] = (\d+) < (\d+)，搜索右半部分/,
    replacement: {
      zh: 'arr[$1] = $2 < $3，搜索右半部分',
      en: 'arr[$1] = $2 < $3, search right half',
    },
  },
  // arr[X] = Y > Z，搜索左半部分
  {
    pattern: /arr\[(\d+)\] = (\d+) > (\d+)，搜索左半部分/,
    replacement: {
      zh: 'arr[$1] = $2 > $3，搜索左半部分',
      en: 'arr[$1] = $2 > $3, search left half',
    },
  },
  // ✓ 找到目标！arr[X] = Y
  {
    pattern: /✓ 找到目标！arr\[(\d+)\] = (\d+)/,
    replacement: {
      zh: '✓ 找到目标！arr[$1] = $2',
      en: '✓ Target found! arr[$1] = $2',
    },
  },
  // ===== AVL 树 =====
  // 插入根节点：X
  {
    pattern: /插入根节点：(\d+)/,
    replacement: {
      zh: '插入根节点：$1',
      en: 'Insert root: $1',
    },
  },
  // 插入 X：从根节点 Y 开始
  {
    pattern: /插入 (\d+)，高度 = (\d+)/,
    replacement: {
      zh: '插入 $1，高度 = $2',
      en: 'Insert $1, height = $2',
    },
  },
  // 节点 X 不平衡（|bf| = Y）
  {
    pattern: /节点 (\d+) 不平衡（\|bf\| = (\d+)）/,
    replacement: {
      zh: '节点 $1 不平衡（|bf| = $2）',
      en: 'Node $1 unbalanced (|bf| = $2)',
    },
  },
  // 节点 X 不平衡！平衡因子 = Y，执行旋转
  {
    pattern: /节点 (\d+) 不平衡！平衡因子 = (-?\d+)，执行旋转/,
    replacement: {
      zh: '节点 $1 不平衡！平衡因子 = $2，执行旋转',
      en: 'Node $1 unbalanced! balance factor = $2, rotating',
    },
  },
  // LL/RR/LR/RL 型：对 X 旋转
  {
    pattern: /(LL|RR|LR|RL) 型：对 (\d+) (右|左)旋/,
    replacement: {
      zh: '$1 型：对 $2 $3旋',
      en: '$1 type: $3 rotate at $2',
    },
  },
  // LL/RR/LR/RL 型：对 X 右旋，再对 Y 左旋 (etc)
  {
    pattern: /(LR|RL) 型：对 (\d+) (左|右)旋，再对 (\d+) (右|左)旋/,
    replacement: {
      zh: '$1 型：对 $2 $3旋，再对 $4 $5旋',
      en: '$1 type: $3 rotate at $2, then $5 rotate at $4',
    },
  },
  // 节点 X：高度 = Y，平衡因子 = Z
  {
    pattern: /节点 (\d+)：高度 = (\d+)，平衡因子 = (-?\d+)/,
    replacement: {
      zh: '节点 $1：高度 = $2，平衡因子 = $3',
      en: 'Node $1: height = $2, balance factor = $3',
    },
  },
  // ===== 红黑树 =====
  // 插入为左/右子节点（红色）
  {
    pattern: /(\d+) < (\d+)，插入为(左|右)子节点（红色）/,
    replacement: {
      zh: '$1 < $2，插入为$3子节点（红色）',
      en: '$1 < $2, insert as $3 child (red)',
    },
  },
  {
    pattern: /(\d+) ≥ (\d+)，插入为(左|右)子节点（红色）/,
    replacement: {
      zh: '$1 ≥ $2，插入为$3子节点（红色）',
      en: '$1 ≥ $2, insert as $3 child (red)',
    },
  },
  // 叔节点为红色/黑色
  {
    pattern: /叔节点为(红色)：父 (\d+) → 黑，叔 (\d+) → 黑，爷 (\d+) → 红/,
    replacement: {
      zh: '叔节点为红色：父 $1 → 黑，叔 $2 → 黑，爷 $3 → 红',
      en: 'Uncle red: parent $1 → BLACK, uncle $2 → BLACK, grandparent $3 → RED',
    },
  },
  {
    pattern: /叔节点为黑色：在 (\d+) 处旋转/,
    replacement: {
      zh: '叔节点为黑色：在 $1 处旋转',
      en: 'Uncle black: rotate at $1',
    },
  },
  // LL/RR 型：对 X 旋转，变色
  {
    pattern: /(LL|RR) 型：对 (\d+) (右|左)旋，变色/,
    replacement: {
      zh: '$1 型：对 $2 $3旋，变色',
      en: '$1 type: $3 rotate at $2, recolor',
    },
  },
  // ===== Floyd-Warshall =====
  // 以节点 X 为中间点
  {
    pattern: /——— 以节点 (\d+) 为中间点 ———/,
    replacement: {
      zh: '——— 以节点 $1 为中间点 ———',
      en: '——— Using node $1 as intermediate ———',
    },
  },
  // k=X：dist[i][j]=Y vs dist[i][k]+dist[k][j]=Z
  {
    pattern: /k=(\d+)：dist\[(\d+)\]\[(\d+)\]=([^ ]+) vs dist\[(\d+)\]\[(\d+)\]+dist\[(\d+)\]\[(\d+)\]=(\d+)/,
    replacement: {
      zh: 'k=$1：dist[$2][$3]=$4 vs dist[$5][$6]+dist[$7][$8]=$9',
      en: 'k=$1：dist[$2][$3]=$4 vs dist[$5][$6]+dist[$7][$8]=$9',
    },
  },
  // ✓ 更新 dist[i][j] = X
  {
    pattern: /✓ 更新 dist\[(\d+)\]\[(\d+)\] = (\d+)/,
    replacement: {
      zh: '✓ 更新 dist[$1][$2] = $3',
      en: '✓ Update dist[$1][$2] = $3',
    },
  },
];

/**
 * 翻译算法步骤消息
 * @param message 原始消息（中文）
 * @param locale 目标语言
 * @returns 翻译后的消息
 */
export function translateMessage(message: string, locale: Locale): string {
  if (locale === 'zh') return message;

  // 1. 精确匹配
  for (const [key, translations] of Object.entries(MESSAGE_PATTERNS)) {
    if (message.includes(key)) {
      const translated = translations[locale];
      if (typeof translated === 'string') {
        message = message.replace(key, translated);
      }
    }
  }

  // 2. 正则模式匹配
  for (const { pattern, replacement } of REGEX_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const replacer = replacement[locale];
      if (typeof replacer === 'function') {
        return message.replace(pattern, replacer(match));
      } else if (typeof replacer === 'string') {
        // 替换 $1, $2 等占位符
        let result = replacer;
        for (let i = 1; i < match.length; i++) {
          result = result.replace(`$${i}`, match[i] ?? '');
        }
        return message.replace(pattern, result);
      }
    }
  }

  // 3. 无法翻译，返回原文
  return message;
}
