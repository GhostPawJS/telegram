import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// __filename is supplied by CommonJS; import.meta.url is supplied by ESM.
const requireDependency = createRequire(
	typeof __filename === 'string' ? __filename : (import.meta.url ?? resolve('index.js')),
);
export function loadGrammy(): typeof import('grammy') {
	return requireDependency('grammy');
}
export function loadMarked(): typeof import('marked') {
	return requireDependency('marked');
}

export function loadHttp(): typeof import('node:http') {
	return requireDependency('node:http');
}
