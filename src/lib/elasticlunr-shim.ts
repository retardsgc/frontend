// Ensure global `lunr` exists before importing elasticlunr (which expects a global lunr)
import * as lunrModule from 'lunr';
// @ts-ignore - attach to global for elasticlunr runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).lunr = lunrModule;

import elasticlunr from 'elasticlunr';
export default elasticlunr;
export * from 'elasticlunr';
