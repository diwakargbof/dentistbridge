// scripts/build.js — esbuild bundler for the React frontend
const esbuild = require('esbuild');
const path    = require('path');

const isWatch = process.argv.includes('--watch');
const isProd  = process.env.NODE_ENV === 'production';

const options = {
  entryPoints: [path.join(__dirname, '..', 'src', 'app.jsx')],
  bundle: true,
  outfile: path.join(__dirname, '..', 'dist', 'bundle.js'),
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  target: ['es2020', 'chrome90', 'safari14'],
  define: {
    'process.env.NODE_ENV': isProd ? '"production"' : '"development"',
  },
  loader: { '.jsx': 'jsx' },
  minify: isProd,
  sourcemap: !isProd,
};

if (isWatch) {
  esbuild.context(options).then(ctx => {
    ctx.watch();
    console.log('[esbuild] watching src/ for changes…');
  });
} else {
  esbuild.build(options)
    .then(() => console.log('[esbuild] ✓ build → dist/bundle.js'))
    .catch(e => { console.error(e); process.exit(1); });
}
