"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  serviceType: string;
  description: string;
  budget: string;
}

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteFormData>();

  const onSubmit = async (data: QuoteFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "quote" }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#077BFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#077BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-2xl font-bold mb-2">Quote Request Sent!</h3>
        <p className="text-gray-500">We&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Name *
          </label>
          <input
            id="name"
            type="text"
            {...register("name", { required: "Name is required" })}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
            placeholder="Your name"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email *
          </label>
          <input
            id="email"
            type="email"
            {...register("email", { required: "Email is required" })}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
          placeholder="(919) 555-0123"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 mb-1.5">
            Vehicle Year
          </label>
          <input
            id="vehicleYear"
            type="text"
            {...register("vehicleYear")}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
            placeholder="2024"
          />
        </div>
        <div>
          <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 mb-1.5">
            Make
          </label>
          <input
            id="vehicleMake"
            type="text"
            {...register("vehicleMake")}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
            placeholder="Ford"
          />
        </div>
        <div>
          <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-1.5">
            Model
          </label>
          <input
            id="vehicleModel"
            type="text"
            {...register("vehicleModel")}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
            placeholder="F-250"
          />
        </div>
      </div>

      <div>
        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1.5">
          Service Type
        </label>
        <select
          id="serviceType"
          {...register("serviceType")}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
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
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
          Describe Your Project *
        </label>
        <textarea
          id="description"
          rows={4}
          {...register("description", { required: "Please describe your project" })}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors resize-none"
          placeholder="Tell us about the work you'd like done..."
        />
        {errors.description && (
          <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1.5">
          Budget Range (Optional)
        </label>
        <select
          id="budget"
          {...register("budget")}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
        >
          <option value="">Prefer not to say</option>
          <option value="under-2k">Under $2,000</option>
          <option value="2k-5k">$2,000 - $5,000</option>
          <option value="5k-10k">$5,000 - $10,000</option>
          <option value="10k-20k">$10,000 - $20,000</option>
          <option value="20k-plus">$20,000+</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-8 py-4 bg-[#077BFF] text-white font-heading font-bold text-sm uppercase tracking-wider rounded hover:bg-[#0565D4] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending..." : "Submit Quote Request"}
      </button>
    </form>
  );
}
