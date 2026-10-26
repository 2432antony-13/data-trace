import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const site = resolve(root, 'site');
const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const files = Object.fromEntries(readdirSync(site, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name !== 'deployment.json')
  .map((entry) => [entry.name, createHash('sha256').update(readFileSync(resolve(site, entry.name))).digest('hex')]));
writeFileSync(resolve(site, 'deployment.json'), JSON.stringify({ sourceSha,
  builtAt: new Date().toISOString(),
  runUrl: process.env.GITHUB_RUN_ID ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null,
  files }, null, 2) + '\n');
