// ============================================================
// CodeEditor — CodeMirror 6 包装（V3.1）
// CRT 主题（磷光绿关键字、暗底）+ 行号槽 + JS 语法高亮
// 行号槽为 V3.2 行高亮装饰铺路
// 受控：value/onChange，外部 value 变化（选模板）同步进编辑器
// ============================================================

import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlights';

/** CRT 语法高亮：磷光绿关键字、琥珀字符串、紫红数字 */
const crtHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#33ff66' },
  { tag: tags.string, color: '#ffb000' },
  { tag: tags.number, color: '#ff79c6' },
  { tag: tags.comment, color: '#2e5e3e', fontStyle: 'italic' },
  { tag: tags.function(tags.variableName), color: '#00e5ff' },
  { tag: tags.variableName, color: '#5cb574' },
  { tag: tags.propertyName, color: '#5cb574' },
  { tag: tags.operator, color: '#33ff66' },
  { tag: tags.punctuation, color: '#5cb574' },
]);

/** CRT 编辑器主题：暗底、磷光绿文字、磷光光标 */
const crtTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--bg)',
    color: 'var(--green)',
    height: '100%',
    fontSize: '13px',
  },
  '.cm-content': {
    fontFamily: 'var(--mono)',
    caretColor: 'var(--green)',
    padding: '10px 0',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--bg-panel)',
    color: 'var(--green-faint)',
    border: 'none',
    borderRight: '1px solid var(--border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--bg-panel-raised)',
    color: 'var(--green-dim)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--bg-panel-raised)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--green)',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'var(--green)',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(51, 255, 102, 0.15)',
  },
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  // 用 ref 持有最新 onChange，避免重建编辑器
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!parentRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        javascript(),
        syntaxHighlighting(crtHighlightStyle),
        crtTheme,
        highlightActiveLine(),
        highlightActiveLineGutter(),
        updateListener,
        EditorView.lineWrapping,
        EditorView.editable.of(true),
      ],
    });

    const view = new EditorView({ state, parent: parentRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 外部 value 变化（如选模板）同步进编辑器，避免循环
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  }, [value]);

  return <div className="code-editor-wrap" ref={parentRef} />;
}
