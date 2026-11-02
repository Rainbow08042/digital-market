// Motion Prompt #089 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#089
// Resource-driven adaptation: keep the percent/bar/reveal sequence, replace the demo clock.
export function startLoadingFeedback(root, signal) {
  const label = root.querySelector('.opening-index');
  const line = root.querySelector('.opening-line');
  const status = root.querySelector('.opening-status');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const started = performance.now();
  let previous = started, displayed = 0, target = 0, frame, completing = false, stopped = false;
  let lastInteger = -1, completedAt, resolveComplete;
  const completePromise = new Promise(resolve => { resolveComplete = resolve; });
  const paint = () => {
    const integer = displayed >= 99.95 ? 100 : Math.floor(displayed);
    root.dataset.homeMediaProgress = `${integer}%`;
    line.style.transform = `scaleX(${displayed / 100})`;
    if (integer !== lastInteger) {
      label.textContent = `LOADING / ${integer}%`;
      lastInteger = integer;
    }
  };
  const stop = () => {
    stopped = true;
    cancelAnimationFrame(frame);
    signal.removeEventListener('abort', stop);
    resolveComplete();
  };
  const tick = now => {
    if (stopped || signal.aborted) return;
    const dt = Math.max(0, Math.min(.1, (now - previous) / 1000));
    previous = Math.max(previous, now);
    // Connection preparation occupies only the first 4%; it never pretends to finish a download.
    const connection = 4 * (1 - Math.exp(-Math.max(0, now - started) / 450));
    const goal = Math.max(target, completing ? 100 : connection);
    displayed = preference.matches ? goal : Math.min(goal,
      displayed + Math.min(85 * dt, (goal - displayed) * (1 - Math.exp(-9 * dt))));
    if (completing && 100 - displayed < .15) displayed = 100;
    paint();
    if (displayed === 100) {
      completedAt ??= now;
      if (preference.matches || now - completedAt >= 180) { stop(); return; }
    }
    frame = requestAnimationFrame(tick);
  };
  signal.addEventListener('abort', stop, { once: true });
  paint();
  frame = requestAnimationFrame(tick);
  return {
    update({ percent }) {
      if (stopped) return;
      root.dataset.homeMediaRawProgress = `${percent}%`;
      target = Math.max(target, 4 + percent * .9);
      status.textContent = percent >= 95 ? '正在准备画面 / PREPARING SCENE'
        : percent > 0 ? '正在加载场景 / LOADING ASSETS' : '正在连接资源 / CONNECTING';
    },
    complete() {
      if (!stopped) {
        completing = true; target = 100;
        status.textContent = '准备就绪 / READY TO EXPLORE';
      }
      return completePromise;
    },
  };
}
