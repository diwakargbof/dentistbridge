// scripts/dev.js — starts esbuild watch + Express server concurrently
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const esbuild = require('esbuild');

const srcEntry = path.join(__dirname, '..', 'src', 'app.jsx');
const outFile  = path.join(__dirname, '..', 'dist', 'bundle.js');

const buildOptions = {
  entryPoints: [srcEntry],
  bundle: true,
  outfile: outFile,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  target: ['es2020'],
  define: { 'process.env.NODE_ENV': '"development"' },
  loader: { '.jsx': 'jsx' },
  sourcemap: true,
};

async function start() {
  console.log('[dev] Building frontend…');
  await esbuild.build(buildOptions).catch(e => { console.error(e); process.exit(1); });
  console.log('[dev] Initial build done. Starting watch + server…');

  // Watch mode
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();

  // Express server
  const server = spawn('node', ['server/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
    cwd: path.join(__dirname, '..'),
  });

  server.on('close', code => {
    console.log('[dev] server exited', code);
    ctx.dispose();
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    console.log('\n[dev] shutting down…');
    server.kill();
    ctx.dispose();
    process.exit(0);
  });
}

start().catch(e => { console.error(e); process.exit(1); });
