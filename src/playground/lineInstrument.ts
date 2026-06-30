import { parse } from 'acorn';
import type { CallExpression, Node } from 'acorn';

const VIZ_METHODS = new Set([
  'compare', 'swap', 'set', 'mark', 'pointer', 'visit', 'log', 'done',
]);

interface InjectPoint {
  pos: number;
  line: number;
  hasArgs: boolean;
}

export function instrumentLines(code: string): string {
  const ast = parse(code, { ecmaVersion: 2022, locations: true, sourceType: 'script' });

  const points: InjectPoint[] = [];

  walkAST(ast, (node) => {
    if (node.type !== 'CallExpression') return;
    const call = node as CallExpression;
    if (call.callee.type !== 'MemberExpression') return;
    const mem = call.callee;
    if (mem.object.type !== 'Identifier' || mem.object.name !== 'viz') return;
    if (mem.property.type !== 'Identifier') return;
    if (!VIZ_METHODS.has(mem.property.name)) return;

    const line = node.loc!.start.line;
    points.push({ pos: node.end - 1, line, hasArgs: call.arguments.length > 0 });
  });

  let result = code;
  for (let i = points.length - 1; i >= 0; i--) {
    const { pos, line, hasArgs } = points[i];
    const prefix = hasArgs ? ', ' : '';
    result = result.slice(0, pos) + `${prefix}${line}` + result.slice(pos);
  }
  return result;
}

function walkAST(node: Node, fn: (node: Node) => void): void {
  fn(node);
  const obj = node as unknown as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (NON_WALK_KEYS.has(key)) continue;
    const val = obj[key];
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === 'object' && typeof (item as Node).type === 'string') {
          walkAST(item as Node, fn);
        }
      }
    } else if (val && typeof val === 'object' && typeof (val as Node).type === 'string') {
      walkAST(val as Node, fn);
    }
  }
}

const NON_WALK_KEYS = new Set([
  'start', 'end', 'type', 'loc', 'range', 'parent',
]);
