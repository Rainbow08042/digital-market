async (page) => {
  const report = [];
  await page.setViewportSize({ width: 1440, height: 960 });
  let releaseMedia;
  const heldMedia = new Promise(resolve => { releaseMedia = resolve; });
  await page.route('**/media/digital-market/*', async route => {
    await heldMedia;
    await route.continue();
  });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(550);
  report.push({
    state: 'delayed',
    status: await page.locator('[data-home-media-status]').getAttribute('data-home-media-status'),
    progress: await page.locator('[data-home-media-progress]').getAttribute('data-home-media-progress'),
  });
  await page.screenshot({ path: 'output/playwright/rebuild-opening.png' });
  releaseMedia();
  await page.waitForFunction(() => !document.documentElement.classList.contains('motion-opening'));
  await page.unroute('**/media/digital-market/*');
  await page.route('**/media/digital-market/cover-05-video-editor.webp', route => route.abort());
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(3800);
  report.push({
    state: 'failed',
    status: await page.locator('[data-home-media-status]').getAttribute('data-home-media-status'),
    progress: await page.locator('[data-home-media-progress]').getAttribute('data-home-media-progress'),
  });
  await page.screenshot({ path: 'output/playwright/rebuild-opening-failed-media.png' });
  await page.unroute('**/media/digital-market/cover-05-video-editor.webp');
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(3700);
  await page.screenshot({ path: 'output/playwright/rebuild-home-1440.png' });
  for (const section of ['about', 'works', 'capabilities', 'contact']) {
    await page.locator(`#${section}`).evaluate(e => window.scrollTo({ top: e.offsetTop - 82, behavior: 'instant' }));
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `output/playwright/rebuild-${section}-1440.png` });
    if (section === 'about') {
      await page.locator('.portrait-accordion').evaluate(e => window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 150, behavior: 'instant' }));
      await page.waitForTimeout(1800);
      await page.screenshot({ path: 'output/playwright/rebuild-gallery-1440.png' });
      await page.locator('#about .fluid-background canvas').screenshot({ path: 'output/playwright/rebuild-fluid-a.png' });
      await page.waitForTimeout(500);
      await page.locator('#about .fluid-background canvas').screenshot({ path: 'output/playwright/rebuild-fluid-b.png' });
    }
  }
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(3800);
    await page.screenshot({ path: `output/playwright/rebuild-home-${viewport.width}.png` });
    report.push({ width: viewport.width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      hero: await page.locator('.hero').boundingBox(), cta: await page.locator('.hero-works-cta').boundingBox(), releases: await page.locator('.hero-releases').boundingBox() });
    if (viewport.width <= 390) {
      await page.locator('.hero-releases').evaluate(e => e.scrollIntoView({ behavior: 'instant', block: 'end' }));
      await page.screenshot({ path: `output/playwright/rebuild-covers-${viewport.width}.png` });
      await page.locator('#about').evaluate(e => e.scrollIntoView({ behavior: 'instant' }));
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `output/playwright/rebuild-about-${viewport.width}.png` });
    }
  }
  return report;
}
