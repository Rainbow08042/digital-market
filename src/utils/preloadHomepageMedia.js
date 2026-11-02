function imageSourcesFrom(entries, sources) {
  for (const entry of entries || []) {
    if (entry?.image) sources.push(entry.image);
  }
}

export function collectHomepageImageSources(homepageMedia) {
  const sources = [];
  if (homepageMedia?.hero?.image) sources.push(homepageMedia.hero.image);
  imageSourcesFrom(homepageMedia?.covers, sources);
  imageSourcesFrom(homepageMedia?.portraits, sources);
  imageSourcesFrom(homepageMedia?.purposes, sources);
  return [...new Set(sources)];
}

export function preloadHomepageImages(sources, { signal, onProgress } = {}) {
  const uniqueSources = [...new Set((sources || []).filter(Boolean))];
  const result = { total: uniqueSources.length, settled: 0, loaded: 0, failed: 0,
    failures: [], receivedBytes: 0, totalBytes: 0, percent: 0 };
  const report = () => onProgress?.({ ...result, failures: [...result.failures] });
  report();
  if (!uniqueSources.length || signal?.aborted) {
    return Promise.resolve({ ...result, percent: signal?.aborted ? 0 : 100, aborted: Boolean(signal?.aborted) });
  }
  return new Promise(resolve => {
    let finished = false;
    const readers = new Set(), objectUrls = new Set();
    const progress = uniqueSources.map(() => 0);
    const update = (index, fraction) => {
      if (finished) return;
      progress[index] = Math.max(progress[index], fraction);
      result.percent = Math.min(99, Math.floor(progress.reduce((sum, value) => sum + value, 0) / result.total * 100 + 1e-7));
      report();
    };
    const finish = aborted => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener('abort', abort);
      for (const reader of readers) reader.cancel().catch(() => {});
      for (const url of objectUrls) URL.revokeObjectURL(url);
      resolve({ ...result, failures: [...result.failures], aborted });
    };
    const abort = () => finish(true);
    signal?.addEventListener('abort', abort, { once: true });
    uniqueSources.forEach(async (source, index) => {
      let objectUrl;
      try {
        const response = await fetch(source, { signal });
        if (finished) { await response.body?.cancel(); return; }
        if (!response.ok) { await response.body?.cancel(); throw new Error('Image response failed'); }
        const declared = Number(response.headers.get('Content-Length'));
        const length = !response.headers.get('Content-Encoding') && declared > 0 ? declared : 0;
        result.totalBytes += length;
        // Each resource contributes connection (5%), download (90%), decode (5%).
        // These fixed work weights allow immediate streaming without a global header barrier.
        update(index, .05);
        const chunks = [];
        let received = 0;
        if (response.body) {
          const reader = response.body.getReader();
          readers.add(reader);
          try {
            while (!finished) {
              const { done, value } = await reader.read();
              if (done || finished) break;
              chunks.push(value);
              received += value.byteLength;
              result.receivedBytes += value.byteLength;
              if (length) update(index, .05 + .9 * Math.min(1, received / length));
            }
          } finally {
            readers.delete(reader);
            reader.releaseLock();
          }
        } else {
          const data = await response.arrayBuffer();
          if (finished) return;
          chunks.push(data);
          result.receivedBytes += data.byteLength;
        }
        if (finished) return;
        update(index, .95);
        objectUrl = URL.createObjectURL(new Blob(chunks, {
          type: response.headers.get('Content-Type') || 'application/octet-stream',
        }));
        objectUrls.add(objectUrl);
        const image = new Image();
        image.decoding = 'async'; image.src = objectUrl;
        await image.decode();
        if (finished) return;
        result.loaded++;
      } catch {
        if (finished) return;
        result.failed++; result.failures.push(source);
      } finally {
        if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrls.delete(objectUrl); }
      }
      if (finished) return;
      result.settled++;
      update(index, 1);
      if (result.settled === result.total) {
        result.percent = 100; report(); finish(false);
      }
    });
  });
}
