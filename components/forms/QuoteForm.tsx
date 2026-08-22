"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { HCAPTCHA_SITEKEY, submitToWeb3Forms } from "@/lib/forms/web3forms";

interface QuoteFormData {
  budget: string;
  description: string;
  email: string;
  name: string;
  phone: string;
  serviceType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
}

export function QuoteForm({ phone }: { phone: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteFormData>();

  const onSubmit = async (data: QuoteFormData) => {
    if (!captchaToken) {
      setFailed(true);
      return;
    }
    setSubmitting(true);
    setFailed(false);
    try {
      const ok = await submitToWeb3Forms(
        process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_QUOTE,
        {
          type: "quote",
          name: data.name,
          email: data.email,
          phone: data.phone,
          vehicle_year: data.vehicleYear,
          vehicle_make: data.vehicleMake,
          vehicle_model: data.vehicleModel,
          service_type: data.serviceType,
          budget: data.budget,
          description: data.description,
          "h-captcha-response": captchaToken,
        },
        { subject: `New quote request from ${data.name}` }
      );
      if (ok) {
        setSubmitted(true);
      } else {
        setFailed(true);
      }
    } finally {
      setSubmitting(false);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");
    }
  };

  if (submitted) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#077BFF]/10">
          <svg
            className="h-8 w-8 text-[#077BFF]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>
        <h3 className="mb-2 font-bold font-heading text-2xl">
          Quote Request Sent!
        </h3>
        <p className="text-gray-500">
          We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="name"
          >
            Name *
          </label>
          <input
            id="name"
            type="text"
            {...register("name", { required: "Name is required" })}
            className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 text-red-400 text-xs">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="email"
          >
            Email *
          </label>
          <input
            id="email"
            type="email"
            {...register("email", { required: "Email is required" })}
            className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-red-400 text-xs">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          className="mb-1.5 block font-medium text-gray-700 text-sm"
          htmlFor="phone"
        >
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
          placeholder="(919) 555-0123"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="vehicleYear"
          >
            Vehicle Year
          </label>
          <input
            id="vehicleYear"
            type="text"
            {...register("vehicleYear")}
            className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
            placeholder="2024"
          />
        </div>
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="vehicleMake"
          >
            Make
          </label>
          <input
            id="vehicleMake"
            type="text"
            {...register("vehicleMake")}
            className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
            placeholder="Ford"
          />
        </div>
        <div>
          <label
            className="mb-1.5 block font-medium text-gray-700 text-sm"
            htmlFor="vehicleModel"
          >
            Model
          </label>
          <input
            id="vehicleModel"
            type="text"
            {...register("vehicleModel")}
            className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
            placeholder="F-250"
          />
        </div>
      </div>

      <div>
        <label
          className="mb-1.5 block font-medium text-gray-700 text-sm"
          htmlFor="serviceType"
        >
          Service Type
        </label>
        <select
          id="serviceType"
          {...register("serviceType")}
          className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
        >
          <option value="">Select a service</option>
          <option value="lift-kits">Lift Kits & Suspension</option>
          <option value="wheels-tires">Wheels & Tires</option>
          <option value="bumpers-armor">Bumpers & Armor</option>
          <option value="lighting">Lighting & Electrical</option>
          <option value="maintenance">Oil Changes & Maintenance</option>
          <option value="brakes">Brakes & Brake Upgrades</option>
          <option value="engine">Engine & Drivetrain</option>
          <option value="custom-build">Custom Off-Road Build</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label
          className="mb-1.5 block font-medium text-gray-700 text-sm"
          htmlFor="description"
        >
          Describe Your Project *
        </label>
        <textarea
          id="description"
          rows={4}
          {...register("description", {
            required: "Please describe your project",
          })}
          className="w-full resize-none rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
          placeholder="Tell us about the work you'd like done..."
        />
        {errors.description && (
          <p className="mt-1 text-red-400 text-xs">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1.5 block font-medium text-gray-700 text-sm"
          htmlFor="budget"
        >
          Budget Range (Optional)
        </label>
        <select
          id="budget"
          {...register("budget")}
          className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
        >
          <option value="">Prefer not to say</option>
          <option value="under-2k">Under $2,000</option>
          <option value="2k-5k">$2,000 - $5,000</option>
          <option value="5k-10k">$5,000 - $10,000</option>
          <option value="10k-20k">$10,000 - $20,000</option>
          <option value="20k-plus">$20,000+</option>
        </select>
      </div>

      <HCaptcha
        onExpire={() => setCaptchaToken("")}
        onVerify={(token) => setCaptchaToken(token)}
        reCaptchaCompat={false}
        ref={captchaRef}
        sitekey={HCAPTCHA_SITEKEY}
      />
      <button
        className="w-full rounded bg-[#077BFF] px-8 py-4 font-bold font-heading text-sm text-white uppercase tracking-wider transition-all duration-200 hover:bg-[#0565D4] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={submitting || !captchaToken}
        type="submit"
      >
        {submitting ? "Sending..." : "Submit Quote Request"}
      </button>
      {failed && (
        <p className="text-center text-red-500 text-sm">
          Please complete the captcha, or call us at {phone}.
        </p>
      )}
    </form>
  );
}
