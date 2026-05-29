import Link from "next/link";
import { notFound } from "next/navigation";
import { FitmentPanel } from "@/components/store/FitmentPanel";
import { ProductImages } from "@/components/store/ProductImages";
import { ProductInfo } from "@/components/store/ProductInfo";
import { getFitmentsForProduct } from "@/lib/store/fitments-source";
import { getProductBySlug } from "@/lib/store/source";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const fitments = await getFitmentsForProduct(product.slug);

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/store">
            Store
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-gray-900">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <ProductImages images={product.images} title={product.title} />
          <ProductInfo
            brandName={product.brandName}
            inStock={product.isActive}
            product={product}
          />
        </div>

        <FitmentPanel fitments={fitments} />
      </div>
    </div>
  );
}
