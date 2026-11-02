async (page) => {
  page.setDefaultTimeout(90000);
  page.setDefaultNavigationTimeout(90000);
  const base = new URL(page.url()).origin;
  const checks = [], errors = [];
  const check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    clearInterval(window.loadingSampleTimer);
    window.loadingSamples = [];
    window.loadingSampleTimer = setInterval(() => {
      const root = document.querySelector('main[data-home-media-progress]');
      if (root && window.loadingSamples.length < 2000) window.loadingSamples.push({
        time: performance.now(), progress: parseInt(root.dataset.homeMediaProgress),
        raw: parseInt(root.dataset.homeMediaRawProgress), state: root.dataset.homeMediaStatus,
      });
    }, 40);
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    let releaseFast, releaseSlow;
    const fast = new Promise(resolve => { releaseFast = resolve; });
    const slow = new Promise(resolve => { releaseSlow = resolve; });
    await page.route('**/media/digital-market/*', async route => {
      await (route.request().url().includes('purpose-04-compounding') ? slow : fast);
      await route.continue();
    });
    try {
      await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('main')?.dataset.homeMediaStatus === 'loading');
      await page.waitForTimeout(450);
      const progress = await page.locator('main').getAttribute('data-home-media-progress');
      check(parseInt(progress) > 0 && parseInt(progress) <= 4, `${width}: connection feedback advances within bounded startup stage`);
      const motion = () => page.evaluate(() => [
        document.querySelector('.opening-scanner'), document.querySelector('.opening-brand'),
        ...document.querySelectorAll('.opening-ambient>i'),
      ].map(node => ({ transform: getComputedStyle(node).transform, opacity: getComputedStyle(node).opacity })));
      const before = await motion();
      await page.waitForTimeout(240);
      const after = await motion();
      check(before[0].transform !== after[0].transform, `${width}: scanner moves while requests are held`);
      check(before[1].opacity !== after[1].opacity, `${width}: brand breathes while requests are held`);
      check(before.slice(2).some((v,i) => v.transform !== after[i+2].transform), `${width}: gradient orbits continue while requests are held`);
      if (width !== 320) await page.screenshot({ path: `output/playwright/loading-feedback-wait-${width}.png` });
      releaseFast();
      await page.waitForFunction(() => parseInt(document.querySelector('main')?.dataset.homeMediaRawProgress) > 30);
      check(await page.locator('main').getAttribute('data-home-media-status') === 'loading', `${width}: fast images advance before slow response headers`);
      await page.waitForTimeout(850);
      if (width !== 320) await page.screenshot({ path: `output/playwright/loading-feedback-progress-${width}.png` });
      releaseSlow();
      await page.waitForFunction(() => document.querySelector('main')?.dataset.homeMediaStatus === 'ready');
      const samples = await page.evaluate(() => window.loadingSamples.filter(s => Number.isFinite(s.progress)));
      check(samples.every((s,i) => !i || s.progress >= samples[i-1].progress), `${width}: visible progress never reverses`);
      check(samples.every((s,i) => !i || s.progress - samples[i-1].progress <= Math.ceil((s.time-samples[i-1].time)*.085)+2), `${width}: no abrupt percentage jumps`);
      check(await page.locator('main').getAttribute('data-home-media-progress') === '100%', `${width}: ready completes at 100%`);
      await page.waitForFunction(() => !document.documentElement.classList.contains('motion-opening'));
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: no overflow`);
    } finally {
      releaseFast(); releaseSlow();
      await page.unrouteAll({ behavior: 'wait' });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '/');
  await page.waitForFunction(() => document.querySelector('main')?.dataset.homeMediaStatus === 'ready');
  check(await page.locator('.opening-brand').evaluate(el => getComputedStyle(el).animationName === 'none'), 'Reduced motion disables brand loop');
  check(await page.locator('.opening-scanner').evaluate(el => getComputedStyle(el).display === 'none'), 'Reduced motion disables scanner');
  check(await page.evaluate(() => !document.documentElement.classList.contains('motion-opening')), 'Reduced motion releases loading cover');
  await page.route('**/purpose-04-compounding-capability-v4.webp', route => route.abort());
  await page.goto(base + '/');
  await page.waitForFunction(() => document.querySelector('main')?.dataset.homeMediaStatus === 'ready-with-errors');
  check(await page.locator('main').getAttribute('data-home-media-progress') === '100%', 'Failed image settles without blocking completion');
  check(await page.evaluate(() => !document.documentElement.classList.contains('motion-opening')), 'Failed image releases loading cover');
  await page.unroute('**/purpose-04-compounding-capability-v4.webp');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base + '/');
  await page.waitForFunction(() => document.querySelector('main')?.dataset.homeMediaStatus === 'ready');
  await page.waitForFunction(() => !document.documentElement.classList.contains('motion-opening'));
  check(await page.evaluate(() => !document.getAnimations().some(animation =>
    animation.playState === 'running' && animation.effect?.target?.closest('.opening-sequence'))),
  'Loading animation loops stop after intro');
  check(errors.length === 0, 'No browser runtime errors');
  return { passed: checks.length, checks, errors };
}
