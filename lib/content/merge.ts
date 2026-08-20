/**
 * Field-level fallback helpers for merging a Hygraph response over a typed
 * DEFAULTS object.
 *
 * Hygraph returns `null` for a field that was never set and `""` for one an
 * editor cleared, so `??` is not sufficient — it would happily render a blank
 * headline. These helpers treat "absent" as null, undefined, or blank.
 */

/** CMS string, or the fallback when null, undefined, or whitespace-only. */
export function str(
  value: string | null | undefined,
  fallback: string
): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/** CMS number, or the fallback when null or undefined. Zero is preserved. */
export function num(
  value: number | null | undefined,
  fallback: number
): number {
  return value ?? fallback;
}

/**
 * CMS list, or the entire fallback list when null/undefined/empty.
 *
 * All-or-nothing by design: a partly-filled list means the owner is mid-edit,
 * and interleaving CMS items with defaults would produce nonsense output.
 */
export function list<T>(
  value: readonly T[] | null | undefined,
  fallback: T[]
): T[] {
  return value && value.length > 0 ? [...value] : fallback;
}
