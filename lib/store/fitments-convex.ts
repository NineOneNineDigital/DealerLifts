import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { getConvexServerClient } from "@/lib/store/convex-server";
import type { NormalizedProduct } from "@/lib/store/types";

interface ConvexFitmentDoc {
  make: string;
  model: string;
  year: number;
}

function mapProduct(doc: Doc<"products">): NormalizedProduct {
  return {
    brandId: doc.brandId ?? null,
    brandName: null,
    categoryId: doc.categoryId ?? null,
    description: doc.description ?? null,
    id: doc._id,
    images: doc.images ?? [],
    isActive: doc.isActive,
    isFeatured: doc.isFeatured ?? false,
    mapPrice: doc.mapPrice ?? null,
    partNumber: doc.partNumber,
    retailPrice: doc.retailPrice ?? null,
    slug: doc.slug,
    source: "convex",
    thumbnail: doc.thumbnail ?? null,
    title: doc.title,
  };
}

export async function listMakes(): Promise<string[]> {
  const client = getConvexServerClient();
  return await client.query(api.fitments.getMakes, {});
}

export async function listModels(make: string): Promise<string[]> {
  const client = getConvexServerClient();
  return await client.query(api.fitments.getModels, { make });
}

export async function listYears(
  make: string,
  model: string
): Promise<number[]> {
  const client = getConvexServerClient();
  return await client.query(api.fitments.getYears, { make, model });
}

export async function getFitmentsForProduct(
  productId: string
): Promise<ConvexFitmentDoc[]> {
  const client = getConvexServerClient();
  const grouped = await client.query(api.fitments.getForProduct, {
    productId: productId as Id<"products">,
  });
  // grouped is { [make]: { [model]: number[] } }. Flatten to a list.
  const out: ConvexFitmentDoc[] = [];
  for (const [make, models] of Object.entries(grouped)) {
    for (const [model, years] of Object.entries(models)) {
      for (const year of years) {
        out.push({ make, model, year });
      }
    }
  }
  return out;
}

export async function listProductsByVehicle(args: {
  year: number;
  make: string;
  model: string;
  limit?: number;
}): Promise<NormalizedProduct[]> {
  const client = getConvexServerClient();
  const docs = await client.query(api.fitments.getProductsByFitment, {
    make: args.make,
    model: args.model,
    year: args.year,
  });
  // docs is (Doc<"products"> | null | undefined)[]. Filter to non-null,
  // then trim to limit.
  const products = docs.filter((d): d is Doc<"products"> => d != null);
  const limited = args.limit ? products.slice(0, args.limit) : products;
  return limited.map(mapProduct);
}
