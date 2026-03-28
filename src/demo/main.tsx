import { render } from 'preact';
import { useState } from 'preact/hooks';

import type { OperationRecord, Operator } from '../calculations/types.ts';
import { OPERATORS } from '../calculations/types.ts';

// --- In-memory state for the demo ---
// In a real browser build, replace this with a sql.js-backed CalcDb instance
// (see how the other GhostPaw repos wire browser_*_db.ts + load_sqljs.ts).
// For this template demo, we show the domain logic without SQLite in the browser.

interface DemoState {
	history: OperationRecord[];
	nextId: number;
}

const state: DemoState = { history: [], nextId: 1 };

function compute(a: number, op: Operator, b: number): OperationRecord | { error: string } {
	if (!Number.isFinite(a) || !Number.isFinite(b))
		return { error: 'Operands must be finite numbers.' };
	if (op === '/' && b === 0) return { error: 'Cannot divide by zero.' };
	let result: number;
	switch (op) {
		case '+':
			result = a + b;
			break;
		case '-':
			result = a - b;
			break;
		case '*':
			result = a * b;
			break;
		case '/':
			result = a / b;
			break;
	}
	const record: OperationRecord = {
		id: state.nextId++,
		a,
		b,
		operator: op,
		result,
		createdAt: Date.now(),
	};
	state.history.unshift(record);
	return record;
}

function formatOp(op: OperationRecord): string {
	return `${op.a} ${op.operator} ${op.b} = ${op.result}`;
}

function App() {
	const [a, setA] = useState('');
	const [b, setB] = useState('');
	const [op, setOp] = useState<Operator>('+');
	const [history, setHistory] = useState<OperationRecord[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [last, setLast] = useState<OperationRecord | null>(null);

	function handleSubmit(e: Event) {
		e.preventDefault();
		setError(null);
		const numA = parseFloat(a);
		const numB = parseFloat(b);
		const result = compute(numA, op, numB);
		if ('error' in result) {
			setError(result.error);
		} else {
			setLast(result);
			setHistory([...state.history]);
			setA(String(result.result));
		}
	}

	function handleClear() {
		state.history = [];
		state.nextId = 1;
		setHistory([]);
		setLast(null);
		setA('');
		setB('');
		setError(null);
	}

	return (
		<div class="main-content">
			<div class="page">
				<h1 class="page-title">@ghostpaw/template</h1>

				<div class="panel">
					<div class="panel-header">
						<h2>Calculator</h2>
						<span class="muted" style="font-size:0.82rem">
							Replace this with your domain's demo
						</span>
					</div>
					<div class="panel-body">
						<form onSubmit={handleSubmit}>
							<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
								<div class="form-field" style="flex:1;min-width:80px">
									<label class="form-label" for="a-input">
										a
									</label>
									<input
										id="a-input"
										class="inline-input"
										type="number"
										value={a}
										onInput={(e) => setA((e.target as HTMLInputElement).value)}
										placeholder="0"
										required
									/>
								</div>
								<div class="form-field" style="min-width:64px">
									<label class="form-label" for="op-select">
										op
									</label>
									<select
										id="op-select"
										class="inline-input"
										style="min-height:40px"
										value={op}
										onChange={(e) => setOp((e.target as HTMLSelectElement).value as Operator)}
									>
										{OPERATORS.map((o) => (
											<option key={o} value={o}>
												{o}
											</option>
										))}
									</select>
								</div>
								<div class="form-field" style="flex:1;min-width:80px">
									<label class="form-label" for="b-input">
										b
									</label>
									<input
										id="b-input"
										class="inline-input"
										type="number"
										value={b}
										onInput={(e) => setB((e.target as HTMLInputElement).value)}
										placeholder="0"
										required
									/>
								</div>
								<button type="submit" class="btn btn-primary" style="min-width:80px">
									=
								</button>
							</div>
						</form>

						{error && <p style="color:var(--danger);font-size:0.88rem">{error}</p>}

						{last && (
							<p style="font-family:var(--font-mono);font-size:1.1rem">
								<strong>{formatOp(last)}</strong>
							</p>
						)}
					</div>
				</div>

				<div class="panel">
					<div class="panel-header">
						<h2>
							History {history.length > 0 && <span class="title-badge">{history.length}</span>}
						</h2>
						{history.length > 0 && (
							<button type="button" class="btn btn-muted btn-sm" onClick={handleClear}>
								Clear
							</button>
						)}
					</div>
					{history.length === 0 ? (
						<div class="empty-state">
							<div class="empty-glyph">∅</div>
							<p class="empty-title">No calculations yet</p>
							<p class="empty-subtitle">Results will appear here as you compute.</p>
						</div>
					) : (
						<div class="panel-body">
							{history.map((op) => (
								<div
									key={op.id}
									style="font-family:var(--font-mono);font-size:0.88rem;padding:8px 0;border-bottom:1px solid var(--border)"
								>
									{formatOp(op)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

render(<App />, document.getElementById('app') as HTMLElement);
