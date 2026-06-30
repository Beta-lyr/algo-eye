import type { PlaygroundInput } from './protocol';

interface ShareData {
  code: string;
  input: PlaygroundInput;
}

export function encodeShareData(code: string, input: PlaygroundInput): string {
  const data: ShareData = { code, input };
  const json = JSON.stringify(data);
  return encodeURIComponent(json);
}

export function decodeShareData(encoded: string): ShareData | null {
  try {
    const json = decodeURIComponent(encoded);
    const data = JSON.parse(json) as ShareData;
    if (typeof data.code !== 'string' || !data.input || typeof data.input.kind !== 'string') {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function buildShareUrl(code: string, input: PlaygroundInput): string {
  const encoded = encodeShareData(code, input);
  const base = window.location.origin + window.location.pathname;
  return `${base}#code=${encoded}`;
}

export function parseShareHash(): ShareData | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#code=')) return null;
  const encoded = hash.slice('#code='.length);
  return decodeShareData(encoded);
}
