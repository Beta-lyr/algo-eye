import { describe, it, expect } from 'vitest';
import { buildShareUrl, parseShareUrl } from '../shareUrl';

describe('buildShareUrl', () => {
  it('构建正确 URL', () => {
    const url = buildShareUrl('http://example.com', 'bubble-sort', [3, 1, 4], 0);
    expect(url).toContain('/algo/bubble-sort');
    expect(url).toContain('data=3,1,4');
    expect(url).not.toContain('step');
  });

  it('stepIndex>0 时包含 step 参数', () => {
    const url = buildShareUrl('http://example.com', 'quick-sort', [5, 2], 3);
    expect(url).toContain('step=3');
  });
});

describe('parseShareUrl', () => {
  it('正确解析完整 URL', () => {
    const result = parseShareUrl('?algo=merge-sort&data=9,5,7,3&step=2', '/');
    expect(result).toEqual({
      algoId: 'merge-sort',
      data: [9, 5, 7, 3],
      stepIndex: 2,
    });
  });

  it('step 缺失时 stepIndex=0', () => {
    const result = parseShareUrl('?algo=heap-sort&data=1,2,3,4', '/');
    expect(result?.stepIndex).toBe(0);
  });

  it('data 长度不足时返回 null', () => {
    const result = parseShareUrl('?algo=test&data=1,2', '/');
    expect(result).toBeNull();
  });

  it('从 pathname 提取 algoId', () => {
    const result = parseShareUrl('data=1,2,3,4', '/algo/linear-search');
    expect(result?.algoId).toBe('linear-search');
  });
});
