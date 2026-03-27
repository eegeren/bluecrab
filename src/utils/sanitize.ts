const stripUnsafeCharacters = (value: string) =>
  value.replace(/\u0000/g, "").replace(/\r/g, "").trim();

export const sanitizeValue = <T>(value: T): T => {
  if (typeof value === "string") {
    return stripUnsafeCharacters(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sanitizeValue(item)]),
    ) as T;
  }

  return value;
};
