async (page) => {
  const base = 'http://150.158.39.41:8088';
  const errors = [];
  const onError = error => errors.push(error.message);
  page.on('pageerror', onError);
  const checks = [];
  const check = (condition, label) => {
    if (!condition) throw new Error(label);
    checks.push(label);
  };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('main')?.dataset.homeMediaStatus === 'ready');
    await page.waitForFunction(() => !document.documentElement.classList.contains('motion-opening'));
    check(await page.locator('main').getAttribute('data-home-media-progress') === '100%', `${width}: completed at 100%`);
    check(await page.locator('main').getAttribute('data-home-media-total') === '15', `${width}: all 15 images preloaded`);
    check(await page.locator('.hero-scene img').evaluate(image => image.complete && image.naturalWidth > 0),
      `${width}: hero image rendered`);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${width}: no horizontal overflow`);
    await page.screenshot({ path: `output/playwright/public-loading-complete-${width}.png` });
  }
  await page.goto(base + '/employees');
  check(await page.getByRole('textbox', { name: '搜索数字员工' }).isVisible(), 'Public directory works');
  await page.goto(base + '/employee/employee-01');
  check(await page.locator('.detail-heading h1').innerText() === '浏览器自动化员工', 'Direct detail route works');
  check(errors.length === 0, 'No runtime errors');
  page.off('pageerror', onError);
  await page.goto(base + '/');
  return { passed: checks.length, checks, errors };
}
