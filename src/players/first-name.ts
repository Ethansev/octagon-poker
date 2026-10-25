export function firstName(name: string): string {
  const trimmed = name.trim();
  return trimmed.split(/\s+/)[0] || name;
}
