import fs from 'node:fs/promises';

const origin = 'https://jongmusic.onrender.com';
const root = new URL('../', import.meta.url);
// Only reference fonts and shader resources; website images use project artwork.
const files = [
  ['/fonts/anton-latin.woff2', 'public/fonts/anton-latin.woff2'],
  ['/fonts/jong-sans.woff2', 'public/fonts/jong-sans.woff2'],
  ['/_next/static/chunks/Ferrofluid-v_E0MpRj.js', 'output/reference/Ferrofluid.js'],
  ['/_next/static/css/Ferrofluid.BwtVVfBl.css', 'output/reference/Ferrofluid.css'],
];

for (const [remote, local] of files) {
  const target = new URL(local, root);
  await fs.mkdir(new URL('./', target), { recursive: true });
  const response = await fetch(origin + remote);
  if (!response.ok) throw new Error(`${remote}: ${response.status}`);
  await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
  console.log(local);
}
