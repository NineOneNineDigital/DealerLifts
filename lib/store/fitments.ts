/**
 * EasySearch (NexusMedia) writes vehicle fitments as Shopify product tags
 * `YEAR-MAKE-MODEL-SUBMODEL-esi{ID}`. Universal parts use `UniversalFitment:Y`
 * instead. This module is a pure parser for those tag formats.
 *
 * Format observed (from `docs/superpowers/runbooks/2026-05-28-shopify-turn14-setup.md`
 * Phase 0 findings):
 *   1980-toyota-land-cruiser-base-esi8372037
 *   2024-toyota-tacoma-trd-pro-esi1234567
 *   2002-cadillac-escalade-base-esi8988213
 *
 * Year is always 4 digits. The submodel is sometimes `base` for the default
 * trim. The `-esi{ID}` suffix is EasySearch's unique row identifier and is
 * discarded. Make and model are lowercased and hyphen-separated; the model
 * itself can contain hyphens (e.g. `k2500-suburban`), so the parser counts
 * field boundaries from the END: the last segment is the esi-id, the segment
 * before that is the submodel, then the year is the first segment. Everything
 * between year+1 and submodel-1 is split into make (first slug) and model
 * (the rest).
 */

export interface ParsedFitment {
  esiId: string;
  make: string;
  model: string;
  submodel: string;
  year: number;
}

const FITMENT_TAG_RE = /^(\d{4})-([a-z0-9-]+)-(esi\d+)$/i;
const UNIVERSAL_TAG = "UniversalFitment:Y";

export function parseFitmentTag(tag: string): ParsedFitment | null {
  const match = FITMENT_TAG_RE.exec(tag);
  if (!match) {
    return null;
  }
  const [, yearStr, body, esiId] = match;
  const year = Number.parseInt(yearStr, 10);
  if (!Number.isFinite(year)) {
    return null;
  }
  const segments = body.split("-");
  if (segments.length < 3) {
    return null;
  }
  // biome-ignore lint/style/useAtIndex: guard above ensures segments is non-empty
  const submodel = segments[segments.length - 1];
  const make = segments[0];
  const model = segments.slice(1, -1).join("-");
  return { esiId, make, model, submodel, year };
}

export function isUniversal(tags: string[]): boolean {
  return tags.includes(UNIVERSAL_TAG);
}

export function parseFitmentsFromTags(tags: string[]): ParsedFitment[] {
  const out: ParsedFitment[] = [];
  for (const tag of tags) {
    const parsed = parseFitmentTag(tag);
    if (parsed) {
      out.push(parsed);
    }
  }
  return out;
}

export function vehicleTagPrefix(
  year: number,
  make: string,
  model: string
): string {
  const m = make.toLowerCase().replace(/\s+/g, "-");
  const mod = model.toLowerCase().replace(/\s+/g, "-");
  return `${year}-${m}-${mod}-`;
}
