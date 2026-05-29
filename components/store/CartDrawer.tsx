"use client";

import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

interface CartDrawerProps {
  onClose: () => void;
  open: boolean;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, itemCount, subtotal, checkoutUrl } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/30"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            animate={{ x: 0 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            transition={{ damping: 25, stiffness: 300, type: "spring" }}
          >
            <div className="flex items-center justify-between border-gray-200 border-b px-6 py-4">
              <h2 className="font-bold font-heading text-lg">
                Cart ({itemCount})
              </h2>
              <button
                className="p-1 text-gray-400 transition-colors hover:text-gray-900"
                onClick={onClose}
                type="button"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-400 text-sm">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => <CartItem item={item} key={item.id} />)
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 pb-6">
                <CartSummary
                  checkoutUrl={checkoutUrl}
                  itemCount={itemCount}
                  subtotal={subtotal}
                />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
