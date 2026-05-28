import { NextResponse } from "next/server";
import { listProducts, productByHandle } from "@/lib/shopify/queries/products";

// Dev-only smoke endpoint. Refuses to respond in production.
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const handle = url.searchParams.get("handle");

  try {
    if (handle) {
      const product = await productByHandle(handle, { cache: "no-store" });
      return NextResponse.json({ product }, { status: 200 });
    }

    const page = await listProducts({ first: 3 }, { cache: "no-store" });
    const summary = page.nodes.map((p) => ({
      handle: p.handle,
      title: p.title,
      vendor: p.vendor,
      productType: p.productType,
      tags: p.tags,
      variantCount: p.variants.nodes.length,
      firstVariantSku: p.variants.nodes[0]?.sku ?? null,
      // The interesting bit: which metafield identifiers came back populated.
      metafieldsFound: p.metafields
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .map((m) => ({
          namespace: m.namespace,
          key: m.key,
          type: m.type,
          valuePreview:
            m.value.length > 200 ? `${m.value.slice(0, 200)}…` : m.value,
        })),
    }));

    return NextResponse.json(
      {
        productCount: page.nodes.length,
        hasMore: page.pageInfo.hasNextPage,
        summary,
        hint: "To inspect one product's full metafields, hit /api/dev/shopify-smoke?handle=<handle>",
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
