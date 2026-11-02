import fs from 'node:fs/promises';
const base = 'https://jongmusic.onrender.com';
const directory = new URL('../output/reference/', import.meta.url);
await fs.mkdir(directory, { recursive: true });
const html = await (await fetch(base)).text();
await fs.writeFile(new URL('index.html', directory), html);
const resources = [...new Set([...html.matchAll(/(?:href|src)="([^"]+\.(?:js|css))"/g)].map(m => m[1]))];
for (const resource of resources) {
  const result = await fetch(new URL(resource, base));
  if (result.ok) await fs.writeFile(new URL(resource.split('/').pop(), directory), await result.text());
}
console.log(`Saved HTML and ${resources.length} public frontend resources for static inspection.`);
