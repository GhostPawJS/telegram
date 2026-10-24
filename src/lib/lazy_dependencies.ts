import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// Only built-ins are loaded, so resolution does not depend on the package location.
const requireDependency = createRequire(resolve('index.js'));
export function loadHttp(): typeof import('node:http') {
	return requireDependency('node:http');
}
