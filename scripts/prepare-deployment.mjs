import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stamp = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
}).format(new Date()).replace(/[-: ]/g, '');
const release = path.join(root, 'output', 'deployment', `digital-market-${stamp}`);
const site = path.join(release, 'site');
await mkdir(site, { recursive: true });

// Ship only the current site's runtime files, excluding unused artwork, drafts,
// offline reference archives, source files, dependencies, and local credentials.
for (const entry of ['index.html', 'favicon.svg', 'assets', 'fonts', 'media/digital-market' ,'ceo-workspace']) {
  await cp(path.join(root, 'dist', entry), path.join(site, entry), { recursive: true });
}

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(absolute) : [absolute];
  }));
  return files.flat();
}

for (const filename of await filesUnder(site)) {
  if (!/\.(?:js|css|html|svg)$/.test(filename)) continue;
  const content = await readFile(filename);
  if (content.length < 512) continue;
  const compressed = gzipSync(content, { level: 9 });
  if (compressed.length < content.length) await writeFile(filename + '.gz', compressed);
}

const manifest = await Promise.all((await filesUnder(site)).sort().map(async filename => {
  const content = await readFile(filename);
  return {
    path: path.relative(site, filename).replaceAll(path.sep, '/'),
    bytes: content.length,
    sha256: createHash('sha256').update(content).digest('hex'),
  };
}));
const archive = path.join(release, 'digital-market-site.tar.gz');
execFileSync('tar', ['-czf', archive, '-C', site, '.'], { stdio: 'pipe' });
const archiveContent = await readFile(archive);
await writeFile(path.join(release, 'manifest.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  timezone: 'Asia/Shanghai',
  archive: path.basename(archive),
  archiveSha256: createHash('sha256').update(archiveContent).digest('hex'),
  files: manifest,
}, null, 2) + '\n');
await cp(path.join(root, 'scripts', 'inspect-deployment-server.sh'), path.join(release, 'inspect-server.sh'));
await writeFile(path.join(release, 'DEPLOYMENT-STATUS.txt'), [
  '数字超市：生产包已生成',
  '目标服务器：150.158.39.41',
  '本文件仅记录该构建包的准备状态，不代表当前线上网站状态。',
  '当前线上服务与地址见项目 README；完成本包部署后更新本文件。',
  '',
  '部署前先运行 inspect-server.sh，只读取系统、服务、端口与目录概况。',
  '现有数字超市使用 /srv/digital-market、digital-market.service 和 8088 端口。',
  '已安装的服务器应使用新的版本目录并切换 current 链接，不重复运行首次安装脚本。',
  '不覆盖现有项目，不停止现有服务，不替换共享 Web 配置。',
  '单页应用需要将 /employee/* 等前端路由回退到 index.html。',
  '包内 .gz 文件供支持预压缩静态文件的 Web 服务使用。',
  '上线后检查首页、五张封面、详情页直接访问及现有项目可用性。',
  '',
].join('\n'));
console.log(JSON.stringify({
  release, archive, files: manifest.length,
  archiveBytes: (await stat(archive)).size,
  archiveSha256: createHash('sha256').update(archiveContent).digest('hex'),
}, null, 2));
