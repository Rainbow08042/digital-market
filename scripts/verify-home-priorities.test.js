import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { employeeDetails } from '../src/data/employeeDetails.js';
import { employeeMedia } from '../src/data/media.js';

test('three new business roles have complete directory and detail records', async () => {
  const records = JSON.parse(await readFile(new URL('../src/data/employees.json', import.meta.url), 'utf8'));
  for (const [id, name] of [['employee-39', '经营分析员'], ['employee-40', '网站安全分析师'], ['employee-41', '采购比价员']]) {
    assert.equal(records.find(record => record.id === id)?.name, name);
    assert.equal(employeeDetails[id]?.imageAssets.length, 2);
  }
  assert.equal(records.length, 41);
});

test('new employee covers are independent from their detail screenshots', async () => {
  for (const id of ['employee-39', 'employee-40', 'employee-41']) {
    const cover = employeeMedia({ id }).image;
    assert.ok(!employeeDetails[id].imageAssets.some(asset => asset.src === cover), `${id}: cover must be a separate workplace scene`);
    const bytes = await readFile(new URL(`../public${cover}`, import.meta.url));
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  }
});
