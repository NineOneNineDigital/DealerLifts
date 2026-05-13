"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconUserPlus,
  IconLoader2,
  IconArrowLeft,
} from "@tabler/icons-react";

type Stage = "form" | "verify";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageInner />
    </Suspense>
  );
}

function SignUpPageInner() {
  const clerk = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") ?? "/";

  const [stage, setStage] = useState<Stage>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClerkError = (err: unknown, fallback: string) => {
    const clerkError = err as { errors?: { message: string }[] };
    setError(clerkError.errors?.[0]?.message ?? fallback);
  };

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
      await clerk.client.signUp.create({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      await clerk.client.signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setStage("verify");
    } catch (err) {
      handleClerkError(err, "Sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await clerk.client.signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await clerk.setActive({ session: result.createdSessionId });
        router.push(redirectUrl);
      } else {
        setError(`Unexpected status: ${result.status}`);
      }
    } catch (err) {
      handleClerkError(err, "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const signInHref = redirectUrl
    ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/sign-in";

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
            <IconUserPlus size={28} />
          </Link>
          <h1 className="mt-4 font-heading text-2xl font-bold text-gray-900">
            {stage === "form" ? "Create your account" : "Verify your email"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {stage === "form"
              ? "Track orders and save your vehicle setup"
              : `We sent a code to ${email}`}
          </p>
        </div>

        {stage === "form" ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="At least 8 characters"
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
                    Creating account...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleVerify}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Verification code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  required
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm tracking-widest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="6-digit code"
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
                    Verifying...
                  </>
                ) : (
                  "Verify & Sign In"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStage("form");
                  setCode("");
                  setError("");
                }}
                className="block w-full text-center text-xs text-gray-500 hover:text-gray-700"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href={signInHref}
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
