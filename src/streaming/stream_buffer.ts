export class StreamBuffer {
	private _text = '';

	append(chunk: string): void {
		this._text += chunk;
	}

	get text(): string {
		return this._text;
	}

	get length(): number {
		return this._text.length;
	}

	clear(): void {
		this._text = '';
	}

	clone(): string {
		return this._text;
	}
}
