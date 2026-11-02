async (page) => {
  const base = new URL(page.url()).origin;
  const errors = [];
  const onError = error => errors.push(error.message);
  page.on('pageerror', onError);
  for (let index = 1; index <= 41; index++) {
    const id = String(index).padStart(2, '0');
    await page.goto(`${base}/employee/employee-${id}`);
    const text = await page.locator('.original-description').innerText();
    if (!text.trim() || /开源|商业化改造|为基础|许可证|GitHub|仓库|我做的|自主研发|自研/.test(text)) {
      throw new Error(`Unexpected description on employee-${id}: ${text}`);
    }
    if (await page.getByRole('link', { name: '查看开源项目' }).count()) {
      throw new Error(`Source link visible on employee-${id}`);
    }
  }
  await page.goto(base + '/employees');
  await page.getByRole('textbox', { name: '搜索数字员工' }).fill('表单填写');
  if (!(await page.locator('#catalog .employee-card').count())) throw new Error('Revised copy is not searchable');
  if (errors.length) throw new Error(errors.join('\n'));
  page.off('pageerror', onError);
  await page.goto(base + '/employee/employee-01');
  return { detailsChecked: 41, revisedCopySearch: 'passed', runtimeErrors: errors };
}
