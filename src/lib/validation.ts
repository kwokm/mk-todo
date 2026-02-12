const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function isValidDateKey(date: string): boolean {
  return DATE_PATTERN.test(date);
}

export function isValidId(id: string): boolean {
  return typeof id === "string" && id.length > 0 && id.length <= 50 && ID_PATTERN.test(id);
}

export function isValidSourceKey(source: string): boolean {
  if (source.startsWith("day:")) {
    return isValidDateKey(source.slice(4));
  }
  if (source.startsWith("list:")) {
    const parts = source.slice(5).split(":");
    return parts.length === 2 && parts.every(isValidId);
  }
  return false;
}

export function isValidText(text: unknown): text is string {
  return typeof text === "string" && text.trim().length > 0 && text.length <= 500;
}

export function isValidName(name: unknown): name is string {
  return typeof name === "string" && name.trim().length > 0 && name.length <= 100;
}
