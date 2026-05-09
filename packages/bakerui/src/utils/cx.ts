export type ClassValue = string | number | false | null | undefined;

export function cx(...values: ClassValue[]): string {
  let out = "";
  for (const v of values) {
    if (!v && v !== 0) continue;
    out += (out ? " " : "") + v;
  }
  return out;
}
