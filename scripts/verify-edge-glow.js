async (page) => {
  const checks = [], errors = [];
  const onError = error => errors.push(error.message);
  page.on('pageerror', onError);
  const check = (condition, label) => { if (!condition) throw new Error(label); checks.push(label); };
  const angles = locator => locator.evaluateAll(elements => elements.map(element => ({
    angle: getComputedStyle(element, '::before').getPropertyValue('--glow-angle'),
    duration: parseFloat(getComputedStyle(element, '::before').animationDuration),
    phase: getComputedStyle(element, '::before').animationDelay,
    layers: element.getAnimations({ subtree: true }).filter(animation => animation.animationName === 'border-glow-orbit').length,
    interactive: getComputedStyle(element, '::before').pointerEvents,
  })));
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(3800);
  await page.mouse.move(5, 5);
  check(await page.locator('.edge-glow').count() === 13, 'All five covers, four projects and four capabilities share the effect');
  for (const [selector, duration, name] of [
    ['.hero-release-glow', 6.96, 'covers'],
    ['.project-glow', 6.64, 'projects'],
    ['.strength-glow', 6.48, 'capabilities'],
  ]) {
    const locator = page.locator(selector);
    await locator.first().evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(2200);
    const before = await angles(locator);
    await page.waitForTimeout(650);
    const after = await angles(locator);
    check(before.every((value, index) => value.angle !== after[index].angle), `${name}: every border moves with the pointer outside`);
    check(before.every(value => value.layers === 3), `${name}: sharp rim, blurred rim and outer halo all animate`);
    check(before.every(value => Math.abs(value.duration - duration) < .001), `${name}: reference timing preserved`);
    check(before.every(value => value.interactive === 'none'), `${name}: light layers do not intercept links`);
    if (name !== 'projects') check(new Set(before.map(value => value.phase)).size === before.length, `${name}: staggered phases`);
    // Hide the unrelated fluid canvas so frame differences isolate the border.
    await page.locator('.fluid-background').evaluateAll(elements => elements.forEach(element => { element.style.visibility = 'hidden'; }));
    await locator.first().screenshot({ path: `output/playwright/edge-${name}-a.png` });
    await page.waitForTimeout(850);
    await locator.first().screenshot({ path: `output/playwright/edge-${name}-b.png` });
    await page.locator('.fluid-background').evaluateAll(elements => elements.forEach(element => { element.style.visibility = ''; }));
  }
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Desktop layout has no overflow');
  await page.locator('.strength-grid').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'output/playwright/edge-capabilities-desktop.png' });
  await page.locator('.strength-card').nth(2).click();
  check(page.url().endsWith('/employees?category=research'), 'Capability link remains clickable through the halo');
  await page.goto('http://127.0.0.1:5173/#works');
  await page.locator('.project-2').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.waitForTimeout(2200);
  await page.screenshot({ path: 'output/playwright/edge-project-desktop.png' });
  await page.locator('.project-2 .project-image-wrap').click();
  check(page.url().endsWith('/#works'), 'Purpose card does not navigate to an employee');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(3700);
  await page.locator('.hero-releases').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'end' }));
  const cover = page.locator('.hero-release-glow').first();
  check(await cover.evaluate(element => getComputedStyle(element).animationName) === 'hero-release-mobile-glow', 'Mobile covers also have the reference brightness cycle');
  const mobileBefore = await angles(cover);
  const filterBefore = await cover.evaluate(element => getComputedStyle(element).filter);
  await cover.screenshot({ path: 'output/playwright/edge-mobile-a.png' });
  await page.waitForTimeout(800);
  const mobileAfter = await angles(cover);
  check(mobileBefore[0].angle !== mobileAfter[0].angle, 'Mobile border orbits without hover');
  check(filterBefore !== await cover.evaluate(element => getComputedStyle(element).filter), 'Mobile cover brightness changes');
  await cover.screenshot({ path: 'output/playwright/edge-mobile-b.png' });
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile layout has no overflow');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:5173/');
  await page.locator('.hero-releases').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'end' }));
  await page.waitForTimeout(300);
  check(await page.locator('.edge-glow').evaluateAll(elements => elements.every(element =>
    getComputedStyle(element, '::before').animationName === 'none' &&
    getComputedStyle(element, '::after').animationName === 'none' &&
    getComputedStyle(element.querySelector('.edge-light')).animationName === 'none'
  )), 'Reduced motion stops every border layer');
  check(await cover.evaluate(element => getComputedStyle(element).animationName) === 'none', 'Reduced motion stops mobile brightness cycle');
  await cover.screenshot({ path: 'output/playwright/edge-reduced-a.png' });
  await page.waitForTimeout(600);
  await cover.screenshot({ path: 'output/playwright/edge-reduced-b.png' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  check(errors.length === 0, 'No browser runtime errors');
  page.off('pageerror', onError);
  return { passed: checks.length, checks, errors };
}
