// ============================================================
// 哈希表 — Hash Table
// 展示插入和搜索操作，拉链法解决冲突
// ============================================================

import type { Algorithm } from '../types';
import type { Step, Snapshot, ElementState } from '../../engine/types';

/** 哈希桶节点 */
interface HashNode {
  key: number;
  value: number;
  next: HashNode | null;
}

/** 深拷贝哈希表 */
function cloneHashTable(table: (HashNode | null)[]): (HashNode | null)[] {
  return table.map((bucket) => {
    if (!bucket) return null;
    return {
      key: bucket.key,
      value: bucket.value,
      next: bucket.next ? { ...bucket.next } : null,
    };
  });
}

/** 创建快照 */
function hashSnap(
  table: (HashNode | null)[],
  hashTableStates: Record<number | string, ElementState>,
  arrayData: number[] = [],
): Snapshot {
  return {
    kind: 'linked-list', // 复用 linked-list 类型
    data: arrayData,
    states: {},
    hashTable: cloneHashTable(table),
    hashTableStates: { ...hashTableStates },
  };
}

export const hashTable: Algorithm = {
  id: 'hash-table',
  name: '哈希表',
  category: 'data-structure',
  complexity: { time: 'O(1)', space: 'O(n)' },
  difficulty: 'intermediate',
  tags: ['hash-based'],
  relatedAlgorithms: ['linked-list'],
  dataKind: 'linked-list',
  defaultData: [15, 25, 35, 45, 55, 20, 30],
  codeLines: [
    'class HashTable {',
    '  constructor(size) {',
    '    this.buckets = new Array(size).fill(null);',
    '    this.size = size;',
    '  }',
    '  hash(key) { return key % this.size; }',
    '  insert(key, value) {',
    '    let idx = this.hash(key);',
    '    let node = { key, value, next: null };',
    '    if (!this.buckets[idx]) {',
    '      this.buckets[idx] = node;',
    '    } else {',
    '      node.next = this.buckets[idx]; // 头插法',
    '      this.buckets[idx] = node;',
    '    }',
    '  }',
    '  search(key) {',
    '    let idx = this.hash(key);',
    '    let curr = this.buckets[idx];',
    '    while (curr) {',
    '      if (curr.key === key) return curr.value;',
    '      curr = curr.next;',
    '    }',
    '    return null;',
    '  }',
    '}',
  ],

  *generate(data: number[]): Generator<Step> {
    const size = 5; // 哈希表大小
    const table: (HashNode | null)[] = new Array(size).fill(null);
    const hashTableStates: Record<number | string, ElementState> = {};
    const insertedKeys: number[] = [];

    yield {
      type: 'mark',
      line: 1,
      message: `初始化哈希表，大小=${size}，哈希函数：key % ${size}`,
      snapshot: hashSnap(table, hashTableStates, insertedKeys),
    };

    // 插入演示
    for (const key of data) {
      const idx = key % size;

      // 高亮目标桶
      hashTableStates[idx] = 'compare';
      yield {
        type: 'pointer',
        line: 7,
        message: `插入 key=${key}：hash(${key}) = ${key} % ${size} = ${idx}`,
        snapshot: hashSnap(table, hashTableStates, insertedKeys),
      };

      // 检查是否有冲突
      if (table[idx]) {
        hashTableStates[idx] = 'swap';
        yield {
          type: 'compare',
          line: 11,
          message: `冲突！桶 [${idx}] 已有值 ${table[idx]!.key}`,
          snapshot: hashSnap(table, hashTableStates, insertedKeys),
        };

        // 头插法
        const newNode: HashNode = { key, value: key * 10, next: table[idx] };
        table[idx] = newNode;
        hashTableStates[`${idx}-0`] = 'compare';

        yield {
          type: 'set',
          line: 12,
          message: `头插法：${key} 插入到桶 [${idx}] 头部`,
          snapshot: hashSnap(table, hashTableStates, insertedKeys),
        };
      } else {
        // 无冲突，直接插入
        table[idx] = { key, value: key * 10, next: null };
        hashTableStates[idx] = 'path';

        yield {
          type: 'set',
          line: 10,
          message: `无冲突：${key} 插入到桶 [${idx}]`,
          snapshot: hashSnap(table, hashTableStates, insertedKeys),
        };
      }

      insertedKeys.push(key);

      // 重置状态
      for (const k in hashTableStates) {
        hashTableStates[k] = 'sorted';
      }
    }

    // 搜索演示
    const searchTarget = data[Math.floor(Math.random() * data.length)];
    yield {
      type: 'pointer',
      line: 16,
      message: `插入完成，开始搜索 key=${searchTarget}`,
      snapshot: hashSnap(table, hashTableStates, insertedKeys),
    };

    const searchIdx = searchTarget % size;
    hashTableStates[searchIdx] = 'current';

    yield {
      type: 'compare',
      line: 17,
      message: `搜索：hash(${searchTarget}) = ${searchIdx}，检查桶 [${searchIdx}]`,
      snapshot: hashSnap(table, hashTableStates, insertedKeys),
    };

    let curr: HashNode | null = table[searchIdx];
    let chainIndex = 0;
    while (curr) {
      hashTableStates[`${searchIdx}-${chainIndex}`] = 'current';

      yield {
        type: 'compare',
        line: 19,
        message: `检查：key=${curr.key} === ${searchTarget}?`,
        snapshot: hashSnap(table, hashTableStates, insertedKeys),
      };

      if (curr.key === searchTarget) {
        hashTableStates[`${searchIdx}-${chainIndex}`] = 'path';
        hashTableStates[searchIdx] = 'path';

        yield {
          type: 'mark',
          line: 20,
          message: `是 找到！key=${searchTarget}，value=${curr.value}`,
          snapshot: hashSnap(table, hashTableStates, insertedKeys),
        };
        break;
      }

      hashTableStates[`${searchIdx}-${chainIndex}`] = 'visit';
      curr = curr.next;
      chainIndex++;
    }

    if (!curr) {
      yield {
        type: 'done',
        line: 23,
        message: `未找到 key=${searchTarget}`,
        snapshot: hashSnap(table, hashTableStates, insertedKeys),
      };
    }

    yield {
      type: 'done',
      line: 25,
      message: '哈希表操作演示完成',
      snapshot: hashSnap(table, hashTableStates, insertedKeys),
    };
  },
};
