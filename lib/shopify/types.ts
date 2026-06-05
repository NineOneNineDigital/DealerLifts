export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  altText: string | null;
  height: number | null;
  url: string;
  width: number | null;
}

export interface ShopifyVariant {
  availableForSale: boolean;
  compareAtPrice: Money | null;
  id: string;
  price: Money;
  quantityAvailable: number | null;
  sku: string | null;
  title: string;
}

export interface ShopifyMetafield {
  key: string;
  namespace: string;
  type: string;
  value: string;
}

export interface ShopifyProduct {
  createdAt: string;
  description: string;
  featuredImage: ShopifyImage | null;
  handle: string;
  id: string;
  images: { nodes: ShopifyImage[] };
  priceRange: { minVariantPrice: Money };
  productType: string;
  tags: string[];
  title: string;
  variants: { nodes: ShopifyVariant[] };
  vendor: string;
}

export interface ProductConnection {
  nodes: ShopifyProduct[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export interface ShopifyCollection {
  description: string;
  handle: string;
  id: string;
  image: ShopifyImage | null;
  metafields: (ShopifyMetafield | null)[];
  title: string;
}

export interface CollectionConnection {
  nodes: ShopifyCollection[];
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface ShopifyCartLineMerchandise {
  availableForSale: boolean;
  id: string;
  product: {
    featuredImage: { altText: string | null; url: string } | null;
    handle: string;
    title: string;
  };
  sku: string | null;
  title: string;
}

export interface ShopifyCartLine {
  cost: { totalAmount: Money };
  id: string;
  merchandise: ShopifyCartLineMerchandise;
  quantity: number;
}

export interface ShopifyCart {
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  id: string;
  lines: { nodes: ShopifyCartLine[] };
  totalQuantity: number;
}

// ---------------------------------------------------------------------------
// Customer Account API types
// ---------------------------------------------------------------------------

export interface CustomerAddress {
  address1: string | null;
  address2: string | null;
  city: string | null;
  company: string | null;
  country: string | null;
  firstName: string | null;
  id: string;
  lastName: string | null;
  phone: string | null;
  province: string | null;
  zip: string | null;
}

export interface CustomerOrder {
  financialStatus: string;
  fulfillmentStatus: string;
  id: string;
  name: string;
  processedAt: string;
  totalPrice: Money;
}

export interface CustomerOrderConnection {
  nodes: CustomerOrder[];
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface Customer {
  defaultAddress: CustomerAddress | null;
  displayName: string;
  email: string | null;
  firstName: string | null;
  id: string;
  lastName: string | null;
  orders: CustomerOrderConnection;
  phone: string | null;
}
