#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import * as esbuild from 'esbuild';

const OUT_DIR = 'demo';
const ENTRY = 'src/demo/main.tsx';
const WATCH = process.argv.includes('--watch');
const EMPTY_MODULE = resolve('src/demo/empty_module.ts');

/** @type {import("esbuild").BuildOptions} */
const buildOptions = {
	entryPoints: [ENTRY],
	outdir: OUT_DIR,
	bundle: true,
	format: 'esm',
	platform: 'browser',
	target: ['es2022'],
	sourcemap: true,
	jsx: 'automatic',
	jsxImportSource: 'preact',
	loader: { '.wasm': 'file' },
	entryNames: 'app',
	assetNames: 'assets/[name]-[hash]',
	alias: {
		fs: EMPTY_MODULE,
		path: EMPTY_MODULE,
	},
};

const CSS = /* css */ `
/* ── Fonts ─────────────────────────────────────────────────────── */
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap");

/* ── Design tokens ─────────────────────────────────────────────── */
:root {
	color-scheme: dark;
	--bg: #0a0d12;
	--panel: rgba(16, 22, 32, 0.88);
	--panel-strong: rgba(20, 28, 41, 0.96);
	--border: rgba(125, 173, 255, 0.18);
	--border-strong: rgba(125, 173, 255, 0.34);
	--text: #edf3ff;
	--muted: #93a4bf;
	--accent: #61dafb;
	--accent-soft: rgba(97, 218, 251, 0.14);
	--success: #72f1b8;
	--warn: #ffc857;
	--danger: #ff7a90;
	--font-display: "Orbitron", sans-serif;
	--font-body: "Manrope", sans-serif;
	--font-mono: "JetBrains Mono", "Fira Code", monospace;
	--sidebar-w: 240px;
}

/* ── Reset ─────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { min-height: 100vh; }
body {
	font-family: var(--font-body);
	font-size: 0.92rem;
	font-weight: 400;
	line-height: 1.6;
	background:
		radial-gradient(circle at top left, rgba(97, 218, 251, 0.08), transparent 34%),
		radial-gradient(circle at bottom right, rgba(255, 200, 87, 0.06), transparent 28%),
		var(--bg);
	color: var(--text);
	-webkit-font-smoothing: antialiased;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
input, textarea, select { font-family: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* ── Typography ────────────────────────────────────────────────── */
.page-title {
	font-family: var(--font-display);
	font-weight: 700;
	font-size: clamp(1.25rem, 4vw, 1.8rem);
	letter-spacing: 0.04em;
	line-height: 1.3;
	margin-bottom: 20px;
}
h2 {
	font-family: var(--font-display);
	font-weight: 500;
	font-size: clamp(0.95rem, 3vw, 1.15rem);
	letter-spacing: 0.03em;
	line-height: 1.35;
}
h3 { font-family: var(--font-body); font-weight: 600; font-size: 0.9rem; line-height: 1.4; }
.muted { color: var(--muted); }

/* ── Layout ────────────────────────────────────────────────────── */
#app { min-height: 100vh; }

.main-content {
	min-height: 100vh;
	padding: 48px 28px 80px;
}
.main-content > .page {
	max-width: 860px;
	margin: 0 auto;
	display: grid;
	gap: 20px;
}

/* ── Panel ─────────────────────────────────────────────────────── */
.panel {
	padding: 24px;
	border: 1px solid var(--border);
	border-radius: 16px;
	background: var(--panel);
	backdrop-filter: blur(16px);
	min-width: 0;
}
.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 12px;
	margin-bottom: 16px;
}
.panel-body { display: grid; gap: 14px; }

/* ── Buttons ───────────────────────────────────────────────────── */
.btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 36px;
	min-width: 64px;
	padding: 6px 14px;
	border-radius: 8px;
	font-size: 0.82rem;
	font-weight: 600;
	border: 1px solid var(--border);
	transition: transform 0.1s ease, background 0.15s ease;
}
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn-sm { min-height: 32px; min-width: 0; padding: 4px 12px; font-size: 0.78rem; }
.btn-primary { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.btn-primary:hover { background: #4ec8e8; }
.btn-danger { border-color: var(--danger); color: var(--danger); }
.btn-danger:hover { background: rgba(255, 122, 144, 0.12); }
.btn-muted { border-color: var(--border); color: var(--muted); }
.btn-muted:hover { background: rgba(147, 164, 191, 0.08); }

/* ── Form inputs ───────────────────────────────────────────────── */
.inline-textarea, .inline-input {
	width: 100%;
	padding: 10px 14px;
	border: 1px solid var(--border);
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.04);
	color: var(--text);
	font-size: 0.95rem;
	line-height: 1.5;
	resize: vertical;
	min-height: 40px;
	transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.inline-textarea:focus, .inline-input:focus {
	border-color: var(--accent);
	box-shadow: 0 0 0 2px var(--accent-soft);
	outline: none;
}

/* ── Form fields ───────────────────────────────────────────────── */
.form-field { display: grid; gap: 6px; }
.form-label {
	font-size: 0.78rem;
	font-weight: 600;
	letter-spacing: 0.03em;
	text-transform: uppercase;
	color: var(--muted);
}

/* ── Empty state ───────────────────────────────────────────────── */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 48px 24px;
	text-align: center;
}
.empty-glyph { font-size: 2.5rem; margin-bottom: 16px; opacity: 0.5; }
.empty-title { font-weight: 600; font-size: 1rem; margin-bottom: 6px; }
.empty-subtitle { color: var(--muted); font-size: 0.88rem; }

/* ── Toast stack ───────────────────────────────────────────────── */
.toast-stack {
	position: fixed;
	right: 16px;
	bottom: 16px;
	z-index: 200;
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-width: calc(100vw - 32px);
	pointer-events: none;
}
.toast {
	padding: 12px 18px;
	border-radius: 10px;
	font-size: 0.85rem;
	font-weight: 500;
	backdrop-filter: blur(12px);
	animation: slideInRight 0.3s ease-out;
	pointer-events: auto;
	max-width: 360px;
	overflow-wrap: break-word;
}
.toast-ok {
	background: rgba(114, 241, 184, 0.18);
	border: 1px solid rgba(114, 241, 184, 0.35);
	color: var(--success);
}
.toast-err {
	background: rgba(255, 122, 144, 0.18);
	border: 1px solid rgba(255, 122, 144, 0.35);
	color: var(--danger);
}
@keyframes slideInRight {
	from { transform: translateX(100%); opacity: 0; }
	to { transform: translateX(0); opacity: 1; }
}

/* ── Responsive ────────────────────────────────────────────────── */
@media (max-width: 600px) {
	.main-content { padding: 32px 16px 80px; }
	.panel { padding: 18px; }
}
`;

const FAVICON = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect x='3' y='3' width='58' height='58' rx='10' fill='%230a0d12' stroke='%2361dafb' stroke-width='3'/><text x='32' y='44' text-anchor='middle' font-size='36' fill='%2361dafb'>G</text></svg>`;

// Replace with your package name / demo title
const PACKAGE_NAME = '@ghostpaw/template';

function writeHtmlShell() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${PACKAGE_NAME} — Demo</title>
<link rel="icon" href="${FAVICON}" />
<style>${CSS}</style>
</head>
<body>
<div id="app"></div>
<script type="module" src="./app.js"></script>
</body>
</html>`;
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	if (WATCH) {
		const ctx = await esbuild.context(buildOptions);
		await ctx.watch();
		console.log('[demo] watching for changes ...');
	} else {
		await esbuild.build(buildOptions);
		console.log('[demo] build complete');
	}

	await writeFile(join(OUT_DIR, 'index.html'), writeHtmlShell());
	console.log('[demo] wrote index.html');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
