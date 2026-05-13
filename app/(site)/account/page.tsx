"use client";

import type { useUser as UseUserHook } from "@clerk/nextjs";
import { useClerk, useReverification, useUser } from "@clerk/nextjs";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";
import { useEffect, useState } from "react";

type ClerkUser = NonNullable<ReturnType<typeof UseUserHook>["user"]>;
type EmailAddress = ClerkUser["emailAddresses"][number];

import {
  IconCheck,
  IconLoader2,
  IconLock,
  IconLogout,
  IconMail,
  IconPlus,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconUser,
  IconX,
} from "@tabler/icons-react";

interface ClerkError {
  errors?: { message: string }[];
}

function getClerkErrorMessage(err: unknown, fallback: string) {
  return (err as ClerkError).errors?.[0]?.message ?? fallback;
}

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-16">
          <IconLoader2 className="animate-spin text-gray-400" size={24} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-gray-500">Not signed in.</p>
        </div>
      </div>
    );
  }

  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "";
  const initials =
    ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() ||
    primaryEmail[0]?.toUpperCase() ||
    "U";
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-bold font-heading text-3xl text-gray-900 md:text-4xl">
            Account Settings
          </h1>
          <p className="mt-2 text-gray-500">
            Manage your profile, email addresses, and password.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#077BFF] font-bold text-white text-xl">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900 text-lg">
              {user.firstName || user.lastName
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                : "Your Account"}
            </p>
            <p className="truncate text-gray-500 text-sm">{primaryEmail}</p>
            {memberSince && (
              <p className="text-gray-400 text-xs">
                Member since {memberSince}
              </p>
            )}
          </div>
        </div>

        <ProfileSection />
        <EmailSection />
        <PasswordSection />

        <div className="mt-6 rounded-xl border border-red-200 bg-white p-5">
          <h2 className="font-bold font-heading text-red-600 text-sm">
            Session
          </h2>
          <p className="mt-1 text-gray-500 text-xs">Sign out on this device.</p>
          <button
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 font-medium text-red-600 text-sm transition-colors hover:bg-red-50"
            onClick={() => signOut({ redirectUrl: "/" })}
            type="button"
          >
            <IconLogout size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-bold font-heading text-base text-gray-900">
        {icon}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatusBanner({
  kind,
  children,
  onClose,
}: {
  kind: "error" | "success";
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const classes =
    kind === "error"
      ? "bg-red-50 text-red-600 border border-red-100"
      : "bg-green-50 text-green-700 border border-green-100";
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2 text-sm ${classes}`}
    >
      <span>{children}</span>
      {onClose && (
        <button
          aria-label="Dismiss"
          className="shrink-0 opacity-60 hover:opacity-100"
          onClick={onClose}
          type="button"
        >
          <IconX size={14} />
        </button>
      )}
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg bg-[#077BFF] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#0565D4] disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

function SaveButtonLabel({
  saving,
  saved,
  idleLabel,
}: {
  saving: boolean;
  saved: boolean;
  idleLabel: string;
}) {
  if (saving) {
    return (
      <>
        <IconLoader2 className="animate-spin" size={14} />
        Saving...
      </>
    );
  }
  if (saved) {
    return (
      <>
        <IconCheck size={14} />
        Saved
      </>
    );
  }
  return <>{idleLabel}</>;
}

function TextInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block font-medium text-gray-700 text-sm"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 text-sm placeholder-gray-400 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
        id={id}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
}

function ProfileSection() {
  const { user } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const dirty =
    firstName.trim() !== (user.firstName || "") ||
    lastName.trim() !== (user.lastName || "");

  const handleSave = async () => {
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
    } catch (err) {
      setError(getClerkErrorMessage(err, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard icon={<IconUser size={18} />} title="Profile">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput
          autoComplete="given-name"
          id="first-name"
          label="First name"
          onChange={setFirstName}
          value={firstName}
        />
        <TextInput
          autoComplete="family-name"
          id="last-name"
          label="Last name"
          onChange={setLastName}
          value={lastName}
        />
      </div>

      {error && (
        <div className="mt-3">
          <StatusBanner kind="error" onClose={() => setError("")}>
            {error}
          </StatusBanner>
        </div>
      )}

      <div className="mt-4">
        <PrimaryButton disabled={saving || !dirty} onClick={handleSave}>
          <SaveButtonLabel
            idleLabel="Save Changes"
            saved={saved}
            saving={saving}
          />
        </PrimaryButton>
      </div>
    </SectionCard>
  );
}

function EmailSection() {
  const { user } = useUser();
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState<EmailAddress | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return null;
  }

  const primaryId = user.primaryEmailAddressId;

  const startAdd = async () => {
    setBusy(true);
    setError("");
    try {
      const created = await user.createEmailAddress({ email: newEmail.trim() });
      await created.prepareVerification({ strategy: "email_code" });
      setPendingEmail(created);
      setAdding(false);
      setNewEmail("");
    } catch (err) {
      setError(getClerkErrorMessage(err, "Failed to add email."));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!pendingEmail) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await pendingEmail.attemptVerification({ code: verifyCode.trim() });
      await user.reload();
      setPendingEmail(null);
      setVerifyCode("");
    } catch (err) {
      setError(getClerkErrorMessage(err, "Invalid verification code."));
    } finally {
      setBusy(false);
    }
  };

  const cancelPending = async () => {
    if (!pendingEmail) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await pendingEmail.destroy();
      await user.reload();
      setPendingEmail(null);
      setVerifyCode("");
    } catch (err) {
      setError(getClerkErrorMessage(err, "Failed to cancel."));
    } finally {
      setBusy(false);
    }
  };

  const makePrimary = async (email: EmailAddress) => {
    setBusy(true);
    setError("");
    try {
      await user.update({ primaryEmailAddressId: email.id });
      await user.reload();
    } catch (err) {
      setError(getClerkErrorMessage(err, "Failed to set primary email."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (email: EmailAddress) => {
    setBusy(true);
    setError("");
    try {
      await email.destroy();
      await user.reload();
    } catch (err) {
      setError(getClerkErrorMessage(err, "Failed to remove email."));
    } finally {
      setBusy(false);
    }
  };

  const verifiedEmails = user.emailAddresses.filter(
    (e) => e.verification?.status === "verified"
  );

  return (
    <SectionCard icon={<IconMail size={18} />} title="Email Addresses">
      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
        {verifiedEmails.map((email) => {
          const isPrimary = email.id === primaryId;
          return (
            <li className="flex items-center gap-3 px-4 py-3" key={email.id}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 text-sm">
                  {email.emailAddress}
                </p>
                {isPrimary && (
                  <p className="mt-0.5 flex items-center gap-1 text-[#077BFF] text-xs">
                    <IconStarFilled size={11} />
                    Primary
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {!isPrimary && (
                  <button
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-gray-500 text-xs transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                    disabled={busy}
                    onClick={() => makePrimary(email)}
                    type="button"
                  >
                    <IconStar size={12} />
                    Make Primary
                  </button>
                )}
                {!isPrimary && verifiedEmails.length > 1 && (
                  <button
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-gray-500 text-xs transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    disabled={busy}
                    onClick={() => remove(email)}
                    type="button"
                  >
                    <IconTrash size={12} />
                    Remove
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {pendingEmail && (
        <div className="mt-4 rounded-lg border border-[#077BFF]/20 bg-[#077BFF]/5 p-4">
          <p className="font-medium text-gray-900 text-sm">
            Verify {pendingEmail.emailAddress}
          </p>
          <p className="mt-1 text-gray-500 text-xs">
            Enter the 6-digit code we just emailed you.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              autoComplete="one-time-code"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] sm:max-w-[180px]"
              inputMode="numeric"
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="123456"
              type="text"
              value={verifyCode}
            />
            <div className="flex gap-2">
              <PrimaryButton
                disabled={busy || verifyCode.length < 4}
                onClick={verify}
              >
                {busy ? (
                  <IconLoader2 className="animate-spin" size={14} />
                ) : (
                  "Verify"
                )}
              </PrimaryButton>
              <button
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                disabled={busy}
                onClick={cancelPending}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!pendingEmail && adding && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              autoComplete="email"
              className="w-full flex-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              value={newEmail}
            />
            <div className="flex gap-2">
              <PrimaryButton
                disabled={busy || !newEmail.includes("@")}
                onClick={startAdd}
              >
                {busy ? (
                  <IconLoader2 className="animate-spin" size={14} />
                ) : (
                  "Send Code"
                )}
              </PrimaryButton>
              <button
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                disabled={busy}
                onClick={() => {
                  setAdding(false);
                  setNewEmail("");
                  setError("");
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!(pendingEmail || adding) && (
        <button
          className="mt-4 inline-flex items-center gap-2 font-medium text-[#077BFF] text-sm hover:text-[#0565D4]"
          onClick={() => setAdding(true)}
          type="button"
        >
          <IconPlus size={14} />
          Add Email Address
        </button>
      )}

      {error && (
        <div className="mt-4">
          <StatusBanner kind="error" onClose={() => setError("")}>
            {error}
          </StatusBanner>
        </div>
      )}
    </SectionCard>
  );
}

function PasswordSection() {
  const { user } = useUser();
  const updatePassword = useReverification(
    (params: Parameters<NonNullable<typeof user>["updatePassword"]>[0]) => {
      if (!user) {
        throw new Error("Not signed in");
      }
      return user.updatePassword(params);
    }
  );

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return null;
  }

  const passwordEnabled = user.passwordEnabled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      await updatePassword({
        currentPassword: passwordEnabled ? current : undefined,
        newPassword: next,
        signOutOfOtherSessions: true,
      });
      setSaved(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      if (isReverificationCancelledError(err)) {
        return;
      }
      setError(getClerkErrorMessage(err, "Failed to update password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard icon={<IconLock size={18} />} title="Password">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {passwordEnabled && (
          <TextInput
            autoComplete="current-password"
            id="current-password"
            label="Current password"
            onChange={setCurrent}
            required
            type="password"
            value={current}
          />
        )}
        <TextInput
          autoComplete="new-password"
          id="new-password"
          label="New password"
          onChange={setNext}
          required
          type="password"
          value={next}
        />
        <TextInput
          autoComplete="new-password"
          id="confirm-password"
          label="Confirm new password"
          onChange={setConfirm}
          required
          type="password"
          value={confirm}
        />

        {error && (
          <StatusBanner kind="error" onClose={() => setError("")}>
            {error}
          </StatusBanner>
        )}
        {saved && (
          <StatusBanner kind="success">
            Password updated. Other sessions have been signed out.
          </StatusBanner>
        )}

        <PrimaryButton
          disabled={
            saving || !next || !confirm || (passwordEnabled && !current)
          }
          type="submit"
        >
          {saving && (
            <>
              <IconLoader2 className="animate-spin" size={14} />
              Updating...
            </>
          )}
          {!saving && (passwordEnabled ? "Update Password" : "Set Password")}
        </PrimaryButton>
      </form>
    </SectionCard>
  );
}
