export function buildShareUrl(
  origin: string,
  algoId: string,
  data: number[],
  stepIndex: number,
): string {
  const q = `data=${data.join(',')}` + (stepIndex > 0 ? `&step=${stepIndex}` : '');
  return `${origin}/algo/${algoId}?${q}`;
}

export interface ParsedShareUrl {
  algoId: string;
  data: number[];
  stepIndex: number;
}

export function parseShareUrl(
  search: string,
  pathname: string,
): ParsedShareUrl | null {
  const params = new URLSearchParams(search);
  const algoId = params.get('algo') || pathname.split('/').pop();
  if (!algoId) return null;

  const dataStr = params.get('data');
  const data = dataStr
    ? dataStr.split(',').map(Number).filter((n) => !isNaN(n))
    : [];
  if (data.length < 4 || data.length > 64) return null;

  const stepStr = params.get('step');
  const stepIndex = stepStr ? Math.max(0, Number(stepStr)) : 0;

  return { algoId, data, stepIndex };
}
