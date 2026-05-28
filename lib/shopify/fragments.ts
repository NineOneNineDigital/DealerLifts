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
