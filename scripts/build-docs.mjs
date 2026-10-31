/**
 * Regenerates `docs/API.md` from the JSDoc annotations in `src/emitter.js`.
 *
 * Run with `npm run build:docs`.
 */
import jsdocToMarkdown from 'jsdoc-to-markdown';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../src/emitter.js', import.meta.url));
const target = fileURLToPath(new URL('../docs/API.md', import.meta.url));

const markdown = await jsdocToMarkdown.render({ files: source });

writeFileSync(target, markdown);

console.log('Built docs/API.md');
