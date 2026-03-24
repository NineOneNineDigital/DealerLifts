"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import type { CheckoutFormData } from "@/lib/store/validators";

export function CheckoutForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sessionId } = useCart();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>();

  const onSubmit = async (data: CheckoutFormData) => {
    if (!sessionId) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          contactName: data.name,
          contactEmail: data.email,
          contactPhone: data.phone || undefined,
          shippingAddress: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Checkout failed");
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="font-heading text-lg font-bold text-gray-900">Contact Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkout-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name *
          </label>
          <input
            id="checkout-name"
            type="text"
            {...register("name", { required: "Name is required" })}
            className={inputClass}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email *
          </label>
          <input
            id="checkout-email"
            type="email"
            {...register("email", { required: "Email is required" })}
            className={inputClass}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="checkout-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
          Phone
        </label>
        <input
          id="checkout-phone"
          type="tel"
          {...register("phone")}
          className={inputClass}
          placeholder="(555) 123-4567"
        />
      </div>

      <h2 className="font-heading text-lg font-bold text-gray-900 pt-4">Shipping Address</h2>
      <div>
        <label htmlFor="checkout-street" className="block text-sm font-medium text-gray-700 mb-1.5">
          Street Address *
        </label>
        <input
          id="checkout-street"
          type="text"
          {...register("street", { required: "Street address is required" })}
          className={inputClass}
          placeholder="123 Main St"
        />
        {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street.message}</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="checkout-city" className="block text-sm font-medium text-gray-700 mb-1.5">
            City *
          </label>
          <input
            id="checkout-city"
            type="text"
            {...register("city", { required: "City is required" })}
            className={inputClass}
            placeholder="Raleigh"
          />
          {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label htmlFor="checkout-state" className="block text-sm font-medium text-gray-700 mb-1.5">
            State *
          </label>
          <input
            id="checkout-state"
            type="text"
            {...register("state", { required: "State is required" })}
            className={inputClass}
            placeholder="NC"
          />
          {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state.message}</p>}
        </div>
        <div>
          <label htmlFor="checkout-zip" className="block text-sm font-medium text-gray-700 mb-1.5">
            ZIP *
          </label>
          <input
            id="checkout-zip"
            type="text"
            {...register("zip", { required: "ZIP code is required", minLength: { value: 5, message: "Valid ZIP required" } })}
            className={inputClass}
            placeholder="27601"
          />
          {errors.zip && <p className="text-red-400 text-xs mt-1">{errors.zip.message}</p>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-3.5 bg-[#077BFF] text-white font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#0565D4] transition-all duration-200 disabled:opacity-50 mt-6"
      >
        {submitting ? "Placing Order..." : "Place Order"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Test mode — no payment will be charged.
      </p>
    </form>
  );
}
