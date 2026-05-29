import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="mb-4 font-bold font-heading text-2xl text-gray-900">
          Order lookup coming soon
        </h1>
        <p className="mb-6 text-gray-600">
          We're moving order history to Shopify. Use the link in your order
          confirmation email to track recent orders.
        </p>
        <Link
          className="text-[#077BFF] hover:underline"
          href="/store"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
