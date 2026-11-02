async (page) => {
  const base = new URL(page.url()).origin;
  const checks = [], errors = [];
  const check = (condition, label) => { if (!condition) throw new Error(label); checks.push(label); };
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/?review=ceo#ceo-workspace');
  await page.waitForFunction(() => document.querySelector('main').dataset.homeMediaStatus !== 'loading');
  const ids = await page.locator('.hero-release-card').evaluateAll(cards => cards.map(card => card.getAttribute('href')));
  check(JSON.stringify(ids) === JSON.stringify(['35', '39', '07', '18', '41'].map(id => '/employee/employee-' + id)), 'Five featured employees match the requested business roles');
  for (const img of await page.locator('.hero-release-card img').all()) await img.evaluate(element => element.decode());
  check(await page.locator('.hero-release-card img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), 'All five featured images load');
  check(await page.locator('#ceo-workspace').evaluate(section => section.previousElementSibling.id === 'about' && section.nextElementSibling.id === 'works'), 'CEO workspace is directly after ABOUT and before purpose');
  check((await page.locator('#ceo-workspace .section-ref').textContent()).includes('02 / CEO 工作台'), 'CEO workspace has section number 02');
  for (const text of ['业务信息', '组织信息', '生产信息', '实时采集', '关联核对', '自动总结', '跨部门汇总', '电脑端', '手机端', 'FDE 部署', '人工职责']) {
    check((await page.locator('#ceo-workspace').innerText()).includes(text), 'CEO workspace includes ' + text);
  }
  check((await page.locator('.stats').innerText()).includes('41'), 'Homepage total reflects 41 employees');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(300);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Homepage fits ${width}px`);
    check(await page.locator('#ceo-workspace').evaluate(section => [...section.querySelectorAll('article, ol')].every(element => element.getBoundingClientRect().right <= innerWidth)), `CEO panels fit ${width}px`);
    check(await page.locator('#ceo-workspace .section-title canvas:visible').evaluateAll(canvases => canvases.every(canvas => canvas.getBoundingClientRect().width - 80 <= canvas.closest('.section-shell').clientWidth)), `CEO title fits ${width}px`);
    if ([1440, 390].includes(width)) await page.locator('#ceo-workspace').screenshot({ path: `output/playwright/ceo-workspace-${width}.png` });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/employees');
  check((await page.locator('.result-count').innerText()).includes('41'), 'Directory includes 41 employees');
  check(await page.locator('.directory-heading sup').innerText() === '41', 'Directory heading shows the updated employee total');
  for (const [id, title] of [['39', '经营分析员'], ['40', '网站安全分析师'], ['41', '采购比价员']]) {
    await page.getByRole('textbox', { name: '搜索数字员工' }).fill(title);
    check(await page.locator('#catalog .employee-card').count() === 1, title + ' is searchable');
    await page.locator('.employee-copy').click();
    check(page.url().endsWith('/employee/employee-' + id), title + ' opens correct detail');
    check(await page.locator('h1').innerText() === title, title + ' has the correct heading');
    await page.locator('.detail-art img').evaluate(img => img.decode());
    check(await page.locator('.detail-art img').evaluate(img => Math.abs(img.naturalWidth / img.naturalHeight - 1) < .02 && !img.src.includes('-screen-')), title + ' uses a square workplace cover distinct from detail screenshots');
    await page.locator('.detail-art').screenshot({ path: `output/playwright/employee-${id}-workplace-cover.png` });
    check(await page.locator('.detail-steps li').count() === 3, title + ' has a complete workflow');
    for (const image of await page.locator('.detail-story-image img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
    }
    check(await page.locator('.detail-story-image').count() === 2, title + ' has two complete story images');
    check(await page.locator('.detail-image-placeholder').count() === 0, title + ' has no image placeholders');
    await page.locator('#workflow').screenshot({ path: `output/playwright/employee-${id}-new-workflow.png` });
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${title} fits ${width}px`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + '/employees');
  }
  await page.goto(base + '/#ceo-workspace');
  await page.waitForFunction(() => document.querySelector('main').dataset.homeMediaStatus !== 'loading');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base + '/');
  await page.waitForFunction(() => document.querySelector('main').dataset.homeMediaStatus !== 'loading' && !document.documentElement.classList.contains('motion-opening'));
  check(await page.locator('.opening-sequence').evaluate(element => getComputedStyle(element).visibility === 'hidden'), 'Normal opening completes with the new featured media');
  await page.locator('.hero-releases').screenshot({ path: 'output/playwright/business-featured-employees.png' });
  await page.locator('.desktop-nav a[href="/#ceo-workspace"]').click();
  await page.waitForFunction(() => Math.abs(document.getElementById('ceo-workspace').getBoundingClientRect().top - 82) < 5);
  check(page.url().endsWith('#ceo-workspace'), 'CEO navigation lands below the fixed header');
  check(errors.length === 0, 'No browser runtime errors');
  return { total: checks.length, checks, errors };
}
