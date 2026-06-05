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
    phoneNumber
  }
`;

interface RawAddress {
  address1: string | null;
  address2: string | null;
  city: string | null;
  company: string | null;
  country: string | null;
  firstName: string | null;
  id: string;
  lastName: string | null;
  phoneNumber: string | null;
  province: string | null;
  zip: string | null;
}

function normalizeAddress(a: RawAddress | null): CustomerAddress | null {
  if (!a) {
    return null;
  }
  return {
    address1: a.address1,
    address2: a.address2,
    city: a.city,
    company: a.company,
    country: a.country,
    firstName: a.firstName,
    id: a.id,
    lastName: a.lastName,
    phone: a.phoneNumber,
    province: a.province,
    zip: a.zip,
  };
}

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
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
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
interface RawCustomer {
  defaultAddress: RawAddress | null;
  displayName: string;
  emailAddress: { emailAddress: string | null } | null;
  firstName: string | null;
  id: string;
  lastName: string | null;
  orders: CustomerOrderConnection;
  phoneNumber: { phoneNumber: string | null } | null;
}

export async function getCustomer(
  opts: { ordersFirst?: number } = {}
): Promise<Customer> {
  const data = await customerFetch<{ customer: RawCustomer }>(
    GET_CUSTOMER_QUERY,
    { ordersFirst: opts.ordersFirst ?? 5 }
  );
  const c = data.customer;
  return {
    defaultAddress: normalizeAddress(c.defaultAddress),
    displayName: c.displayName,
    email: c.emailAddress?.emailAddress ?? null,
    firstName: c.firstName,
    id: c.id,
    lastName: c.lastName,
    orders: c.orders,
    phone: c.phoneNumber?.phoneNumber ?? null,
  };
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
    customer: { addresses: { nodes: RawAddress[] } };
  }>(QUERY, { first });
  return data.customer.addresses.nodes
    .map(normalizeAddress)
    .filter((a): a is CustomerAddress => a !== null);
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
