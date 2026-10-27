import { inputExample } from './input_example.ts';
import type { JsonSchema } from './surface_types.ts';

function validateValue(schema: JsonSchema, input: unknown, path = '$'): string[] {
	const errors: string[] = [];
	const matchesType = (type: string) => {
		switch (type) {
			case 'object':
				return typeof input === 'object' && input !== null && !Array.isArray(input);
			case 'array':
				return Array.isArray(input);
			case 'integer':
				return typeof input === 'number' && Number.isInteger(input);
			case 'number':
				return typeof input === 'number' && Number.isFinite(input);
			case 'null':
				return input === null;
			default:
				return typeof input === type;
		}
	};
	if (
		schema.type &&
		!(Array.isArray(schema.type) ? schema.type : [schema.type]).some(matchesType)
	) {
		return [`${path}: expected ${String(schema.type)}`];
	}
	if (schema.enum && !schema.enum.some((value) => JSON.stringify(value) === JSON.stringify(input)))
		errors.push(`${path}: expected one of ${JSON.stringify(schema.enum)}`);
	if (
		schema.oneOf &&
		!schema.oneOf.some((branch) => validateValue(branch, input, path).length === 0)
	)
		errors.push(`${path}: must match at least one schema branch`);
	if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
		const record = input as Record<string, unknown>;
		for (const name of schema.required ?? [])
			if (!Object.hasOwn(record, name)) errors.push(`${path}.${name}: required`);
		for (const [name, property] of Object.entries(schema.properties ?? {}))
			if (Object.hasOwn(record, name))
				errors.push(...validateValue(property, record[name], `${path}.${name}`));
	}
	if (Array.isArray(input) && schema.items)
		input.forEach((value, index) => {
			errors.push(...validateValue(schema.items as JsonSchema, value, `${path}[${index}]`));
		});
	return errors;
}

export function validateInput(schema: JsonSchema, input: unknown, path = '$'): string[] {
	const action =
		typeof input === 'object' && input !== null
			? (input as Record<string, unknown>).subcommand
			: undefined;
	return validateValue(schema, input, path).map(
		(error) =>
			`${error}; pass ${JSON.stringify(inputExample(schema, typeof action === 'string' ? action : undefined))}`,
	);
}
