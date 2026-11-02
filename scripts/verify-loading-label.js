async (page) => {
  const base = new URL(page.url()).origin;
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/media/digital-market/*', async route => {
    await held;
    await route.continue();
  });
  const position = () => page.locator('.opening-index').evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => /^LOADING \/ \d+%$/.test(document.querySelector('.opening-index')?.textContent || ''));
  const loading = await position();
  await page.screenshot({ path: 'output/playwright/loading-percent.png' });
  release();
  await page.waitForFunction(() => document.querySelector('.opening-index')?.textContent === 'DIGITAL MARKET / 01');
  await page.waitForTimeout(650);
  const brand = await position();
  if (Math.abs(loading.x - brand.x) > 1 || Math.abs(loading.y - brand.y) > 1) {
    throw new Error(`Loading and brand positions differ: ${JSON.stringify({ loading, brand })}`);
  }
  if (await page.locator('main').getAttribute('data-home-media-progress') !== '100%') {
    throw new Error('Completed loading must report 100%');
  }
  await page.screenshot({ path: 'output/playwright/loading-brand-alignment.png' });
  await page.unroute('**/media/digital-market/*');
  await page.waitForFunction(() => !document.documentElement.classList.contains('motion-opening'));
  return { passed: 2, loading, brand };
}
