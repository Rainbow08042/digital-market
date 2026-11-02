async (page) => {
  const base = new URL(page.url()).origin;
  const checks = [], errors = [];
  page.setDefaultTimeout(30000);
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const check = (ok, message) => { if (!ok) throw Error(message); checks.push(message); };
  for (let number = 1; number <= 41; number++) {
    const id = `employee-${String(number).padStart(2, '0')}`;
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/employee/${id}`, { waitUntil: 'domcontentloaded' });
    await page.locator('.detail-thesis').waitFor();
    check(await page.locator('.detail-story-section').count() === 5 && await page.locator('.detail-image-placeholder, .detail-story-image').count() === 2, `${id}: complete story and two image slots`);
    check(await page.locator('.detail-scenarios article').count() === 2 && await page.locator('.detail-steps li').count() === 3 && await page.locator('.detail-outputs li').count() === 3, `${id}: scenarios, workflow and outputs`);
    const desktopFits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    check(desktopFits, `${id}: desktop fits`);
    check(await page.locator('.detail-story-image').count() === 2 && await page.locator('.detail-image-placeholder').count() === 0, `${id}: both final images replace placeholders`);
    check(await page.locator('.detail-story-body > .detail-story-image').count() === 2, `${id}: images remain in the supporting content column`);
    for (const figure of await page.locator('.detail-story-image').all()) {
      await figure.scrollIntoViewIfNeeded();
      await page.waitForFunction(src => [...document.querySelectorAll('.detail-story-image img')].some(img => img.getAttribute('src') === src && img.closest('figure').dataset.state === 'ready' && img.naturalWidth > 1500), await figure.locator('img').getAttribute('src'));
      check(await figure.locator('a').first().getAttribute('href') === await figure.locator('img').getAttribute('src') && await figure.locator('a').first().getAttribute('target') === '_blank', `${id}: decoded scene links to its full original`);
      check(await figure.locator('img').evaluate(img => Math.abs(img.clientWidth / img.clientHeight - img.naturalWidth / img.naturalHeight) < .02), `${id}: scene preserves its full aspect ratio`);
    }
    if ([3, 4, 9, 16, 26, 34, 37, 38].includes(number)) {
      await page.locator('#workflow').screenshot({ path: `output/playwright/${id}-complete-workflow-desktop.png` });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${id}: 390px fits`);
    if ([3, 4, 9, 16, 26, 34, 37, 38].includes(number)) {
      await page.locator('#deliverables').screenshot({ path: `output/playwright/${id}-complete-delivery-mobile.png` });
    }
    await page.setViewportSize({ width: 320, height: 800 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${id}: 320px fits`);
    check(await page.locator('.detail-boundary, .detail-context').count() === 0, `${id}: presentation excludes setup commentary`);
  }
  await page.goto(`${base}/employee/employee-16`);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.detail-capability summary').click();
  check(await page.locator('.detail-capability p').isVisible(), 'Full capability description expands');
  await page.locator('.detail-chapters a[href="#deliverables"]').click();
  await page.waitForFunction(() => {
    const top = document.getElementById('deliverables').getBoundingClientRect().top;
    return top >= 80 && top < 180;
  });
  check(await page.evaluate(() => {
    const rect = document.getElementById('deliverables').getBoundingClientRect();
    return location.hash === '#deliverables' && rect.top >= 80 && rect.top < 180;
  }), 'Chapter link scrolls to visible heading below header');
  await page.screenshot({ path: 'output/playwright/employee-story-delivery-desktop.png' });
  await page.locator('.detail-chapters').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'output/playwright/employee-story-overview-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#workflow').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'output/playwright/employee-story-workflow-mobile.png' });
  await page.goto(`${base}/employee/employee-unknown`);
  check(await page.locator('.not-found').isVisible(), 'Unknown employee still shows 404');
  await page.goto(`${base}/employees`);
  await page.locator('.employee-copy').first().click();
  await page.locator('.detail-thesis').waitFor();
  check(page.url().includes('/employee/employee-01'), 'Directory card opens enriched detail');
  const storyImages = page.locator('.detail-story-image');
  await page.setViewportSize({ width: 1440, height: 1000 });
  check(await storyImages.count() === 2 && await page.locator('.detail-image-placeholder').count() === 0, 'Browser employee has both images and no remaining placeholders');
  check(await page.locator('.detail-story-body > .detail-story-image').count() === 2, 'Story images sit alongside their supporting copy in the content column');
  check(await storyImages.first().evaluate(figure => {
    const section = figure.closest('section').getBoundingClientRect();
    const body = figure.parentElement.getBoundingClientRect();
    const image = figure.getBoundingClientRect();
    return Math.abs(image.width - body.width) < 2 && image.width < section.width * .7;
  }), 'Desktop images use the placeholder content width instead of spanning the section');
  for (const figure of await storyImages.all()) {
    await figure.scrollIntoViewIfNeeded();
    await page.waitForFunction(src => {
      const img = [...document.querySelectorAll('.detail-story-image img')].find(img => img.getAttribute('src') === src);
      return img?.closest('figure').dataset.state === 'ready' && img.naturalWidth > 1000;
    }, await figure.locator('img').getAttribute('src'));
    check(await figure.locator('figcaption').innerText().then(text => !/AI 生成|演示数据|落地前/.test(text)), 'Decoded image has a concise business caption');
    check(await figure.locator('a').first().getAttribute('target') === '_blank', 'Detailed image can be opened full size');
  }
  await page.setViewportSize({ width: 1440, height: 1100 });
  await storyImages.first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'output/playwright/employee-01-workflow-screen-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await storyImages.last().scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'output/playwright/employee-01-delivery-screen-mobile.png' });
  await page.route('**/employee-01-*-screen-v3.webp', route => route.abort());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.detail-story-image').first().scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.detail-story-image')?.dataset.state === 'error');
  check(await page.locator('.detail-story-image .detail-screen-status').first().innerText().then(text => text.includes('打开原图')), 'Failed image retains a readable recovery link');
  await page.unrouteAll({ behavior: 'wait' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.detail-story-image').first().scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.detail-story-image')?.dataset.state === 'ready');
  await page.goto(`${base}/employee/employee-02`, { waitUntil: 'domcontentloaded' });
  check(await page.locator('main[data-detail-theme="data"]').count() === 1 && await page.locator('.detail-image-placeholder').count() === 0, 'Web extraction employee has its own data theme and completed image slots');
  for (const figure of await page.locator('.detail-story-image').all()) {
    await figure.scrollIntoViewIfNeeded();
    await page.waitForFunction(src => {
      const img = [...document.querySelectorAll('.detail-story-image img')].find(img => img.getAttribute('src') === src);
      return img?.closest('figure').dataset.state === 'ready' && img.naturalWidth > 1000;
    }, await figure.locator('img').getAttribute('src'));
    check(true, 'Extraction scene image fully decoded');
  }
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Extraction profile fits ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.locator('.detail-story-image').last().scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'output/playwright/employee-02-data-delivery-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#workflow').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'output/playwright/employee-02-data-workflow-mobile.png' });
  check(errors.length === 0, `No browser runtime errors: ${errors.join(', ')}`);
  return { total: checks.length, checks, errors };
}
