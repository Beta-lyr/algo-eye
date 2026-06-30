import { describe, it, expect } from 'vitest';
import { instrumentLines } from '../lineInstrument';

describe('instrumentLines', () => {
  it('injects line number into compare call', () => {
    const result = instrumentLines('viz.compare(i, j)');
    expect(result).toBe('viz.compare(i, j, 1)');
  });

  it('injects line number into done() with no args', () => {
    const result = instrumentLines('viz.done()');
    expect(result).toBe('viz.done(1)');
  });

  it('preserves non-viz calls unchanged', () => {
    const result = instrumentLines('console.log("hello")');
    expect(result).toBe('console.log("hello")');
  });

  it('skips viz.value() which is read-only', () => {
    const result = instrumentLines('const x = viz.value(0); viz.compare(0, 1)');
    expect(result).toBe('const x = viz.value(0); viz.compare(0, 1, 1)');
  });

  it('handles multi-line code with correct line numbers', () => {
    const code = [
      'const n = viz.length;',
      'for (let i = 0; i < n; i++) {',
      '  viz.compare(i, i + 1);',
      '  viz.swap(i, i + 1);',
      '}',
    ].join('\n');
    const result = instrumentLines(code);
    expect(result).toBe([
      'const n = viz.length;',
      'for (let i = 0; i < n; i++) {',
      '  viz.compare(i, i + 1, 3);',
      '  viz.swap(i, i + 1, 4);',
      '}',
    ].join('\n'));
  });

  it('instruments all viz API methods', () => {
    const code = [
      'viz.set(0, 5);',
      'viz.mark(0, "sorted");',
      'viz.pointer(0, "p");',
      'viz.visit(0);',
      'viz.log("hello");',
    ].join('\n');
    const result = instrumentLines(code);
    expect(result).toBe([
      'viz.set(0, 5, 1);',
      'viz.mark(0, "sorted", 2);',
      'viz.pointer(0, "p", 3);',
      'viz.visit(0, 4);',
      'viz.log("hello", 5);',
    ].join('\n'));
  });

  it('throws SyntaxError for invalid code', () => {
    expect(() => instrumentLines('viz.compare(0,, 1)')).toThrow(SyntaxError);
  });

  it('handles viz call inside a function body', () => {
    const code = 'function sort() {\n  viz.compare(0, 1);\n}';
    const result = instrumentLines(code);
    expect(result).toBe('function sort() {\n  viz.compare(0, 1, 2);\n}');
  });

  it('handles viz call with nested expression arguments', () => {
    const result = instrumentLines('viz.compare(i, j + 1)');
    expect(result).toBe('viz.compare(i, j + 1, 1)');
  });

  // V3.3 string methods
  it('instruments setText and setPattern', () => {
    expect(instrumentLines('viz.setText("abc")')).toBe('viz.setText("abc", 1)');
    expect(instrumentLines('viz.setPattern("xyz")')).toBe('viz.setPattern("xyz", 1)');
  });

  it('instruments markText and markPattern', () => {
    expect(instrumentLines('viz.markText(0, "compare")')).toBe('viz.markText(0, "compare", 1)');
    expect(instrumentLines('viz.markPattern(1, "match")')).toBe('viz.markPattern(1, "match", 1)');
  });

  it('skips textCharAt and patternCharAt (read-only)', () => {
    const result = instrumentLines('const c = viz.textCharAt(0); viz.markText(0, "m")');
    expect(result).toBe('const c = viz.textCharAt(0); viz.markText(0, "m", 1)');
  });

  it('skips textLength and patternLength getters', () => {
    const result = instrumentLines('const n = viz.textLength; const m = viz.patternLength; viz.markText(0, "c")');
    // textLength and patternLength are property accesses, not calls - acorn won't parse them as CallExpression
    expect(result).toContain('viz.markText(0, "c", 1)');
  });

  // V3.3 grid methods
  it('instruments setCols, setStart, setTarget', () => {
    expect(instrumentLines('viz.setCols(8)')).toBe('viz.setCols(8, 1)');
    expect(instrumentLines('viz.setStart(0, 0)')).toBe('viz.setStart(0, 0, 1)');
    expect(instrumentLines('viz.setTarget(7, 7)')).toBe('viz.setTarget(7, 7, 1)');
  });

  it('instruments markCell, visitCell, setCell', () => {
    expect(instrumentLines('viz.markCell(1, 2, "path")')).toBe('viz.markCell(1, 2, "path", 1)');
    expect(instrumentLines('viz.visitCell(3, 4)')).toBe('viz.visitCell(3, 4, 1)');
    expect(instrumentLines('viz.setCell(0, 0, 5)')).toBe('viz.setCell(0, 0, 5, 1)');
  });

  it('skips index, row, col, inBounds, cellValue (read-only)', () => {
    const result = instrumentLines('const idx = viz.index(1, 2); viz.markCell(1, 2, "path")');
    expect(result).toBe('const idx = viz.index(1, 2); viz.markCell(1, 2, "path", 1)');
  });
});
