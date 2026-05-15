export function sanitizeInput(value: string): string {
  return value.replace(/[<>&"']/g, (char) => {
    switch (char) { case '<': return '&lt;'; case '>': return '&gt;'; case '&': return '&amp;'; case '"': return '&quot;'; case "'": return '&#x27;'; default: return char; }
  });
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = typeof val === 'string' ? sanitizeInput(val) : val;
  }
  return result as T;
}
