"use client";

import {
  IconChevronDown,
  IconLogout,
  IconMenu2,
  IconPackage,
  IconSettings,
  IconShoppingCart,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CartDrawer } from "@/components/store/CartDrawer";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import { telHref } from "@/lib/content/site-settings";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

function UserMenu({ isLight }: { isLight: boolean }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) {
    return null;
  }

  const displayName =
    user.displayName || user.firstName || user.email || "Account";
  const email = user.email ?? "";
  const initials = (
    user.firstName?.[0] ||
    user.displayName?.[0] ||
    email[0] ||
    "U"
  ).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-label="Open user menu"
        className={`flex items-center gap-1.5 rounded-full p-1 transition-colors ${
          isLight ? "hover:bg-gray-100" : "hover:bg-white/10"
        }`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#077BFF] font-bold text-white text-xs">
          {initials}
        </span>
        <IconChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""} ${
            isLight ? "text-gray-500" : "text-white/70"
          }`}
          size={14}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-gray-100 border-b px-3 py-2.5">
            <p className="truncate font-medium text-gray-900 text-sm">
              {displayName}
            </p>
            {email && <p className="truncate text-gray-400 text-xs">{email}</p>}
          </div>
          <div className="py-1">
            <Link
              className="flex items-center gap-2 px-3 py-2 text-gray-700 text-sm hover:bg-gray-50"
              href="/orders"
              onClick={() => setOpen(false)}
            >
              <IconPackage size={15} />
              My Orders
            </Link>
            <Link
              className="flex items-center gap-2 px-3 py-2 text-gray-700 text-sm hover:bg-gray-50"
              href="/account"
              onClick={() => setOpen(false)}
            >
              <IconSettings size={15} />
              Manage Account
            </Link>
            <a
              className="flex w-full items-center gap-2 border-gray-100 border-t px-3 py-2 text-red-600 text-sm hover:bg-red-50"
              href="/api/auth/shopify/logout"
            >
              <IconLogout size={15} />
              Sign Out
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ phone }: { phone: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user, isLoaded } = useUser();
  const isSignedIn = isLoaded && !!user;

  // Pages with dark/colored heroes need light (white) nav text
  const hasDarkHero = pathname === "/" || pathname === "/shop";
  const isLight = scrolled || !hasDarkHero;

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
        animate={{ y: 0 }}
        className={`fixed top-10 right-0 left-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 py-3 shadow-sm backdrop-blur-md"
            : "bg-transparent py-5"
        }`}
        initial={{ y: -100 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2" href="/">
            <span
              className={`font-bold font-heading text-xl tracking-wide transition-colors duration-300 ${
                isLight ? "text-gray-900" : "text-white"
              }`}
            >
              DEALER
              <span className={isLight ? "text-[#077BFF]" : "text-white/90"}>
                LIFTS
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                className={`font-medium text-[13px] tracking-wide transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-[#077BFF]"
                    : isLight
                      ? "text-gray-500 hover:text-gray-900"
                      : "text-white/70 hover:text-white"
                }`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
            <button
              aria-label="Open cart"
              className={`relative p-2 transition-colors ${
                isLight
                  ? "text-gray-500 hover:text-gray-900"
                  : "text-white/70 hover:text-white"
              }`}
              onClick={() => setCartOpen(true)}
              type="button"
            >
              <IconShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#077BFF] font-bold text-[10px] text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
            {isSignedIn ? (
              <UserMenu isLight={isLight} />
            ) : (
              <Link
                className={`font-medium text-[13px] tracking-wide transition-colors duration-200 ${
                  isLight
                    ? "text-gray-500 hover:text-gray-900"
                    : "text-white/70 hover:text-white"
                }`}
                href="/account/sign-in"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              aria-label="Open cart"
              className={`relative p-2 transition-colors ${
                isLight ? "text-gray-900" : "text-white"
              }`}
              onClick={() => setCartOpen(true)}
              type="button"
            >
              <IconShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#077BFF] font-bold text-[10px] text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
            <button
              aria-label="Toggle menu"
              className={`p-2 transition-colors ${
                isLight ? "text-gray-900" : "text-white"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              type="button"
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
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-40 flex flex-col bg-white px-8 pt-24"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col gap-1">
              {[{ href: "/", label: "Home" }, ...navLinks].map((link) => (
                <Link
                  className={`border-gray-100 border-b py-3 font-medium text-lg ${
                    pathname === link.href ? "text-[#077BFF]" : "text-gray-900"
                  }`}
                  href={link.href}
                  key={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isSignedIn && (
                <>
                  <Link
                    className={`flex items-center gap-2 border-gray-100 border-b py-3 font-medium text-lg ${
                      pathname?.startsWith("/orders")
                        ? "text-[#077BFF]"
                        : "text-gray-900"
                    }`}
                    href="/orders"
                    onClick={() => setMobileOpen(false)}
                  >
                    <IconPackage size={18} />
                    My Orders
                  </Link>
                  <Link
                    className={`flex items-center gap-2 border-gray-100 border-b py-3 font-medium text-lg ${
                      pathname?.startsWith("/account")
                        ? "text-[#077BFF]"
                        : "text-gray-900"
                    }`}
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                  >
                    <IconSettings size={18} />
                    Manage Account
                  </Link>
                </>
              )}
              {isSignedIn ? (
                <a
                  className="flex items-center gap-2 border-gray-100 border-b py-3 text-left font-medium text-lg text-red-600"
                  href="/api/auth/shopify/logout"
                  onClick={() => setMobileOpen(false)}
                >
                  <IconLogout size={18} />
                  Sign Out
                </a>
              ) : (
                <Link
                  className="flex items-center gap-2 border-gray-100 border-b py-3 font-medium text-gray-900 text-lg"
                  href="/account/sign-in"
                  onClick={() => setMobileOpen(false)}
                >
                  <IconUser size={18} />
                  Sign In
                </Link>
              )}
            </nav>
            <div className="mt-8">
              <a
                className="block w-full py-3.5 text-center font-medium text-gray-500 text-sm"
                href={telHref(phone)}
              >
                Call {phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer onClose={() => setCartOpen(false)} open={cartOpen} />
    </>
  );
}
