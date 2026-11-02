import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { employeeDetails } from '../src/data/employeeDetails.js';

test('all employee profiles have complete, distinct presentation copy', async () => {
  const records = JSON.parse(await readFile(new URL('../src/data/employees.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(employeeDetails).sort(), records.map(item => item.id).sort());
  for (const { id } of records) {
    const detail = employeeDetails[id];
    for (const field of ['headline', 'problem', 'value', 'future', 'boundary']) {
      assert.equal(typeof detail[field], 'string', `${id}: ${field}`);
      assert.ok(detail[field].length >= 12, `${id}: ${field} is substantive`);
    }
    for (const [field, count] of [['steps', 3], ['outputs', 3], ['example', 2], ['images', 2]]) {
      assert.equal(detail[field].length, count, `${id}: ${field}`);
      assert.ok(detail[field].every(value => typeof value === 'string' && value.length > 3), `${id}: ${field} text`);
    }
    assert.equal(detail.scenarios.length, 2, `${id}: scenarios`);
    assert.ok(detail.scenarios.every(scene => scene.length === 2 && scene.every(value => value.length > 3)), `${id}: scenario text`);
    assert.equal(detail.imageAssets?.length, 2, `${id}: both story images are complete`);
    if (detail.imageAssets) {
      assert.equal(detail.imageAssets.length, 2, `${id}: both story images provided`);
      for (const asset of detail.imageAssets) {
        assert.match(asset.src, /^\/media\/digital-market\/[\w-]+\.webp$/);
        assert.ok(asset.alt.length > 20 && asset.caption.length > 12, `${id}: meaningful image descriptions`);
        const bytes = await readFile(new URL(`../public${asset.src}`, import.meta.url));
        assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${id}: valid WebP asset`);
      }
    }
  }
  for (const field of ['headline', 'problem', 'future']) {
    assert.equal(new Set(Object.values(employeeDetails).map(detail => detail[field])).size, records.length, `${field} must be tailored to each role`);
  }
});
