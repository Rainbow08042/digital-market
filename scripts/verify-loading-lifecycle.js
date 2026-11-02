async (page) => {
  const base = new URL(page.url()).origin;
  const checks = [];
  const check = (ok, label) => {
    if (!ok) throw new Error(label);
    checks.push(label);
  };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base + '/');
  await page.waitForFunction(() => document.querySelector('main')?.dataset.homeMediaStatus === 'ready');
  await page.waitForTimeout(1300);
  await page.evaluate(() => document.querySelector('.hero-works-cta').click());
  await page.waitForTimeout(100);
  const header = await page.locator('.site-header').evaluate(el => ({
    opacity: el.style.opacity, transform: el.style.transform,
  }));
  await page.waitForTimeout(1800);
  const headerAfter = await page.locator('.site-header').evaluate(el => ({
    opacity: el.style.opacity, transform: el.style.transform,
  }));
  check(JSON.stringify(header) === JSON.stringify(headerAfter), 'Unmount stops asynchronous header animation');

  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/media/digital-market/*', async route => {
    await held;
    await route.continue();
  });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('main')?.dataset.homeMediaStatus === 'loading');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  release();
  await page.waitForTimeout(1600);
  check(await page.locator('.hero-scene').evaluate(el => !el.style.clipPath),
    'Switching to reduced motion cancels pending reveal animation');
  check(await page.evaluate(() => !document.documentElement.classList.contains('motion-opening')),
    'Switching motion preference releases scroll lock');
  await page.unroute('**/media/digital-market/*');
  for (const [preference, path] of [['reduce', '/'], ['no-preference', '/#about']]) {
    await page.emulateMedia({ reducedMotion: preference });
    await page.goto(base + '/employees');
    let allow;
    const pending = new Promise(resolve => { allow = resolve; });
    await page.route('**/media/digital-market/*', async route => {
      await pending;
      await route.continue();
    });
    await page.goto(base + path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    check(await page.locator('.opening-sequence').evaluate(el =>
      getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility === 'visible'),
    `${preference} ${path} waits behind static cover`);
    allow();
    await page.waitForFunction(() => document.querySelector('main')?.dataset.homeMediaStatus === 'ready');
    check(await page.locator('.opening-sequence').evaluate(el =>
      getComputedStyle(el).visibility === 'hidden' || getComputedStyle(el).display === 'none'),
    `${preference} ${path} releases static cover`);
    await page.unroute('**/media/digital-market/*');
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  return { passed: checks.length, checks };
}
