import Link from "next/link";
import { IconBrandShopee } from "@tabler/icons-react";

export const metadata = {
  title: "Sign In | DealerLifts",
  description: "Sign in to your DealerLifts account",
};

export default function SignInPage() {
  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#077BFF]/10">
              <IconBrandShopee size={28} className="text-[#077BFF]" />
            </span>
            <h1 className="font-heading text-2xl font-bold text-gray-900">
              Sign in to DealerLifts
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Access your orders and account settings
            </p>
          </div>

          {/* OAuth button */}
          <a
            href="/api/auth/shopify/login"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#077BFF] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0066dd] focus:outline-none focus:ring-2 focus:ring-[#077BFF] focus:ring-offset-2"
          >
            Continue with Shopify
          </a>

          <p className="mt-6 text-center text-xs text-gray-400">
            By signing in you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-600">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-gray-600">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a
            href="/api/auth/shopify/login"
            className="font-medium text-[#077BFF] hover:underline"
          >
            Create one
          </a>{" "}
          through Shopify.
        </p>
      </div>
    </div>
  );
}
