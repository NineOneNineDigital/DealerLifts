export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    vendor
    description
    productType
    tags
    createdAt
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 10) {
      nodes {
        id
        sku
        title
        availableForSale
        quantityAvailable
        price {
          amount
          currencyCode
        }
      }
    }
    metafields(
      identifiers: [
        { namespace: "custom", key: "fitments" }
        { namespace: "custom", key: "fitment" }
        { namespace: "turn14", key: "fitments" }
        { namespace: "turn14", key: "vehicles" }
        { namespace: "specifications", key: "fitments" }
      ]
    ) {
      namespace
      key
      type
      value
    }
  }
`;

export const COLLECTION_FRAGMENT = /* GraphQL */ `
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    image {
      altText
      height
      url
      width
    }
    metafields(
      identifiers: [
        { namespace: "custom", key: "brand_logo" }
        { namespace: "custom", key: "is_top_level" }
        { namespace: "custom", key: "sort_order" }
      ]
    ) {
      key
      namespace
      type
      value
    }
  }
`;
