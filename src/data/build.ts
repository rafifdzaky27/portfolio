// Build-time facts for the footer, the terminal, the 404 page and the curl résumé.
// In GitHub Actions these come from the run; locally from git.
import { execSync } from 'node:child_process';

const git = (args: string) => {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
};

const fullSha = process.env.GITHUB_SHA || git('rev-parse HEAD');
const repo = 'https://github.com/rafifdzaky27/portfolio';

export const build = {
  sha: fullSha ? fullSha.slice(0, 7) : 'unknown',
  commitUrl: fullSha ? `${repo}/commit/${fullSha}` : repo,
  repo,
  builtAt: new Date().toISOString(),
  ci: !!process.env.GITHUB_ACTIONS,
  run: process.env.GITHUB_RUN_NUMBER || '',
  runUrl: process.env.GITHUB_RUN_ID ? `${repo}/actions/runs/${process.env.GITHUB_RUN_ID}` : '',
  pipeline: ['GitHub Actions', 'Tailscale', 'rsync', 'atomic symlink'],
  // Replaced after the build by scripts/build.mjs, once the numbers exist.
  buildMs: '__BUILD_MS__',
  pages: '__PAGES__',
  size: '__DIST_SIZE__',
};
