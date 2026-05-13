"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconUserCircle,
  IconLoader2,
  IconArrowLeft,
} from "@tabler/icons-react";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageInner />
    </Suspense>
  );
}

function SignInPageInner() {
  const clerk = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const completeSession = async (sessionId: string | null) => {
        if (!sessionId) {
          setError("Sign-in completed without a session. Please try again.");
          return;
        }
        await clerk.setActive({ session: sessionId });
        router.push(redirectUrl);
      };

      if (result.status === "complete") {
        await completeSession(result.createdSessionId);
      } else if (result.status === "needs_first_factor") {
        const firstFactor = result.supportedFirstFactors?.find(
          (f: { strategy: string }) => f.strategy === "password",
        );
        if (firstFactor) {
          const attemptResult = await result.attemptFirstFactor({
            strategy: "password",
            password,
          });
          if (attemptResult.status === "complete") {
            await completeSession(attemptResult.createdSessionId);
          } else {
            setError(`Unexpected status: ${attemptResult.status}`);
          }
        } else {
          setError(
            `No password factor available. Supported: ${result.supportedFirstFactors?.map((f: { strategy: string }) => f.strategy).join(", ")}`,
          );
        }
      } else if (result.status === "needs_second_factor") {
        setError(
          "MFA is required but not supported on this sign-in page. Please remove MFA from your account in the Clerk dashboard.",
        );
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

  const signUpHref = redirectUrl
    ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/sign-up";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-900 sm:left-6 sm:top-6"
      >
        <IconArrowLeft size={16} />
        Back to home
      </Link>

      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg transition-transform hover:scale-105"
            aria-label="Dealer Lifts home"
          >
            <IconUserCircle size={28} />
          </Link>
          <h1 className="mt-4 font-heading text-2xl font-bold text-gray-900">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back to Dealer Lifts
          </p>
        </div>

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
                placeholder="you@example.com"
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

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            href={signUpHref}
            className="font-semibold text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
