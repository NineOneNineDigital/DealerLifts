"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  listMakesAction,
  listModelsAction,
  listSubmodelsAction,
  listYearsAction,
} from "@/lib/store/fitment-actions";
import { useSelectedVehicle } from "@/lib/vehicle/VehicleProvider";

export function VehicleSelector() {
  const router = useRouter();
  const { vehicle, setVehicle } = useSelectedVehicle();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [submodel, setSubmodel] = useState("");

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [submodels, setSubmodels] = useState<string[]>([]);

  // Prefill from the persistent selection so the form shows the current vehicle
  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setYear(String(vehicle.year));
      setSubmodel(vehicle.submodel ?? "");
    }
  }, [vehicle]);

  useEffect(() => {
    listMakesAction().then(setMakes);
  }, []);

  useEffect(() => {
    if (make) {
      listModelsAction(make).then(setModels);
      setModel("");
      setYear("");
      setSubmodel("");
      setYears([]);
      setSubmodels([]);
    } else {
      setModels([]);
    }
  }, [make]);

  useEffect(() => {
    if (make && model) {
      listYearsAction(make, model).then(setYears);
      setYear("");
      setSubmodel("");
      setSubmodels([]);
    } else {
      setYears([]);
    }
  }, [make, model]);

  useEffect(() => {
    if (make && model && year) {
      const yearNum = Number(year);
      if (Number.isFinite(yearNum)) {
        listSubmodelsAction(make, model, yearNum).then(setSubmodels);
      }
      setSubmodel("");
    } else {
      setSubmodels([]);
    }
  }, [make, model, year]);

  const handleSearch = () => {
    if (!(year && make && model)) {
      return;
    }
    const yearNum = Number(year);
    if (!Number.isFinite(yearNum)) {
      return;
    }
    setVehicle({
      make,
      model,
      submodel: submodel || undefined,
      year: yearNum,
    });
    const params = new URLSearchParams({
      make,
      model,
      year: String(yearNum),
    });
    if (submodel) {
      params.set("submodel", submodel);
    }
    router.push(`/store/vehicle?${params.toString()}`);
  };

  const noMakesLoaded = makes.length === 0;

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold font-heading text-gray-900 text-lg">
          Find Parts for Your Vehicle
        </h3>
        {vehicle && (
          <span className="text-gray-500 text-xs">
            Current: {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.submodel ? ` ${vehicle.submodel}` : ""}
          </span>
        )}
      </div>

      {noMakesLoaded ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800 text-sm">
          Vehicle data is still being synced. Check back shortly or browse the
          full catalog below.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
          onChange={(e) => {
            setMake(e.target.value);
            setModel("");
            setYear("");
            setSubmodel("");
          }}
          value={make}
        >
          <option value="">Select Make</option>
          {makes.map((m) => (
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
            setSubmodel("");
          }}
          value={model}
        >
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] disabled:opacity-50"
          disabled={!model}
          onChange={(e) => {
            setYear(e.target.value);
            setSubmodel("");
          }}
          value={year}
        >
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF] disabled:opacity-50"
          disabled={!year || submodels.length === 0}
          onChange={(e) => setSubmodel(e.target.value)}
          value={submodel}
        >
          <option value="">All Submodels</option>
          {submodels.map((s) => (
            <option key={s} value={s}>
              {s}
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
