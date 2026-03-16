"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export function VehicleSelector() {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const makes = useQuery(api.fitments.getMakes);
  const models = useQuery(api.fitments.getModels, make ? { make } : "skip");
  const years = useQuery(
    api.fitments.getYears,
    make && model ? { make, model } : "skip",
  );

  const handleSearch = () => {
    if (year && make && model) {
      router.push(`/store/vehicle?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="font-heading font-bold text-lg text-gray-900">Find Parts for Your Vehicle</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            setModel("");
            setYear("");
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
        >
          <option value="">Select Make</option>
          {makes?.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            setYear("");
          }}
          disabled={!make}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] disabled:opacity-50"
        >
          <option value="">Select Model</option>
          {models?.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={!model}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] disabled:opacity-50"
        >
          <option value="">Select Year</option>
          {years?.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleSearch}
        disabled={!year || !make || !model}
        className="w-full px-6 py-3 bg-[#077BFF] text-white font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#0565D4] transition-colors disabled:opacity-50"
      >
        Find Parts
      </button>
    </div>
  );
}
