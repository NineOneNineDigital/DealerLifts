"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { HCAPTCHA_SITEKEY, submitToWeb3Forms } from "@/lib/forms/web3forms";

interface ContactFormData {
  email: string;
  message: string;
  name: string;
}

export function ContactForm({ phone }: { phone: string }) {
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
      <div className="py-8 text-center">
        <h3 className="mb-2 font-bold font-heading text-xl">Message Sent!</h3>
        <p className="text-gray-500 text-sm">We&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label
          className="mb-1.5 block font-medium text-gray-700 text-sm"
          htmlFor="contact-name"
        >
          Name *
        </label>
        <input
          id="contact-name"
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
          htmlFor="contact-email"
        >
          Email *
        </label>
        <input
          id="contact-email"
          type="email"
          {...register("email", { required: "Email is required" })}
          className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-red-400 text-xs">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label
          className="mb-1.5 block font-medium text-gray-700 text-sm"
          htmlFor="contact-message"
        >
          Message *
        </label>
        <textarea
          id="contact-message"
          rows={4}
          {...register("message", { required: "Message is required" })}
          className="w-full resize-none rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
          placeholder="How can we help you?"
        />
        {errors.message && (
          <p className="mt-1 text-red-400 text-xs">{errors.message.message}</p>
        )}
      </div>
      <HCaptcha
        onExpire={() => setCaptchaToken("")}
        onVerify={(token) => setCaptchaToken(token)}
        reCaptchaCompat={false}
        ref={captchaRef}
        sitekey={HCAPTCHA_SITEKEY}
      />
      <button
        className="w-full rounded bg-[#077BFF] px-6 py-3 font-bold font-heading text-sm text-white uppercase tracking-wider transition-all duration-200 hover:bg-[#0565D4] disabled:opacity-50"
        disabled={submitting || !captchaToken}
        type="submit"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
      {failed && (
        <p className="text-center text-red-500 text-sm">
          Please complete the captcha, or call us at {phone}.
        </p>
      )}
    </form>
  );
}
