import { useEffect, useRef, useState } from 'react';

export default function FuzzyText({ children, hero = false }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, frame = 0, visible = true, hovered = false, last = 0;
    let source, height, width, resizeTimer;
    const padding = 40;
    const paint = time => {
      if (!source) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      const glitch = time % (hero ? 2800 : 3400) < 140;
      const intensity = motion.matches ? 0 : glitch ? 1 : hovered ? .28 : hero ? .08 : .06;
      for (let row = 0; row < height; row++) {
        const shift = Math.floor(intensity * (Math.random() - .5) * (hero ? 20 : 18));
        context.drawImage(source, 0, row, width, 1, padding + shift, row, width, 1);
      }
    };
    const tick = time => {
      frame = 0;
      if (!visible || document.hidden || motion.matches || disposed) return;
      if (time - last >= 1000 / (hero ? 36 : 24)) { paint(time); last = time; }
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (motion.matches) paint(1000);
      else if (visible && !document.hidden && !disposed) frame = requestAnimationFrame(tick);
    };
    const setup = async () => {
      const style = getComputedStyle(canvas.parentElement);
      const font = `400 ${style.fontSize} "Market Display"`;
      await document.fonts.load(font, children);
      if (disposed) return;
      source = document.createElement('canvas');
      const brush = source.getContext('2d');
      brush.font = font;
      const metrics = brush.measureText(children);
      const ascent = Math.ceil(metrics.actualBoundingBoxAscent);
      height = Math.ceil(ascent + metrics.actualBoundingBoxDescent) + 2;
      width = Math.ceil(metrics.width) + 10;
      source.width = width;
      source.height = height;
      brush.font = font;
      brush.fillStyle = hero ? '#f0f3f7' : '#dce6f4';
      brush.fillText(children, 5, ascent);
      canvas.width = width + padding * 2;
      canvas.height = height;
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${height}px`;
      paint(1000);
      setReady(true);
      resume();
    };
    const resize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setup, 120); };
    const enter = () => { hovered = true; };
    const leave = () => { hovered = false; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
    observer.observe(canvas);
    canvas.addEventListener('pointerenter', enter);
    canvas.addEventListener('pointerleave', leave);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', resume);
    setup();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      observer.disconnect();
      canvas.removeEventListener('pointerenter', enter);
      canvas.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', resume);
      motion.removeEventListener('change', resume);
    };
  }, [children, hero]);
  return <span className={`fuzzy-text ${ready ? 'is-ready' : ''}`} aria-hidden="true">
    <span className="fuzzy-fallback">{children}</span><canvas ref={ref} />
  </span>;
}
