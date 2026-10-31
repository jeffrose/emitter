/**
 * Builds the distribution files.
 *
 *     dist/emitter.js        ES module build for modern environments — a verbatim copy of `src/emitter.js`
 *     dist/emitter-umd.js    UMD build transpiled to ES5 for legacy environments
 *     dist/emitter-umd.js.map
 *
 * Run with `npm run build`.
 */
import { transformFileSync } from '@babel/core';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = fileURLToPath(new URL('../src/emitter.js', import.meta.url));
const distribution = fileURLToPath(new URL('../dist', import.meta.url));

mkdirSync(distribution, { recursive: true });

// ES module build
copyFileSync(source, `${distribution}/emitter.js`);

// UMD build
const { code, map } = transformFileSync(source, {
    root,
    sourceMaps: true,
    sourceFileName: 'emitter.js'
});

writeFileSync(`${distribution}/emitter-umd.js`, `${code}\n//# sourceMappingURL=emitter-umd.js.map\n`);
writeFileSync(`${distribution}/emitter-umd.js.map`, `${JSON.stringify(map)}\n`);

console.log('Built dist/emitter.js, dist/emitter-umd.js and dist/emitter-umd.js.map');
