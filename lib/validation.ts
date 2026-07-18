// Lightweight input validation helpers (no external dependency)

export class ValidationError extends Error {
  status: number;
  details: string[];

  constructor(details: string[]) {
    super("Validation failed");
    this.name = "ValidationError";
    this.status = 400;
    this.details = details;
  }
}

export function assertString(
  value: unknown,
  field: string,
  { min = 1, max = 10_000 }: { min?: number; max?: number } = {},
): string {
  if (typeof value !== "string") {
    throw new ValidationError([`${field} must be a string`]);
  }
  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw new ValidationError([
      `${field} must be at least ${min} character(s)`,
    ]);
  }
  if (trimmed.length > max) {
    throw new ValidationError([`${field} must be at most ${max} characters`]);
  }
  return trimmed;
}

export function assertOptionalString(
  value: unknown,
  field: string,
  { max = 10_000 }: { max?: number } = {},
): string | undefined {
  if (value === undefined || value === null) return undefined;
  return assertString(value, field, { min: 0, max });
}

export function assertDateString(value: unknown, field: string): string {
  const str = assertString(value, field);
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError([
      `${field} must be a valid ISO 8601 date string`,
    ]);
  }
  return str;
}

export function assertUUID(value: unknown, field: string): string {
  const str = assertString(value, field);
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(str)) {
    throw new ValidationError([`${field} must be a valid UUID`]);
  }
  return str;
}
