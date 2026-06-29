// ============================================================
// WebGL 渲染器 — 大数据量（>500 元素）时替代 Canvas 2D
// 使用 shader 实现辉光效果，性能优于 shadowBlur
// ============================================================

import type { Renderer, DrawOpts } from './Renderer';
import type { Snapshot, ElementState } from '../engine/types';

const BAR_COLORS: Record<ElementState, [number, number, number]> = {
  default: [0.2, 0.37, 0.24],
  compare: [1, 0.69, 0],
  current: [0.2, 1, 0.4],
  visited: [0.7, 0.53, 1],
  swapping: [1, 0.33, 0.33],
  sorted: [0, 0.9, 0.46],
  path: [0, 0.9, 0.46],
};

const VS = `#version 100
attribute vec2 aPos;
attribute vec3 aColor;
uniform vec2 uScale;
varying vec3 vColor;
void main() {
  gl_Position = vec4(aPos * uScale, 0.0, 1.0);
  vColor = aColor;
}
`;

const FS = `#version 100
precision mediump float;
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('WebGL shader compile error:', gl.getShaderInfoLog(s));
  }
  return s;
}

function makeProgram(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  return prog;
}

export const WebglRenderer: Renderer<Snapshot> = {
  draw(ctx: CanvasRenderingContext2D, snap: Snapshot, opts: DrawOpts): void {
    const canvas = ctx.canvas;
    let gl: WebGLRenderingContext | null = null;

    try {
      gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    } catch {
      // WebGL not available
    }

    if (!gl) {
      // Fallback to simple Canvas 2D
      ctx.fillStyle = '#0a0e0a';
      ctx.fillRect(0, 0, opts.canvasWidth, opts.canvasHeight);
      const n = snap.data.length;
      if (n === 0) return;
      const gap = 1;
      const w = (opts.canvasWidth - gap * (n + 1)) / n;
      const maxVal = Math.max(...snap.data, 1);
      for (let i = 0; i < n; i++) {
        const h = (snap.data[i] / maxVal) * (opts.canvasHeight - 20);
        const color = BAR_COLORS[snap.states[i] ?? 'default'] ?? BAR_COLORS.default;
        ctx.fillStyle = `rgb(${color[0]*255|0},${color[1]*255|0},${color[2]*255|0})`;
        ctx.fillRect(gap + i * (w + gap), opts.canvasHeight - 10 - h, w, h);
      }
      return;
    }

    const n = snap.data.length;
    if (n === 0) return;

    const maxVal = Math.max(...snap.data, 1);
    const gap = 1;
    const w = (opts.canvasWidth - gap * (n + 1)) / n;

    const verts: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < n; i++) {
      const h = (snap.data[i] / maxVal) * (opts.canvasHeight - 20);
      const bx = gap + i * (w + gap);
      const by = opts.canvasHeight - 10 - h;
      const r = bx + w;

      const col = BAR_COLORS[snap.states[i] ?? 'default'] ?? BAR_COLORS.default;

      // Two triangles per bar
      const x1 = bx / opts.canvasWidth * 2 - 1;
      const x2 = r / opts.canvasWidth * 2 - 1;
      const y1 = 1 - by / opts.canvasHeight * 2;
      const y2 = 1 - (by + h) / opts.canvasHeight * 2;

      verts.push(x1, y1, x2, y1, x1, y2);
      verts.push(x1, y2, x2, y1, x2, y2);
      for (let vi = 0; vi < 6; vi++) colors.push(...col);
    }

    gl.viewport(0, 0, opts.canvasWidth, opts.canvasHeight);
    gl.clearColor(0.04, 0.055, 0.04, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const prog = makeProgram(gl, VS, FS);
    gl.useProgram(prog);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const colBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const aColor = gl.getAttribLocation(prog, 'aColor');
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

    const uScale = gl.getUniformLocation(prog, 'uScale');
    gl.uniform2f(uScale, 1, 1);

    gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
  },
};

/** 判断是否需要 WebGL 渲染器（>500 元素） */
export function shouldUseWebgl(dataSize: number): boolean {
  return dataSize > 500;
}
