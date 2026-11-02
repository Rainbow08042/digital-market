import test from 'node:test';
import assert from 'node:assert/strict';
import { preloadHomepageImages } from '../src/utils/preloadHomepageMedia.js';

test('resource preparation progress, decode gate, failures and cancellation', async t => {
  const originalFetch = globalThis.fetch;
  const originalImage = globalThis.Image;
  t.after(() => {
    globalThis.fetch = originalFetch;
    globalThis.Image = originalImage;
  });
  const tick = () => new Promise(resolve => setImmediate(resolve));
  let decodes = [];
  globalThis.Image = class {
    decode() { return new Promise(resolve => decodes.push(resolve)); }
  };
  const streams = new Map();
  globalThis.fetch = async source => new Response(new ReadableStream({
    start(controller) { streams.set(source, controller); },
  }), { headers: { 'Content-Length': source === 'small' ? '100' : '900' } });
  const reports = [];
  const pending = preloadHomepageImages(['small', 'large'], {
    onProgress: progress => reports.push(progress),
  });
  await tick();
  streams.get('small').enqueue(new Uint8Array(100));
  streams.get('small').close();
  await tick();
  assert.equal(reports.at(-1).percent, 50, 'Headers and one of two downloads are prepared');
  streams.get('large').enqueue(new Uint8Array(400));
  await tick();
  assert.equal(reports.at(-1).percent, 70, 'Partial file data advances overall preparation');
  streams.get('large').enqueue(new Uint8Array(500));
  streams.get('large').close();
  await tick();
  assert.equal(reports.at(-1).percent, 95, 'Download completion reserves the decode stage');
  decodes.forEach(resolve => resolve());
  const result = await pending;
  assert.equal(result.percent, 100);
  assert.equal(result.loaded, 2);
  assert.equal(result.receivedBytes, 1000);

  globalThis.fetch = async () => { throw new Error('Network failure'); };
  const failure = await preloadHomepageImages(['broken']);
  assert.equal(failure.failed, 1);
  assert.equal(failure.percent, 100);

  globalThis.fetch = async () => new Response(new ReadableStream({ start() {} }),
    { headers: { 'Content-Length': '100' } });
  const controller = new AbortController();
  let callbacks = 0;
  const cancelled = preloadHomepageImages(['pending'], {
    signal: controller.signal, onProgress: () => callbacks++,
  });
  await tick();
  controller.abort();
  assert.equal((await cancelled).aborted, true);
  const callbacksAtAbort = callbacks;
  await tick();
  assert.equal(callbacks, callbacksAtAbort);

  decodes = [];
  globalThis.fetch = async () => new Response(new Uint8Array(20));
  const unknownReports = [];
  const unknown = preloadHomepageImages(['unknown-length'], {
    onProgress: progress => unknownReports.push(progress),
  });
  await tick();
  assert.equal(unknownReports.at(-1).percent, 95, 'Unknown-size completed downloads advance before decode');
  decodes.forEach(resolve => resolve());
  assert.equal((await unknown).percent, 100);
});

test('an image starts streaming before another response sends its headers', async t => {
  const originalFetch = globalThis.fetch, originalImage = globalThis.Image;
  t.after(() => { globalThis.fetch = originalFetch; globalThis.Image = originalImage; });
  const controller = new AbortController();
  let releaseSlow, stream;
  globalThis.Image = class { async decode() {} };
  globalThis.fetch = source => source === 'slow'
    ? new Promise(resolve => { releaseSlow = resolve; })
    : Promise.resolve(new Response(new ReadableStream({ start(c) { stream = c; } }), {
      headers: { 'Content-Length': '100' },
    }));
  const reports = [];
  const pending = preloadHomepageImages(['fast', 'slow'], {
    signal: controller.signal, onProgress: report => reports.push(report),
  });
  stream.enqueue(new Uint8Array(50));
  await new Promise(resolve => setImmediate(resolve));
  const latest = reports.at(-1);
  controller.abort();
  releaseSlow(new Response(new Uint8Array(1)));
  await pending;
  assert.equal(latest.receivedBytes, 50, 'Fast response must be consumed without waiting for slow headers');
  assert.ok(latest.percent > 0 && latest.percent < 100);
  assert.ok(reports.every((v,i) => !i || v.percent >= reports[i-1].percent), 'Progress never reverses');
});
