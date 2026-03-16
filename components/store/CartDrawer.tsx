"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, itemCount, subtotal } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-heading text-lg font-bold">
                Cart ({itemCount})
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) =>
                  item.product ? (
                    <CartItem
                      key={item._id}
                      id={item._id}
                      product={item.product}
                      quantity={item.quantity}
                    />
                  ) : null,
                )
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 pb-6">
                <CartSummary subtotal={subtotal} itemCount={itemCount} />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
