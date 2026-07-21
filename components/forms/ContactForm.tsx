"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { HCAPTCHA_SITEKEY, submitToWeb3Forms } from "@/lib/forms/web3forms";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    if (!captchaToken) {
      setFailed(true);
      return;
    }
    setSubmitting(true);
    setFailed(false);
    try {
      const ok = await submitToWeb3Forms(
        process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_CONTACT,
        {
          type: "general",
          name: data.name,
          email: data.email,
          message: data.message,
          "h-captcha-response": captchaToken,
        },
        { subject: `New contact message from ${data.name}` }
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
      <div className="text-center py-8">
        <h3 className="font-heading text-xl font-bold mb-2">Message Sent!</h3>
        <p className="text-gray-500 text-sm">We&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Name *
        </label>
        <input
          id="contact-name"
          type="text"
          {...register("name", { required: "Name is required" })}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
          placeholder="Your name"
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email *
        </label>
        <input
          id="contact-email"
          type="email"
          {...register("email", { required: "Email is required" })}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors"
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Message *
        </label>
        <textarea
          id="contact-message"
          rows={4}
          {...register("message", { required: "Message is required" })}
          className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] transition-colors resize-none"
          placeholder="How can we help you?"
        />
        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
      </div>
      <HCaptcha
        ref={captchaRef}
        sitekey={HCAPTCHA_SITEKEY}
        reCaptchaCompat={false}
        onVerify={(token) => setCaptchaToken(token)}
        onExpire={() => setCaptchaToken("")}
      />
      <button
        type="submit"
        disabled={submitting || !captchaToken}
        className="w-full px-6 py-3 bg-[#077BFF] text-white font-heading font-bold text-sm uppercase tracking-wider rounded hover:bg-[#0565D4] transition-all duration-200 disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
      {failed && (
        <p className="text-red-500 text-sm text-center">
          Please complete the captcha, or call us at (919) 275-8095.
        </p>
      )}
    </form>
  );
}
