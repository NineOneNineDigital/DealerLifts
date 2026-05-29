import { NextResponse } from "next/server";
import { listProducts, productByHandle } from "@/lib/shopify/queries/products";
import { getCart } from "@/lib/store/cart";
import {
  getProductBySlug,
  getStorefrontSource,
  listBrands,
  listFeaturedProducts,
  listNewProducts,
  listTopLevelCategories,
} from "@/lib/store/source";

// Dev-only smoke endpoint. Refuses to respond in production.
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const handle = url.searchParams.get("handle");
  const adapterMode = url.searchParams.get("adapter") === "1";
  const cartMode = url.searchParams.get("cart") === "1";

  try {
    if (cartMode) {
      const cart = await getCart();
      return NextResponse.json(
        {
          source: cart.source,
          itemCount: cart.itemCount,
          subtotalCents: cart.subtotalCents,
          checkoutUrl: cart.checkoutUrl,
          items: cart.items.map((line) => ({
            id: line.id,
            productSlug: line.productSlug,
            productTitle: line.productTitle,
            quantity: line.quantity,
            priceCents: line.priceCents,
          })),
          hint: "Cart is GET-only via this smoke endpoint. To add/update/remove, use the cart UI (next plan) or call the adapter directly.",
        },
        { status: 200 }
      );
    }

    if (adapterMode) {
      const adapterHandle = handle ?? undefined;
      const [featured, newArrivals, brands, categories, oneProduct] =
        await Promise.all([
          listFeaturedProducts(3),
          listNewProducts(3),
          listBrands(),
          listTopLevelCategories(),
          adapterHandle
            ? getProductBySlug(adapterHandle)
            : Promise.resolve(null),
        ]);
      return NextResponse.json(
        {
          source: getStorefrontSource(),
          featured: featured.map((p) => ({
            slug: p.slug,
            title: p.title,
            source: p.source,
          })),
          newArrivals: newArrivals.map((p) => ({
            slug: p.slug,
            title: p.title,
            source: p.source,
          })),
          brandCount: brands.length,
          categoryCount: categories.length,
          oneProduct: oneProduct
            ? {
                slug: oneProduct.slug,
                title: oneProduct.title,
                brandName: oneProduct.brandName,
                mapPrice: oneProduct.mapPrice,
                source: oneProduct.source,
              }
            : null,
          hint: "Set STOREFRONT_SOURCE=shopify in .env.local and restart dev to see the Shopify side.",
        },
        { status: 200 }
      );
    }

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
    }));

    return NextResponse.json(
      {
        productCount: page.nodes.length,
        hasMore: page.pageInfo.hasNextPage,
        summary,
        hint: "Try ?adapter=1 to exercise the storefront-source adapter, or ?handle=<handle> to inspect one product's metafields.",
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
