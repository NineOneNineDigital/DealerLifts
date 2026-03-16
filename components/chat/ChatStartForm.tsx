"use client";

import { useState } from "react";
import { IconSend } from "@tabler/icons-react";

interface ChatStartFormProps {
  onStart: (name: string, email: string) => void;
  isLoading: boolean;
}

export function ChatStartForm({ onStart, isLoading }: ChatStartFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onStart(name.trim(), email.trim());
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center p-6">
      <div className="mb-6 text-center">
        <h3 className="font-heading text-lg font-semibold text-gray-900">
          Start a conversation
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          We're here to help! Enter your details to begin.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="chat-name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id="chat-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="chat-email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="chat-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !name.trim() || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <IconSend size={16} />
          {isLoading ? "Starting..." : "Start Chat"}
        </button>
      </form>
    </div>
  );
}
