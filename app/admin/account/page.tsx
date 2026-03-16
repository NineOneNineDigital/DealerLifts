"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconLogout,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";

export default function AdminAccountPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Initialize form fields when user loads
  const [initialized, setInitialized] = useState(false);
  if (isLoaded && user && !initialized) {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setInitialized(true);
  }

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Not signed in
      </div>
    );
  }

  const email = user.emailAddresses?.[0]?.emailAddress || "—";
  const phone = user.phoneNumbers?.[0]?.phoneNumber || null;
  const initials = (
    (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
  ).toUpperCase() || email[0]?.toUpperCase() || "A";
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="font-heading text-2xl font-bold text-gray-900">
        My Account
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your profile and account settings.
      </p>

      {/* Profile header */}
      <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-gray-500">{email}</p>
          <p className="text-xs text-gray-400">Member since {memberSince}</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-gray-900">
          <IconUser size={16} />
          Profile Information
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
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
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <IconLoader2 size={14} className="animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <IconCheck size={14} />
              Saved!
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Account details (read-only) */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-gray-900">
          <IconMail size={16} />
          Account Details
        </h2>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{email}</p>
            </div>
            <IconMail size={16} className="text-gray-400" />
          </div>

          {phone && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <div>
                <p className="text-xs font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{phone}</p>
              </div>
              <IconPhone size={16} className="text-gray-400" />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Role</p>
              <p className="text-sm text-gray-900">
                {(user.publicMetadata?.role as string) || "User"}
              </p>
            </div>
            <IconLock size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-6 rounded-xl border border-red-200 bg-white p-5">
        <h2 className="font-heading text-sm font-bold text-red-600">
          Session
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Sign out of your admin account on this device.
        </p>
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/" })}
          className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <IconLogout size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
