"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  message: string;
}

export function ApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>();

  const onSubmit = async (data: ApplicationFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
        <h3 className="font-heading text-2xl font-bold mb-2">Application Submitted!</h3>
        <p className="text-gray-500">We&apos;ll review your application and reach out soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="app-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name *
          </label>
          <input
            id="app-name"
            type="text"
            {...register("name", { required: "Name is required" })}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
            placeholder="Your full name"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="app-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email *
          </label>
          <input
            id="app-email"
            type="email"
            {...register("email", { required: "Email is required" })}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="app-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
          Phone
        </label>
        <input
          id="app-phone"
          type="tel"
          {...register("phone")}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
          placeholder="(919) 555-0123"
        />
      </div>

      <div>
        <label htmlFor="app-position" className="block text-sm font-medium text-gray-700 mb-1.5">
          Position of Interest *
        </label>
        <select
          id="app-position"
          {...register("position", { required: "Please select a position" })}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
        >
          <option value="">Select a position</option>
          <option value="mechanic">Automotive Mechanic / Technician</option>
          <option value="fabricator">Fabrication Specialist</option>
          <option value="installer">Lift & Suspension Installer</option>
          <option value="service-advisor">Service Advisor</option>
          <option value="other">Other</option>
        </select>
        {errors.position && <p className="text-red-400 text-xs mt-1">{errors.position.message}</p>}
      </div>

      <div>
        <label htmlFor="app-experience" className="block text-sm font-medium text-gray-700 mb-1.5">
          Years of Experience
        </label>
        <select
          id="app-experience"
          {...register("experience")}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
        >
          <option value="">Select experience level</option>
          <option value="0-2">0-2 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5-10">5-10 years</option>
          <option value="10+">10+ years</option>
        </select>
      </div>

      <div>
        <label htmlFor="app-message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Tell Us About Yourself *
        </label>
        <textarea
          id="app-message"
          rows={5}
          {...register("message", { required: "Please tell us about yourself" })}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors resize-none"
          placeholder="Describe your experience, certifications, and why you want to work at Dealer Lifts..."
        />
        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-8 py-4 bg-[#077BFF] text-white font-heading font-bold text-sm uppercase tracking-wider rounded hover:bg-[#0565D4] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
