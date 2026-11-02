export default function EdgeGlow({
  children,
  className = '',
  edgeSensitivity = 24,
  glowRadius = 28,
  glowIntensity = .78,
}) {
  const colors = Object.fromEntries([100, 50, 30, 20, 10].map(alpha => [
    `--glow-color${alpha === 100 ? '' : `-${alpha}`}`,
    `hsl(220deg 85% 78% / ${alpha * glowIntensity}%)`,
  ]));
  return <div className={`edge-glow ${className}`} style={{
    '--glow-padding': `${glowRadius}px`,
    '--glow-duration': `${Math.max(4.8, 8.4 - edgeSensitivity * .08)}s`,
    ...colors,
  }}>
    <span className="edge-light" aria-hidden="true" />
    <div className="edge-glow-inner">{children}</div>
  </div>;
}
