async (page) => {
  page.setDefaultTimeout(90000);
  page.setDefaultNavigationTimeout(90000);
  const base = new URL(page.url()).origin;
  const checks = [], errors = [];
  const check = (ok, message) => { if (!ok) throw Error(message); checks.push(message); };
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  let allow;
  const held = new Promise(resolve => { allow = resolve; });
  await page.route('**/media/digital-market/*', async route => { await held; await route.continue(); });
  await page.addInitScript(() => {
    if (window.employeeDecodeWrapped) return;
    window.employeeDecodeWrapped = true;
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = async function () {
      await decode.call(this);
      if (window.holdEmployeeDecode && this.src.includes('cover-01-browser-automation') && this.closest('.employee-art')) {
        await new Promise(resolve => { window.releaseEmployeeDecode = resolve; });
      }
    };
  });
  try {
    await page.goto(base + '/employees', { waitUntil: 'domcontentloaded' });
    const first = page.locator('.employee-art').first();
    await first.scrollIntoViewIfNeeded();
    check(await first.getAttribute('data-image-state') === 'loading', 'Pending card has explicit loading state');
    check(await first.locator('img').evaluate(img => getComputedStyle(img).opacity === '0'), 'Pending image is fully hidden');
    check(await first.locator('.employee-image-loading').isVisible(), 'Loading indicator is visible');
    await page.waitForTimeout(700);
    const scanner = () => first.locator('.employee-image-scan').evaluate(el => getComputedStyle(el).transform);
    const before = await scanner(); await page.waitForTimeout(180);
    check(before !== await scanner(), 'Scanner moves during network stall');
    await first.screenshot({ path: 'output/playwright/employee-image-loading-desktop.png' });
    await page.locator('.employee-art').last().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.employee-art')?.dataset.imageActive === 'false');
    check(await first.locator('.employee-image-scan').evaluate(el => getComputedStyle(el).animationPlayState === 'paused'), 'Offscreen loader pauses');
    await first.scrollIntoViewIfNeeded();
    await page.evaluate(() => { window.holdEmployeeDecode = true; });
    allow();
    await page.waitForFunction(() => typeof window.releaseEmployeeDecode === 'function');
    check(await first.getAttribute('data-image-state') === 'loading', 'Downloaded image stays covered until decode resolves');
    check(await first.locator('img').evaluate(img => img.complete && getComputedStyle(img).opacity === '0'), 'Completed download cannot expose partial image');
    await page.evaluate(() => { window.holdEmployeeDecode = false; window.releaseEmployeeDecode(); });
    await page.waitForFunction(() => document.querySelector('.employee-art')?.dataset.imageState === 'ready');
    await page.waitForTimeout(350);
    check(await first.locator('img').evaluate(img => getComputedStyle(img).opacity === '1'), 'Decoded image fades fully into view');
    check(await first.locator('.employee-image-loading').count() === 0, 'Completed card removes loading animation');
  } finally { allow(); await page.unrouteAll({ behavior: 'wait' }); }
  await page.getByRole('button', { name: /^发现更多员工/ }).click();
  check(await page.locator('#catalog .employee-card').count() === 18, 'Load more retains independent card loading');
  await page.getByRole('textbox', { name: '搜索数字员工' }).fill('不存在的员工XYZ');
  check(await page.locator('#catalog .employee-card').count() === 0, 'Search can remove cards without waiting for their images');
  await page.getByRole('textbox', { name: '搜索数字员工' }).fill('');
  check(await page.locator('#catalog .employee-card').count() === 9, 'Clearing search restores the first batch');
  await page.goto(base + '/employees?category=creative');
  const art = page.locator('.employee-art').first();
  await art.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.employee-art')?.dataset.imageState === 'ready');
  check(await page.locator('.employee-card').count() === 9, 'Category directory retains nine cards');
  let attempts = 0;
  await page.route('**/employee-03-document-archivist-v1.webp*', route => ++attempts === 1 ? route.abort() : route.continue());
  await page.goto(base + '/employees?category=office');
  const third = page.locator('.employee-art').filter({ has: page.locator('img[src*="employee-03-"]') });
  await third.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('img[src*="employee-03-"]')?.closest('.employee-art').dataset.imageState === 'error');
  check(await third.locator('.employee-image-loading').count() === 0, 'Failed image stops loading loop');
  await third.screenshot({ path: 'output/playwright/employee-image-error-desktop.png' });
  await third.getByRole('button', { name: '重试加载图片' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('img[src*="employee-03-"]')?.closest('.employee-art').dataset.imageState === 'ready');
  check(page.url().includes('/employees'), 'Retry does not navigate into employee detail');
  check(attempts >= 2, 'Retry makes a new image request');
  check(await page.evaluate(() => document.activeElement?.classList.contains('employee-copy')), 'Keyboard retry preserves focus on the card detail link');
  await page.unrouteAll({ behavior: 'wait' });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + '/employees?category=creative');
    await page.locator('.employee-art').first().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.employee-art')?.dataset.imageState === 'ready');
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: grid fits`);
    await page.getByRole('button', { name: '列表视图', exact: true }).click();
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: list fits`);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let releaseReduced;
  const reducedHold = new Promise(resolve => { releaseReduced = resolve; });
  await page.route('**/media/digital-market/*', async route => { await reducedHold; await route.continue(); });
  try {
    await page.goto(base + '/employees?category=creative', { waitUntil: 'domcontentloaded' });
    const pending = page.locator('.employee-art').first();
    await pending.scrollIntoViewIfNeeded();
    check(await pending.locator('.employee-image-scan').evaluate(el => getComputedStyle(el).display === 'none'), 'Reduced motion hides scanning effect');
    check(await pending.locator('.employee-image-indicator>svg').evaluate(el => getComputedStyle(el).animationName === 'none'), 'Reduced motion disables spinner rotation');
    await pending.screenshot({ path: 'output/playwright/employee-image-loading-mobile.png' });
  } finally { releaseReduced(); await page.unrouteAll({ behavior: 'wait' }); }
  await page.waitForFunction(() => document.querySelector('.employee-art')?.dataset.imageState === 'ready');
  const cards = page.locator('.employee-card');
  await cards.first().locator('.employee-copy').click();
  check(page.url().includes('/employee/employee-'), 'Card text still opens correct detail route');
  check(errors.length === 0, 'No browser runtime errors');
  return { passed: checks.length, checks, errors };
}
