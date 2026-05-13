"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconMenu2,
  IconX,
  IconShoppingCart,
  IconShieldLock,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconPackage,
  IconSettings,
} from "@tabler/icons-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/store/CartDrawer";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/store", label: "Store" },
  { href: "/contact", label: "Contact" },
];

function UserMenu({
  isLight,
  isAdmin,
}: {
  isLight: boolean;
  isAdmin: boolean;
}) {
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

  if (!user) return null;

  const displayName =
    user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress;
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const initials = (
    user.firstName?.[0] ||
    email[0] ||
    "U"
  ).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-full p-1 transition-colors ${
          isLight ? "hover:bg-gray-100" : "hover:bg-white/10"
        }`}
        aria-label="Open user menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#077BFF] text-xs font-bold text-white">
          {initials}
        </span>
        <IconChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""} ${
            isLight ? "text-gray-500" : "text-white/70"
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-gray-900">
              {displayName}
            </p>
            {email && (
              <p className="truncate text-xs text-gray-400">{email}</p>
            )}
          </div>
          <div className="py-1">
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <IconPackage size={15} />
              My Orders
            </Link>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <IconSettings size={15} />
              Manage Account
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 border-t border-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <IconShieldLock size={15} />
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <IconLogout size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const isSignedIn = isLoaded && !!user;
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Pages with dark/colored heroes need light (white) nav text
  const hasDarkHero = pathname === "/" || pathname === "/store";
  const isLight = scrolled || !hasDarkHero;

  const signInHref =
    pathname && pathname !== "/sign-in" && pathname !== "/sign-up"
      ? `/sign-in?redirect_url=${encodeURIComponent(pathname)}`
      : "/sign-in";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span
              className={`font-heading text-xl font-bold tracking-wide transition-colors duration-300 ${
                isLight ? "text-gray-900" : "text-white"
              }`}
            >
              DEALER<span className={isLight ? "text-[#077BFF]" : "text-white/90"}>LIFTS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-[#077BFF]"
                    : isLight
                      ? "text-gray-500 hover:text-gray-900"
                      : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1 text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                  pathname?.startsWith("/admin")
                    ? "text-[#077BFF]"
                    : isLight
                      ? "text-gray-500 hover:text-gray-900"
                      : "text-white/70 hover:text-white"
                }`}
              >
                <IconShieldLock size={14} />
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={`relative p-2 transition-colors ${
                isLight ? "text-gray-500 hover:text-gray-900" : "text-white/70 hover:text-white"
              }`}
              aria-label="Open cart"
            >
              <IconShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#077BFF] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
            {isSignedIn ? (
              <UserMenu isLight={isLight} isAdmin={!!isAdmin} />
            ) : (
              <Link
                href={signInHref}
                className={`text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                  isLight
                    ? "text-gray-500 hover:text-gray-900"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              className={`relative p-2 transition-colors ${
                isLight ? "text-gray-900" : "text-white"
              }`}
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <IconShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#077BFF] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`p-2 transition-colors ${
                isLight ? "text-gray-900" : "text-white"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-white flex flex-col pt-24 px-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col gap-1">
              {[{ href: "/", label: "Home" }, ...navLinks].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 text-lg font-medium border-b border-gray-100 ${
                    pathname === link.href
                      ? "text-[#077BFF]"
                      : "text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isSignedIn && (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 border-b border-gray-100 py-3 text-lg font-medium ${
                      pathname?.startsWith("/orders")
                        ? "text-[#077BFF]"
                        : "text-gray-900"
                    }`}
                  >
                    <IconPackage size={18} />
                    My Orders
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 border-b border-gray-100 py-3 text-lg font-medium ${
                      pathname?.startsWith("/account")
                        ? "text-[#077BFF]"
                        : "text-gray-900"
                    }`}
                  >
                    <IconSettings size={18} />
                    Manage Account
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 text-lg font-medium border-b border-gray-100 flex items-center gap-2 ${
                    pathname?.startsWith("/admin")
                      ? "text-[#077BFF]"
                      : "text-gray-900"
                  }`}
                >
                  <IconShieldLock size={18} />
                  Admin
                </Link>
              )}
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ redirectUrl: "/" });
                  }}
                  className="flex items-center gap-2 border-b border-gray-100 py-3 text-left text-lg font-medium text-red-600"
                >
                  <IconLogout size={18} />
                  Sign Out
                </button>
              ) : (
                <Link
                  href={signInHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 border-b border-gray-100 py-3 text-lg font-medium text-gray-900"
                >
                  <IconUser size={18} />
                  Sign In
                </Link>
              )}
            </nav>
            <div className="mt-8">
              <a
                href="tel:919-275-8095"
                className="block w-full text-center py-3.5 text-gray-500 font-medium text-sm"
              >
                Call (919) 275-8095
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
