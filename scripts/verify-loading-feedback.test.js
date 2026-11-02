import test from 'node:test';
import assert from 'node:assert/strict';
import { startLoadingFeedback } from '../src/utils/loadingFeedback.js';

test('a first animation frame timestamp before initialization cannot make progress negative', t => {
  const original = { raf: globalThis.requestAnimationFrame, cancel: globalThis.cancelAnimationFrame, media: globalThis.matchMedia };
  t.after(() => {
    globalThis.requestAnimationFrame = original.raf;
    globalThis.cancelAnimationFrame = original.cancel;
    globalThis.matchMedia = original.media;
  });
  t.mock.method(performance, 'now', () => 1000);
  let frame;
  globalThis.requestAnimationFrame = callback => { frame = callback; return 1; };
  globalThis.cancelAnimationFrame = () => {};
  globalThis.matchMedia = () => ({ matches: false });
  const elements = Object.fromEntries(['.opening-index', '.opening-line', '.opening-status'].map(key => [key, { style: {}, textContent: '' }]));
  const root = { dataset: {}, querySelector: key => elements[key] };
  const controller = new AbortController();
  startLoadingFeedback(root, controller.signal);
  frame(999);
  assert.equal(root.dataset.homeMediaProgress, '0%');
  assert.equal(elements['.opening-line'].style.transform, 'scaleX(0)');
  frame(1016);
  assert.ok(parseInt(root.dataset.homeMediaProgress) >= 0);
  controller.abort();
});
