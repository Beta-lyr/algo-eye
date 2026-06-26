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
  '排序完成': {
    zh: '排序完成',
    en: 'Sorting complete',
  },
  '所有元素已按升序排列': {
    zh: '所有元素已按升序排列',
    en: 'All elements are sorted in ascending order',
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
