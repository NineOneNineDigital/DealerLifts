"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(timeoutRef.current);
    if (value.trim()) {
      timeoutRef.current = setTimeout(() => {
        router.push(`/store/search?q=${encodeURIComponent(value.trim())}`);
      }, 400);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearTimeout(timeoutRef.current);
    if (query.trim()) {
      router.push(`/store/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search parts..."
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
      />
    </form>
  );
}
