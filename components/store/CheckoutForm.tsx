"use client";

import { IconLoader2, IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "@/hooks/useCart";
import type { CheckoutFormData } from "@/lib/store/validators";

declare global {
  interface Window {
    Accept: {
      dispatchData: (
        secureData: {
          authData: { clientKey: string; apiLoginID: string };
          cardData: {
            cardNumber: string;
            month: string;
            year: string;
            cardCode: string;
          };
        },
        responseHandler: (response: AcceptResponse) => void
      ) => void;
    };
  }
}

interface AcceptResponse {
  messages: {
    resultCode: "Ok" | "Error";
    message: Array<{ code: string; text: string }>;
  };
  opaqueData?: { dataDescriptor: string; dataValue: string };
}

const US_STATES: Array<{ value: string; label: string }> = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "PR", label: "Puerto Rico" },
  { value: "VI", label: "U.S. Virgin Islands" },
  { value: "GU", label: "Guam" },
  { value: "AS", label: "American Samoa" },
  { value: "MP", label: "Northern Mariana Islands" },
];

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function CheckoutForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptLoaded, setAcceptLoaded] = useState(false);
  const { sessionId } = useCart();
  const router = useRouter();

  const expYearRef = useRef<HTMLInputElement | null>(null);
  const cvvRef = useRef<HTMLInputElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  type FormValues = CheckoutFormData & {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv: string;
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window.Accept) {
      setAcceptLoaded(true);
      return;
    }

    const isSandbox = process.env.NEXT_PUBLIC_AUTHORIZENET_SANDBOX !== "false";
    const scriptUrl = isSandbox
      ? "https://jstest.authorize.net/v1/Accept.js"
      : "https://js.authorize.net/v1/Accept.js";

    const existing = document.querySelector(
      `script[src="${scriptUrl}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      if (window.Accept) {
        setAcceptLoaded(true);
      } else {
        existing.addEventListener("load", () => setAcceptLoaded(true), {
          once: true,
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => setAcceptLoaded(true);
    script.onerror = () => setError("Failed to load payment processor");
    document.head.appendChild(script);
    // Accept.js is a singleton — leave it in place across mounts.
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [error]);

  const tokenizeCard = useCallback(
    (cardData: {
      cardNumber: string;
      month: string;
      year: string;
      cardCode: string;
    }): Promise<AcceptResponse> => {
      return new Promise((resolve) => {
        const secureData = {
          authData: {
            clientKey: process.env.NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY!,
            apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID!,
          },
          cardData,
        };
        window.Accept.dispatchData(secureData, resolve);
      });
    },
    []
  );

  const onSubmit = async (data: FormValues) => {
    if (!sessionId) {
      return;
    }
    if (!acceptLoaded) {
      setError(
        "Payment processor not ready. Please wait a moment and try again."
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const tokenResponse = await tokenizeCard({
        cardNumber: data.cardNumber.replace(/\s/g, ""),
        month: data.expMonth.padStart(2, "0"),
        year: data.expYear.length === 2 ? `20${data.expYear}` : data.expYear,
        cardCode: data.cvv,
      });

      if (
        tokenResponse.messages.resultCode !== "Ok" ||
        !tokenResponse.opaqueData
      ) {
        const msg =
          tokenResponse.messages.message.map((m) => m.text).join(" ") ||
          "Card validation failed";
        throw new Error(msg);
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          shippingAddress: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
          },
          opaqueData: tokenResponse.opaqueData,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Payment failed");
      }

      if (result.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors";
  const errorTextClass = "text-red-600 text-xs mt-1";

  const cardNumberRegister = register("cardNumber", {
    required: "Card number is required",
    pattern: {
      value: /^[\d\s]{13,23}$/,
      message: "Invalid card number",
    },
    validate: (value) => {
      const digits = value.replace(/\s/g, "");
      return (
        (digits.length >= 13 && digits.length <= 19) || "Invalid card number"
      );
    },
  });

  const expMonthRegister = register("expMonth", {
    required: "Required",
    pattern: { value: /^(0[1-9]|1[0-2]|[1-9])$/, message: "MM" },
  });

  const expYearRegister = register("expYear", {
    required: "Required",
    pattern: { value: /^(\d{2}|\d{4})$/, message: "YY" },
    validate: (value) => {
      const monthStr = getValues("expMonth");
      if (!monthStr) {
        return true;
      }
      const m = Number.parseInt(monthStr, 10);
      const y =
        value.length === 2
          ? 2000 + Number.parseInt(value, 10)
          : Number.parseInt(value, 10);
      if (!(m && y)) {
        return true;
      }
      // Card valid through end of expiration month — exp = first day of next month.
      const exp = new Date(y, m, 1);
      return exp > new Date() || "Card is expired";
    },
  });

  const cvvRegister = register("cvv", {
    required: "Required",
    pattern: { value: /^\d{3,4}$/, message: "3-4 digits" },
  });

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <h2 className="font-bold font-heading text-gray-900 text-lg">
        Contact Information
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="checkout-name"
          >
            Full Name *
          </label>
          <input
            aria-describedby={errors.name ? "checkout-name-error" : undefined}
            aria-invalid={errors.name ? "true" : "false"}
            autoComplete="name"
            id="checkout-name"
            type="text"
            {...register("name", { required: "Name is required" })}
            className={inputClass}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className={errorTextClass} id="checkout-name-error">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="checkout-email"
          >
            Email *
          </label>
          <input
            aria-describedby={errors.email ? "checkout-email-error" : undefined}
            aria-invalid={errors.email ? "true" : "false"}
            autoComplete="email"
            id="checkout-email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Valid email is required",
              },
            })}
            className={inputClass}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className={errorTextClass} id="checkout-email-error">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <label
          className="mb-1.5 block font-medium text-gray-700 text-sm"
          htmlFor="checkout-phone"
        >
          Phone
        </label>
        <input
          autoComplete="tel"
          id="checkout-phone"
          type="tel"
          {...register("phone")}
          className={inputClass}
          placeholder="(555) 123-4567"
        />
      </div>

      <h2 className="pt-4 font-bold font-heading text-gray-900 text-lg">
        Shipping Address
      </h2>
      <div>
        <label
          className="mb-1.5 block font-medium text-gray-700 text-sm"
          htmlFor="checkout-street"
        >
          Street Address *
        </label>
        <input
          aria-describedby={errors.street ? "checkout-street-error" : undefined}
          aria-invalid={errors.street ? "true" : "false"}
          autoComplete="street-address"
          id="checkout-street"
          type="text"
          {...register("street", { required: "Street address is required" })}
          className={inputClass}
          placeholder="123 Main St"
        />
        {errors.street && (
          <p className={errorTextClass} id="checkout-street-error">
            {errors.street.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="checkout-city"
          >
            City *
          </label>
          <input
            aria-describedby={errors.city ? "checkout-city-error" : undefined}
            aria-invalid={errors.city ? "true" : "false"}
            autoComplete="address-level2"
            id="checkout-city"
            type="text"
            {...register("city", { required: "City is required" })}
            className={inputClass}
            placeholder="Raleigh"
          />
          {errors.city && (
            <p className={errorTextClass} id="checkout-city-error">
              {errors.city.message}
            </p>
          )}
        </div>
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="checkout-state"
          >
            State *
          </label>
          <select
            aria-describedby={errors.state ? "checkout-state-error" : undefined}
            aria-invalid={errors.state ? "true" : "false"}
            autoComplete="address-level1"
            id="checkout-state"
            {...register("state", { required: "State is required" })}
            className={inputClass}
            defaultValue=""
          >
            <option disabled value="">
              Select…
            </option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className={errorTextClass} id="checkout-state-error">
              {errors.state.message}
            </p>
          )}
        </div>
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="checkout-zip"
          >
            ZIP *
          </label>
          <input
            aria-describedby={errors.zip ? "checkout-zip-error" : undefined}
            aria-invalid={errors.zip ? "true" : "false"}
            autoComplete="postal-code"
            id="checkout-zip"
            inputMode="numeric"
            type="text"
            {...register("zip", {
              required: "ZIP code is required",
              pattern: {
                value: /^\d{5}(-\d{4})?$/,
                message: "Invalid ZIP code",
              },
            })}
            className={inputClass}
            placeholder="27601"
          />
          {errors.zip && (
            <p className={errorTextClass} id="checkout-zip-error">
              {errors.zip.message}
            </p>
          )}
        </div>
      </div>

      <h2 className="pt-4 font-bold font-heading text-gray-900 text-lg">
        Payment
      </h2>
      {!acceptLoaded && (
        <p aria-live="polite" className="text-gray-500 text-xs" role="status">
          Loading secure payment form…
        </p>
      )}
      <div>
        <label
          className="mb-1.5 block font-medium text-gray-700 text-sm"
          htmlFor="checkout-card"
        >
          Card Number *
        </label>
        <input
          aria-describedby={
            errors.cardNumber ? "checkout-card-error" : undefined
          }
          aria-invalid={errors.cardNumber ? "true" : "false"}
          autoComplete="cc-number"
          id="checkout-card"
          inputMode="numeric"
          type="text"
          {...cardNumberRegister}
          className={inputClass}
          onChange={(e) => {
            const formatted = formatCardNumber(e.target.value);
            e.target.value = formatted;
            setValue("cardNumber", formatted, { shouldValidate: false });
            cardNumberRegister.onChange(e);
          }}
          placeholder="1234 5678 9012 3456"
        />
        {errors.cardNumber && (
          <p className={errorTextClass} id="checkout-card-error">
            {errors.cardNumber.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="checkout-exp-month"
          >
            Month *
          </label>
          <input
            aria-describedby={
              errors.expMonth ? "checkout-exp-month-error" : undefined
            }
            aria-invalid={errors.expMonth ? "true" : "false"}
            autoComplete="cc-exp-month"
            id="checkout-exp-month"
            inputMode="numeric"
            maxLength={2}
            type="text"
            {...expMonthRegister}
            className={inputClass}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
              e.target.value = digits;
              setValue("expMonth", digits, { shouldValidate: false });
              expMonthRegister.onChange(e);
              if (digits.length === 2) {
                expYearRef.current?.focus();
              }
            }}
            placeholder="MM"
          />
          {errors.expMonth && (
            <p className={errorTextClass} id="checkout-exp-month-error">
              {errors.expMonth.message}
            </p>
          )}
        </div>
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="checkout-exp-year"
          >
            Year *
          </label>
          <input
            aria-describedby={
              errors.expYear ? "checkout-exp-year-error" : undefined
            }
            aria-invalid={errors.expYear ? "true" : "false"}
            autoComplete="cc-exp-year"
            id="checkout-exp-year"
            inputMode="numeric"
            maxLength={4}
            type="text"
            {...expYearRegister}
            className={inputClass}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
              e.target.value = digits;
              setValue("expYear", digits, { shouldValidate: false });
              expYearRegister.onChange(e);
              if (digits.length === 2 || digits.length === 4) {
                cvvRef.current?.focus();
              }
            }}
            placeholder="YY"
            ref={(el) => {
              expYearRegister.ref(el);
              expYearRef.current = el;
            }}
          />
          {errors.expYear && (
            <p className={errorTextClass} id="checkout-exp-year-error">
              {errors.expYear.message}
            </p>
          )}
        </div>
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="checkout-cvv"
          >
            CVV *
          </label>
          <input
            aria-describedby={`checkout-cvv-help${errors.cvv ? " checkout-cvv-error" : ""}`}
            aria-invalid={errors.cvv ? "true" : "false"}
            autoComplete="cc-csc"
            id="checkout-cvv"
            inputMode="numeric"
            maxLength={4}
            type="text"
            {...cvvRegister}
            className={inputClass}
            placeholder="123"
            ref={(el) => {
              cvvRegister.ref(el);
              cvvRef.current = el;
            }}
          />
          <span className="sr-only" id="checkout-cvv-help">
            3 or 4 digit security code on the back of your card
          </span>
          {errors.cvv && (
            <p className={errorTextClass} id="checkout-cvv-error">
              {errors.cvv.message}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div
          aria-live="assertive"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          ref={errorRef}
          role="alert"
        >
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#077BFF] px-6 py-3.5 font-bold font-heading text-sm text-white uppercase tracking-wider transition-all duration-200 hover:bg-[#0565D4] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={submitting || !acceptLoaded}
        type="submit"
      >
        {submitting && <IconLoader2 className="animate-spin" size={16} />}
        {submitting ? "Processing Payment..." : "Pay Now"}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-gray-500 text-xs">
        <IconLock size={12} />
        Your payment is securely processed by Authorize.net.
      </p>
    </form>
  );
}
