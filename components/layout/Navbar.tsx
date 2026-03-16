"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconMenu2, IconX, IconShoppingCart, IconShieldLock } from "@tabler/icons-react";
import { useUser } from "@clerk/nextjs";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/store/CartDrawer";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
  { href: "/store", label: "Store" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Pages with dark/colored heroes need light (white) nav text
  const hasDarkHero = pathname === "/" || pathname.startsWith("/store");
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
            <Link
              href="/contact"
              className="ml-1 px-5 py-2 bg-[#077BFF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0565D4] transition-colors"
            >
              Get a Quote
            </Link>
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
            </nav>
            <div className="mt-8">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-6 py-3.5 bg-[#077BFF] text-white font-semibold rounded-lg hover:bg-[#0565D4] transition-colors"
              >
                Get a Quote
              </Link>
              <a
                href="tel:919-275-8095"
                className="block w-full text-center mt-3 py-3.5 text-gray-500 font-medium text-sm"
              >
                or call (919) 275-8095
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
