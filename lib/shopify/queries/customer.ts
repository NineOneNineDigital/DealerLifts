import { customerFetch } from "@/lib/shopify/customer-account-client";
import type {
  Customer,
  CustomerAddress,
  CustomerOrder,
  CustomerOrderConnection,
} from "@/lib/shopify/types";

// ---------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------

const MONEY_FRAGMENT = /* GraphQL */ `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

const ADDRESS_FRAGMENT = /* GraphQL */ `
  fragment AddressFields on CustomerAddress {
    id
    firstName
    lastName
    company
    address1
    address2
    city
    province
    zip
    country
    phone
  }
`;

const ORDER_FRAGMENT = /* GraphQL */ `
  ${MONEY_FRAGMENT}
  fragment OrderFields on Order {
    id
    name
    processedAt
    financialStatus
    fulfillmentStatus
    totalPrice {
      ...MoneyFields
    }
  }
`;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const GET_CUSTOMER_QUERY = /* GraphQL */ `
  ${ADDRESS_FRAGMENT}
  ${ORDER_FRAGMENT}
  query GetCustomer($ordersFirst: Int!) {
    customer {
      id
      displayName
      firstName
      lastName
      email
      phone
      defaultAddress {
        ...AddressFields
      }
      orders(first: $ordersFirst) {
        nodes {
          ...OrderFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const GET_CUSTOMER_ORDERS_QUERY = /* GraphQL */ `
  ${ORDER_FRAGMENT}
  query GetCustomerOrders($first: Int!, $after: String) {
    customer {
      orders(first: $first, after: $after) {
        nodes {
          ...OrderFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

/**
 * Fetch the authenticated customer's profile including recent orders.
 */
export async function getCustomer(
  opts: { ordersFirst?: number } = {}
): Promise<Customer> {
  const data = await customerFetch<{ customer: Customer }>(GET_CUSTOMER_QUERY, {
    ordersFirst: opts.ordersFirst ?? 5,
  });
  return data.customer;
}

/**
 * Fetch a page of orders for the authenticated customer.
 */
export async function getCustomerOrders(args: {
  after?: string;
  first: number;
}): Promise<CustomerOrderConnection> {
  const data = await customerFetch<{
    customer: { orders: CustomerOrderConnection };
  }>(GET_CUSTOMER_ORDERS_QUERY, {
    after: args.after ?? null,
    first: args.first,
  });
  return data.customer.orders;
}

/**
 * Fetch a page of saved addresses for the authenticated customer.
 */
export async function getCustomerAddresses(
  first = 25
): Promise<CustomerAddress[]> {
  const QUERY = /* GraphQL */ `
    ${ADDRESS_FRAGMENT}
    query GetCustomerAddresses($first: Int!) {
      customer {
        addresses(first: $first) {
          nodes {
            ...AddressFields
          }
        }
      }
    }
  `;

  const data = await customerFetch<{
    customer: { addresses: { nodes: CustomerAddress[] } };
  }>(QUERY, { first });
  return data.customer.addresses.nodes;
}

/**
 * Fetch a single order by ID for the authenticated customer.
 * Returns null if the order is not found or does not belong to the customer.
 */
export async function getCustomerOrder(
  orderId: string
): Promise<CustomerOrder | null> {
  // The Customer Account API scopes orders to the authenticated customer,
  // so any order returned here is guaranteed to belong to them.
  const QUERY = /* GraphQL */ `
    ${MONEY_FRAGMENT}
    query GetCustomerOrder($orderId: ID!) {
      order(id: $orderId) {
        id
        name
        processedAt
        financialStatus
        fulfillmentStatus
        totalPrice {
          ...MoneyFields
        }
      }
    }
  `;

  const data = await customerFetch<{ order: CustomerOrder | null }>(QUERY, {
    orderId,
  });
  return data.order;
}
