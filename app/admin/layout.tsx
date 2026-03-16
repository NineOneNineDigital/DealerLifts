"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import {
  IconDashboard,
  IconMessageCircle,
  IconShoppingCart,
  IconPackage,
  IconBoxSeam,
  IconUsers,
  IconRefresh,
  IconSettings,
  IconArrowLeft,
  IconUser,
  IconLogout,
  IconChevronUp,
} from "@tabler/icons-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: IconDashboard, exact: true },
  { href: "/admin/chat", label: "Chat", icon: IconMessageCircle, exact: false },
  { href: "/admin/orders", label: "Orders", icon: IconShoppingCart, exact: false },
  { href: "/admin/products", label: "Products", icon: IconPackage, exact: false },
  { href: "/admin/inventory", label: "Inventory", icon: IconBoxSeam, exact: false },
  { href: "/admin/customers", label: "Customers", icon: IconUsers, exact: false },
  { href: "/admin/sync", label: "Sync Status", icon: IconRefresh, exact: false },
  { href: "/admin/settings", label: "Settings", icon: IconSettings, exact: false },
];

function AdminUserButton({ pathname }: { pathname: string | null }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const displayName =
    user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "Admin";
  const email = user?.emailAddresses?.[0]?.emailAddress || "";
  const initials = (user?.firstName?.[0] || email[0] || "A").toUpperCase();
  const isAccountActive = pathname === "/admin/account";

  return (
    <div className="relative" ref={menuRef}>
      {/* Popover menu */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <Link
            href="/admin/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <IconUser size={15} />
            My Account
          </Link>
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <IconLogout size={15} />
            Sign Out
          </button>
        </div>
      )}

      {/* User button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
          isAccountActive
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          {email && (
            <p className="truncate text-[10px] text-gray-400">{email}</p>
          )}
        </div>
        <IconChevronUp
          size={14}
          className={`text-gray-400 transition-transform ${open ? "" : "rotate-180"}`}
        />
      </button>
    </div>
  );
}

function AdminShell({
  pathname,
  children,
}: {
  pathname: string | null;
  children: React.ReactNode;
}) {
  const { unreadCount } = useAdminNotifications();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-4">
          <span className="font-heading text-lg font-bold text-primary">
            DL Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {item.label === "Chat" && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            <IconArrowLeft size={16} />
            Back to site
          </Link>
          <AdminUserButton pathname={pathname} />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // TODO: Re-enable auth gate once Clerk sign-in is working
  // const { isSignedIn, isLoaded } = useAuth();
  // if (!isLoaded) return spinner;
  // if (!isSignedIn) return null;

  return <AdminShell pathname={pathname}>{children}</AdminShell>;
}
