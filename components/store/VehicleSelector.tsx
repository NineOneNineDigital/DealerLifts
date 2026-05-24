"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useSelectedVehicle } from "@/lib/vehicle/VehicleProvider";

export function VehicleSelector() {
  const router = useRouter();
  const { vehicle, setVehicle } = useSelectedVehicle();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  // Prefill from the persistent selection so the form shows the current vehicle
  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setYear(String(vehicle.year));
    }
  }, [vehicle]);

  const makes = useQuery(api.fitments.getMakes);
  const models = useQuery(api.fitments.getModels, make ? { make } : "skip");
  const years = useQuery(
    api.fitments.getYears,
    make && model ? { make, model } : "skip"
  );

  const handleSearch = () => {
    if (!(year && make && model)) {
      return;
    }
    const yearNum = Number(year);
    if (!Number.isFinite(yearNum)) {
      return;
    }
    setVehicle({ year: yearNum, make, model });
    router.push(
      `/store/vehicle?year=${yearNum}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`
    );
  };

  const noMakesLoaded = makes !== undefined && makes.length === 0;

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold font-heading text-gray-900 text-lg">
          Find Parts for Your Vehicle
        </h3>
        {vehicle && (
          <span className="text-gray-500 text-xs">
            Current: {vehicle.year} {vehicle.make} {vehicle.model}
          </span>
        )}
      </div>

      {noMakesLoaded ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800 text-sm">
          Vehicle data is still being synced. Check back shortly or browse the
          full catalog below.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
          onChange={(e) => {
            setMake(e.target.value);
            setModel("");
            setYear("");
          }}
          value={make}
        >
          <option value="">Select Make</option>
          {makes?.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] disabled:opacity-50"
          disabled={!make}
          onChange={(e) => {
            setModel(e.target.value);
            setYear("");
          }}
          value={model}
        >
          <option value="">Select Model</option>
          {models?.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] disabled:opacity-50"
          disabled={!model}
          onChange={(e) => setYear(e.target.value)}
          value={year}
        >
          <option value="">Select Year</option>
          {years?.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <button
        className="w-full rounded-lg bg-[#077BFF] px-6 py-3 font-bold font-heading text-sm text-white uppercase tracking-wider transition-colors hover:bg-[#0565D4] disabled:opacity-50"
        disabled={!(year && make && model)}
        onClick={handleSearch}
        type="button"
      >
        Find Parts
      </button>
    </div>
  );
}
