"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { IconShieldLock, IconLoader2 } from "@tabler/icons-react";

export default function AdminSignInPage() {
  const clerk = useClerk();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerk.loaded) {
      setError(
        "Authentication is still loading. Please wait a moment and try again.",
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await clerk.client.signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await clerk.setActive({ session: result.createdSessionId });
        router.push("/admin/chat");
      } else if (result.status === "needs_first_factor") {
        // Password strategy may need explicit first factor attempt
        const firstFactor = result.supportedFirstFactors?.find(
          (f: { strategy: string }) => f.strategy === "password",
        );
        if (firstFactor) {
          const attemptResult = await result.attemptFirstFactor({
            strategy: "password",
            password,
          });
          if (attemptResult.status === "complete") {
            await clerk.setActive({ session: attemptResult.createdSessionId });
            router.push("/admin/chat");
          } else {
            setError(`Unexpected status: ${attemptResult.status}`);
          }
        } else {
          setError(`No password factor available. Supported: ${result.supportedFirstFactors?.map((f: { strategy: string }) => f.strategy).join(", ")}`);
        }
      } else if (result.status === "needs_second_factor") {
        setError("MFA is required but not supported on this sign-in page. Please remove MFA from your account in the Clerk dashboard.");
      } else {
        setError(`Unexpected sign-in status: ${result.status}`);
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(
        clerkError.errors?.[0]?.message ?? "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm px-4">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
            <IconShieldLock size={28} />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-gray-900">
            Dealer Lifts Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to manage your store
          </p>
        </div>

        {/* Sign in form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="you@dealerlifts.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Internal staff access only
        </p>
      </div>
    </div>
  );
}
