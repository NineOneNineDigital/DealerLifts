/**
 * Select the single entry from a single-entry page query, signalling when a
 * successful query returned nothing.
 *
 * A query that succeeds with an empty array means the entry is unpublished,
 * deleted, or unreadable — the page would silently render code defaults while
 * the build looks healthy. Under HYGRAPH_STRICT this throws so CI catches it;
 * otherwise it warns and lets the page degrade.
 *
 * A null `data` means the fetch itself failed and hygraphFetchSafe already
 * warned, so this stays silent to avoid double-warning.
 */
export function selectEntry<T>(
  data: Record<string, T[] | null> | null,
  key: string
): T | null {
  if (!data) {
    return null;
  }

  const entry = data[key]?.[0] ?? null;
  if (!entry) {
    const msg = `[hygraph] ${key} returned no entry — rendering defaults`;
    if (process.env.HYGRAPH_STRICT === "1") {
      throw new Error(msg);
    }
    console.warn(msg);
  }

  return entry;
}
