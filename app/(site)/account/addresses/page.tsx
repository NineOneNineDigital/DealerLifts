import { redirect } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconMapPin } from "@tabler/icons-react";
import { getCustomerAddresses } from "@/lib/shopify/queries/customer";
import { CustomerNotAuthenticatedError } from "@/lib/shopify/customer-account-client";

export const metadata = {
  title: "Addresses | DealerLifts",
  description: "Manage your saved shipping addresses",
};

export default async function AddressesPage() {
  let addresses;
  try {
    addresses = await getCustomerAddresses(25);
  } catch (err) {
    if (err instanceof CustomerNotAuthenticatedError) {
      redirect("/account/sign-in");
    }
    throw err;
  }

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Back */}
        <Link
          href="/account"
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <IconArrowLeft size={14} />
          My Account
        </Link>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">
              Addresses
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {addresses.length === 0
                ? "No saved addresses"
                : `${addresses.length} saved address${addresses.length === 1 ? "" : "es"}`}
            </p>
          </div>
        </div>

        {addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
            <IconMapPin size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-gray-700">No saved addresses</p>
            <p className="mt-1 text-sm text-gray-500">
              Addresses are added when you complete a checkout.
            </p>
            <Link
              href="/store"
              className="mt-6 inline-block rounded-lg bg-[#077BFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0066dd]"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#077BFF]/10 text-[#077BFF]">
                    <IconMapPin size={16} />
                  </span>
                  <address className="not-italic text-sm text-gray-700 leading-relaxed">
                    {(addr.firstName || addr.lastName) && (
                      <span className="font-semibold">
                        {[addr.firstName, addr.lastName]
                          .filter(Boolean)
                          .join(" ")}
                        <br />
                      </span>
                    )}
                    {addr.company && <>{addr.company}<br /></>}
                    {addr.address1 && <>{addr.address1}<br /></>}
                    {addr.address2 && <>{addr.address2}<br /></>}
                    {[addr.city, addr.province, addr.zip]
                      .filter(Boolean)
                      .join(", ")}
                    {addr.country && (
                      <>
                        <br />
                        {addr.country}
                      </>
                    )}
                    {addr.phone && (
                      <>
                        <br />
                        <span className="text-gray-500">{addr.phone}</span>
                      </>
                    )}
                  </address>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          To edit or remove addresses, visit your{" "}
          <a
            href="https://shopify.com/account"
            className="underline hover:text-gray-600"
            target="_blank"
            rel="noreferrer"
          >
            Shopify account
          </a>
          .
        </p>
      </div>
    </div>
  );
}
