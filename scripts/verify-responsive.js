async (page) => {
  const base = new URL(page.url()).origin;
  const results = [], errors = [];
  const onError = e => errors.push(e.message);
  page.on('pageerror', onError);
  const check = (condition, label) => { if (!condition) throw new Error(label); results.push(label); };
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1440, height: 960 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    await page.setViewportSize(viewport);
    await page.goto(base + '/');
    await page.waitForTimeout(3700);
    check(await overflow(), `${viewport.width}px homepage fits`);
    const boxes = await page.evaluate(() => {
      const cta = document.querySelector('.hero-works-cta').getBoundingClientRect();
      const covers = document.querySelector('.hero-release-grid').getBoundingClientRect();
      return { bottom: cta.bottom, top: covers.top };
    });
    check(boxes.bottom <= boxes.top + 1, `${viewport.width}px primary link does not overlap covers`);
    if (viewport.width <= 1050) {
      await page.getByRole('button', { name: '打开菜单', exact: true }).click();
      check(await page.locator('#mobile-menu').isVisible(), `${viewport.width}px navigation opens`);
      await page.keyboard.press('Escape');
      check(await page.locator('#mobile-menu').count() === 0, `${viewport.width}px Escape closes navigation`);
      await page.getByRole('button', { name: '打开菜单', exact: true }).click();
      await page.locator('#mobile-menu').getByRole('link', { name: '项目初衷' }).click();
      check(await page.locator('#mobile-menu').count() === 0, `${viewport.width}px navigation closes on selection`);
    }
    if (viewport.width <= 700) {
      await page.locator('.hero-releases').evaluate(e => e.scrollIntoView({ behavior: 'instant', block: 'end' }));
      const previous = await page.locator('.hero-release-grid').evaluate(e => e.scrollLeft);
      await page.locator('.hero-release-grid').evaluate(e => e.scrollBy({ left: 270, behavior: 'instant' }));
      await page.waitForTimeout(250);
      check(await page.locator('.hero-release-grid').evaluate(e => e.scrollLeft) > previous, `${viewport.width}px cover track scrolls`);
      await page.locator('#about').evaluate(e => e.scrollIntoView({ behavior: 'instant' }));
      await page.waitForTimeout(1800);
      check(await page.locator('#about .fluid-background canvas').count() === 1, `${viewport.width}px fluid canvas initialized`);
    }
    await page.goto(base + '/employees');
    await page.waitForTimeout(850);
    check(await overflow(), `${viewport.width}px directory fits`);
    await page.screenshot({ path: `output/playwright/rebuild-directory-${viewport.width}.png` });
    await page.getByRole('button', { name: '列表视图', exact: true }).click();
    check(await overflow(), `${viewport.width}px list fits`);
    await page.goto(base + '/employee/employee-09');
    await page.waitForTimeout(850);
    check(await overflow(), `${viewport.width}px detail fits`);
    await page.screenshot({ path: `output/playwright/rebuild-detail-${viewport.width}.png`, fullPage: viewport.width === 390 });
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(base + '/#about');
  await page.waitForTimeout(2200);
  await page.locator('#about .section-shell').evaluate(e => { e.style.visibility = 'hidden'; });
  await page.locator('#about .fluid-background canvas').screenshot({ path: 'output/playwright/fluid-only-a.png' });
  await page.waitForTimeout(600);
  await page.locator('#about .fluid-background canvas').screenshot({ path: 'output/playwright/fluid-only-b.png' });
  await page.locator('#about .section-shell').evaluate(e => { e.style.visibility = ''; });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '/');
  await page.waitForTimeout(600);
  check(await page.locator('.opening-sequence').evaluate(e => getComputedStyle(e).display) === 'none', 'Reduced motion skips opening');
  check(await page.locator('[data-home-media-status]').getAttribute('data-home-media-status') !== 'loading', 'Reduced motion settles homepage media status');
  check(await page.locator('.hero-scene img').evaluate(e => getComputedStyle(e).animationName) === 'none', 'Reduced motion disables storefront movement');
  const fuzzyA = await page.locator('h1 canvas').evaluate(e => e.toDataURL());
  await page.waitForTimeout(250);
  const fuzzyB = await page.locator('h1 canvas').evaluate(e => e.toDataURL());
  check(fuzzyA === fuzzyB, 'Reduced motion freezes fuzzy typography');
  await page.locator('#about').evaluate(e => e.scrollIntoView({ behavior: 'instant' }));
  await page.locator('#about .section-shell').evaluate(e => { e.style.visibility = 'hidden'; });
  await page.locator('#about .fluid-background canvas').screenshot({ path: 'output/playwright/fluid-reduced-a.png' });
  await page.waitForTimeout(500);
  await page.locator('#about .fluid-background canvas').screenshot({ path: 'output/playwright/fluid-reduced-b.png' });
  await page.locator('#about .section-shell').evaluate(e => { e.style.visibility = ''; });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base + '/');
  await page.waitForTimeout(3600);
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 650) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(1700);
  check(await page.evaluate(() => [...document.images].every(i => i.complete && i.naturalWidth > 0)), 'All configured media loaded');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'output/playwright/rebuild-full-1440.png', fullPage: true });
  check(errors.length === 0, 'No browser runtime errors');
  page.off('pageerror', onError);
  return { passed: results.length, results, errors };
}
