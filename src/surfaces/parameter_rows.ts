import type { JsonSchema } from './surface_types.ts';

export function parameterRows(schema: JsonSchema, prefix = ''): string[] {
	const rows: string[] = [];
	for (const [name, property] of Object.entries(schema.properties ?? {})) {
		const type = property.type ?? property.oneOf?.map((branch) => branch.type).join(' / ') ?? 'any';
		const objects = [
			property,
			...(property.oneOf ?? []),
			...(property.items ? [property.items] : []),
		];
		const keys = objects.flatMap((object) =>
			Object.keys(object.properties ?? {}).map(
				(key) => `${key}${object.required?.includes(key) ? ' (required)' : ''}`,
			),
		);
		const description =
			property.description?.trim() ||
			(keys.length
				? `${property.items ? 'Array items' : 'Object'}: ${keys.join(', ')}`
				: property.items
					? `Array of ${property.items.type ?? 'values'}`
					: `${type} value`);
		const values = (property.enum ? `${property.enum.join(', ')}. ` : '') + description;
		rows.push(
			`| ${prefix}${name} | ${type} | ${schema.required?.includes(name) ? 'yes' : 'no'} | ${values.replaceAll('|', '\\|').replaceAll('\n', ' ')} |`,
		);
		for (const object of objects)
			rows.push(
				...parameterRows(object, `${prefix}${name}${object === property.items ? '[]' : ''}.`),
			);
	}
	return rows;
}
