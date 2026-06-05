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
import { YmmSelect } from "./YmmSelect";

export function VehicleSelector() {
  const router = useRouter();
  const { vehicle, setVehicle, clearVehicle } = useSelectedVehicle();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [submodel, setSubmodel] = useState("");

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [submodels, setSubmodels] = useState<string[]>([]);

  // Prefill the form from the persisted vehicle.
  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setYear(String(vehicle.year));
      setSubmodel(vehicle.submodel ?? "");
    }
  }, [vehicle]);

  useEffect(() => {
    listYearsAction().then(setYears);
  }, []);

  // The cascade effects only LOAD option lists — resetting downstream
  // selections is the onChange handlers' job, so a prefilled vehicle keeps its
  // year/make/model values.
  useEffect(() => {
    const yearNum = Number(year);
    if (year && Number.isFinite(yearNum)) {
      listMakesAction(yearNum).then(setMakes);
    } else {
      setMakes([]);
    }
  }, [year]);

  useEffect(() => {
    const yearNum = Number(year);
    if (year && Number.isFinite(yearNum) && make) {
      listModelsAction(yearNum, make).then(setModels);
    } else {
      setModels([]);
    }
  }, [year, make]);

  useEffect(() => {
    const yearNum = Number(year);
    if (year && Number.isFinite(yearNum) && make && model) {
      listSubmodelsAction(yearNum, make, model).then(setSubmodels);
    } else {
      setSubmodels([]);
    }
  }, [year, make, model]);

  const onYear = (v: string) => {
    setYear(v);
    setMake("");
    setModel("");
    setSubmodel("");
  };
  const onMake = (v: string) => {
    setMake(v);
    setModel("");
    setSubmodel("");
  };
  const onModel = (v: string) => {
    setModel(v);
    setSubmodel("");
  };

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
    const params = new URLSearchParams({ make, model, year: String(yearNum) });
    if (submodel) {
      params.set("submodel", submodel);
    }
    router.push(`/shop/vehicle?${params.toString()}`);
  };

  const handleReset = () => {
    setYear("");
    setMake("");
    setModel("");
    setSubmodel("");
    setMakes([]);
    setModels([]);
    setSubmodels([]);
    clearVehicle();
  };

  const ready = Boolean(year && make && model);
  const canReset = Boolean(year || make || model || submodel || vehicle);
  const noDataLoaded = years.length === 0;

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

      {noDataLoaded ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800 text-sm">
          Vehicle data is still being synced. Check back shortly or browse the
          full catalog below.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <YmmSelect
          onChange={onYear}
          options={years.map((y) => ({ label: String(y), value: String(y) }))}
          placeholder="Select Year"
          value={year}
        />
        <YmmSelect
          disabled={!year}
          onChange={onMake}
          options={makes.map((m) => ({ label: m, value: m }))}
          placeholder="Select Make"
          value={make}
        />
        <YmmSelect
          disabled={!make}
          onChange={onModel}
          options={models.map((m) => ({ label: m, value: m }))}
          placeholder="Select Model"
          value={model}
        />
        <YmmSelect
          disabled={!model || submodels.length === 0}
          onChange={setSubmodel}
          options={submodels.map((s) => ({ label: s, value: s }))}
          placeholder="All Submodels"
          value={submodel}
        />
      </div>
      <div className="flex gap-3">
        <button
          className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-600 text-sm transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40"
          disabled={!canReset}
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
        <button
          className="flex-1 rounded-lg bg-[#077BFF] px-6 py-3 font-bold font-heading text-sm text-white uppercase tracking-wider transition-colors hover:bg-[#0565D4] disabled:opacity-50"
          disabled={!ready}
          onClick={handleSearch}
          type="button"
        >
          Find Parts
        </button>
      </div>
    </div>
  );
}
