// ============================================================
// CrtOverlay — CRT 特效覆盖层（扫描线 + 暗角 + 漂移扫描带）
// 纯展示，无交互，pointer-events: none
// ============================================================

export function CrtOverlay() {
  return (
    <>
      <div className="crt-sweep" />
      <div className="crt-overlay" />
    </>
  );
}
