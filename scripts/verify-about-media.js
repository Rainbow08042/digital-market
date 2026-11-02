async (page) => {
  const base = new URL(page.url()).origin;
  const results = [], errors = [];
  const check = (ok, label) => { if (!ok) throw new Error(label); results.push(label); };
  const onError = error => errors.push(error.message);
  page.on('pageerror', onError);
  try {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(base + '/#about');
    await page.locator('.portrait-gallery').scrollIntoViewIfNeeded();
    const images = page.locator('.portrait-panel img');
    check(await images.count() === 5, 'Five ABOUT images configured');
    await images.evaluateAll(nodes => Promise.all(nodes.map(node => node.decode())));
    check(await images.evaluateAll(nodes => nodes.every(node => node.naturalWidth > 0)), 'All images decode');
    check(await page.locator('.portrait-rail').count() === 0, 'Collapsed cards have no text or icon rail');
    check(await page.locator('.portrait-presentation').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).visibility === 'visible' && Number(getComputedStyle(node).opacity) > 0)), 'All collapsed cards display original artwork');
    const expected = ['小红书图文创作员', 'AI 旅行规划师', '保密会议纪要员', '财务票据处理员', '网页变化监测员'];
    const expectedIds = ['34', '11', '17', '09', '08'];
    check(await page.locator('.employee-shortlist a').count() === 5, 'Shortlist contains all five featured colleagues');
    for (const width of [1440, 1058, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      for (let i = 0; i < 5; i++) {
        const panel = page.locator('.portrait-panel').nth(i);
        await panel.click();
        check(await panel.getAttribute('aria-pressed') === 'true', `${width}px panel ${i + 1} selects`);
        check((await page.locator('.portrait-detail').innerText()).includes(expected[i]), `${width}px panel ${i + 1} title matches`);
        check(await page.locator('.portrait-detail').getAttribute('href') === `/employee/employee-${expectedIds[i]}`, `${width}px panel ${i + 1} detail target matches`);
        check(await page.locator('.employee-shortlist a').nth(i).getAttribute('href') === `/employee/employee-${expectedIds[i]}`, `${width}px panel ${i + 1} shortlist matches`);
        check((await page.locator('.portrait-concept-note').innerText()).includes('工作场景概念图'), `${width}px panel ${i + 1} description updates`);
        const style = await panel.locator('img').evaluate(node => ({ fit: getComputedStyle(node).objectFit, filter: getComputedStyle(node).filter }));
        check(style.fit === 'cover' && style.filter === 'none', `${width}px panel ${i + 1} preserves concept image proportions without distortion`);
        check(!(await panel.locator('img').getAttribute('src')).endsWith('-preview.webp'), `${width}px panel ${i + 1} uses complete interface`);
        const layout = await panel.evaluate(node => {
          const image = node.querySelector('.portrait-result-window img').getBoundingClientRect();
          const window = node.querySelector('.portrait-result-window').getBoundingClientRect();
          const card = node.getBoundingClientRect();
          const edge = getComputedStyle(node.querySelector('.portrait-result-window'), '::after');
          return { visible: image.height > 0 && image.top >= window.top && image.bottom <= window.bottom + 1, imageShare: image.height / card.height, edge: edge.content !== 'none' && edge.backgroundImage.includes('linear-gradient') && edge.pointerEvents === 'none' };
        });
        check(layout.visible && layout.edge, `${width}px panel ${i + 1} has nonblocking edge vignette`);
        check(layout.imageShare > 0.98, `${width}px panel ${i + 1} image fills card height`);
      }
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px no horizontal overflow`);
      await page.locator('.portrait-gallery').screenshot({ path: `output/playwright/about-ui-${width}.png` });
    }
    await page.locator('.portrait-panel').first().focus();
    await page.keyboard.press('End');
    check(await page.locator('.portrait-panel').last().getAttribute('aria-pressed') === 'true', 'End selects last panel');
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    check(await page.locator('.portrait-panel').nth(1).getAttribute('aria-pressed') === 'true', 'Home and arrow navigation work');
    check(await page.locator('.portrait-concept-note').isVisible(), 'Concept explanation visible');
    check(await page.locator('.portrait-result-title, .portrait-result-detail, .portrait-result-footer').count() === 0, 'Expanded captions and repeated footer removed');
    check(await page.locator('.hero-scene video').count() === 0, 'Rain video remains disconnected');
    check(errors.length === 0, `No runtime errors: ${errors.join('; ')}`);
    return { passed: results.length, results };
  } finally {
    page.off('pageerror', onError);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }
}
