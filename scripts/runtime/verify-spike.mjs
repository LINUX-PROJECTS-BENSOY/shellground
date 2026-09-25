/**
 * SHELLGROUND Runtime Spike Verification Runner
 * Runs live WASIX execution against the pinned wasmer/bash package.
 */

import { Wasmer } from '@wasmer/sdk/node';

async function runVerification() {
  console.log('=== SHELLGROUND LIVE RUNTIME SPIKE VERIFICATION ===\n');
  const wasmer = new Wasmer();
  await wasmer.ready();
  console.log('[✓] Wasmer client initialized.');

  const sandbox = await wasmer.sandboxes.create({
    packages: ['wasmer/bash@1.0.25', 'wasmer/grep@3.12.0', 'wasmer/find@4.10.0'],
    shell: 'bash',
    network: { mode: 'disabled' },
  });
  console.log('[✓] Sandbox created with wasmer/bash@1.0.25, grep@3.12.0, find@4.10.0, network:disabled.');

  const run = async (cmdLine) => {
    const cmd = sandbox.shell(cmdLine);
    const output = await cmd.run({ check: false });
    return {
      code: output.exitCode,
      stdout: output.stdout.text().trim(),
      stderr: output.stderr.text().trim(),
    };
  };

  const tests = [
    { name: 'pwd', cmd: 'pwd', expect: '/workspace' },
    { name: 'echo', cmd: 'echo "Runtime Spike"', expect: 'Runtime Spike' },
    { name: 'mkdir & cd', cmd: 'mkdir -p /workspace/test && cd /workspace/test && pwd', expect: '/workspace/test' },
    { name: 'touch & ls', cmd: 'touch /workspace/test/a.txt && ls /workspace/test', expect: 'a.txt' },
    { name: 'cat & redirect', cmd: 'echo "content" > /workspace/test/a.txt && cat /workspace/test/a.txt', expect: 'content' },
    { name: 'grep', cmd: 'echo -e "match\\nskip" | grep "match"', expect: 'match' },
    { name: 'wc', cmd: 'echo -e "1\\n2\\n3" | wc -l', expect: '3' },
    { name: 'pipes', cmd: 'echo -e "apple\\nbanana\\napricot" | grep "^a" | wc -l', expect: '2' },
    { name: 'variables', cmd: 'export VAR=OK && echo $VAR', expect: 'OK' },
  ];

  let passed = 0;
  for (const t of tests) {
    const res = await run(t.cmd);
    if (res.code === 0 && res.stdout.includes(t.expect)) {
      console.log(`[PASS] ${t.name}: "${t.cmd}" => ${res.stdout}`);
      passed += 1;
    } else {
      console.error(`[FAIL] ${t.name}: exit ${res.code}, stdout: "${res.stdout}", stderr: "${res.stderr}"`);
    }
  }

  await sandbox.close();
  await wasmer.close();

  console.log(`\nVerification complete: ${passed}/${tests.length} tests passed.`);
  if (passed !== tests.length) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
