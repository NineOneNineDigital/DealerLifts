export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ShopifyVariant = {
  id: string;
  sku: string | null;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
};

export type ShopifyMetafield = {
  namespace: string;
  key: string;
  type: string;
  value: string;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  description: string;
  productType: string;
  tags: string[];
  createdAt: string;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: { minVariantPrice: Money };
  variants: { nodes: ShopifyVariant[] };
  // `metafields` returns null for identifiers that don't exist on the product,
  // so the array is sparse and entries can be null.
  metafields: (ShopifyMetafield | null)[];
};

export type ProductConnection = {
  nodes: ShopifyProduct[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};
