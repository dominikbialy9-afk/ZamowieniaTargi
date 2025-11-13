export type NormalizedValue = string | number | boolean | '';

/**
 * Normalizes Airtable values to primitives that are easy to serialise into JSON/CSV/Excel.
 * - Arrays are flattened to comma-separated strings
 * - Objects prioritise `name` and `id` fields before falling back to JSON
 */
export function normalizeCellValue(value: unknown): NormalizedValue {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (item === null || item === undefined) {
          return '';
        }

        if (typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          if (typeof obj.name === 'string' && obj.name.trim().length > 0) {
            return obj.name;
          }
          if (typeof obj.id === 'string' && obj.id.trim().length > 0) {
            return obj.id;
          }
        }

        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          return item;
        }

        try {
          return JSON.stringify(item);
        } catch {
          return String(item);
        }
      })
      .filter((part) => part !== '')
      .map((part) => String(part));

    return parts.join(', ');
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.name === 'string' && obj.name.trim().length > 0) {
      return obj.name;
    }
    if (typeof obj.id === 'string' && obj.id.trim().length > 0) {
      return obj.id;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return String(value);
}
