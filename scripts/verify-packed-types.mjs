import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = join(projectRoot, 'tests', 'package-consumers');
const scratchRoot = mkdtempSync(join(tmpdir(), 'finatic-client-package-types-'));

try {
  const packOutput = execFileSync('npm', ['pack', '--json', '--pack-destination', scratchRoot], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  const [{ filename }] = JSON.parse(packOutput);
  const consumerRoot = join(scratchRoot, 'consumer');

  mkdirSync(consumerRoot);
  cpSync(fixtureRoot, consumerRoot, { recursive: true });
  writeFileSync(
    join(consumerRoot, 'package.json'),
    `${JSON.stringify({ name: 'finatic-client-package-consumer', private: true }, null, 2)}\n`
  );

  execFileSync(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      join(scratchRoot, filename),
    ],
    { cwd: consumerRoot, stdio: 'inherit' }
  );

  const tscPath = join(projectRoot, 'node_modules', 'typescript', 'lib', 'tsc.js');
  execFileSync(process.execPath, [tscPath, '--project', join(consumerRoot, 'tsconfig.json')], {
    cwd: consumerRoot,
    stdio: 'inherit',
  });

  const installedPackage = JSON.parse(
    readFileSync(join(consumerRoot, 'node_modules', '@finatic', 'client', 'package.json'), 'utf8')
  );
  if (
    installedPackage.exports?.['.']?.import?.types !== './dist/index.d.mts' ||
    installedPackage.exports?.['.']?.require?.types !== './dist/index.d.cts'
  ) {
    throw new Error(
      'Packed package does not route import/require to condition-specific declarations'
    );
  }
} finally {
  rmSync(scratchRoot, { recursive: true, force: true });
}
