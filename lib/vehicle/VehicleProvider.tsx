"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface Vehicle {
  make: string;
  model: string;
  submodel?: string;
  year: number;
}

interface Ctx {
  clearVehicle: () => void;
  /** True until we've read from localStorage — hide vehicle-dependent UI to prevent hydration flicker. */
  hydrated: boolean;
  setVehicle: (v: Vehicle) => void;
  vehicle: Vehicle | null;
}

const STORAGE_KEY = "dl-selected-vehicle";
const EVENT_NAME = "dl-vehicle-change";

const VehicleContext = createContext<Ctx | null>(null);

function readFromStorage(): Vehicle | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<Vehicle>;
    if (
      typeof parsed.year === "number" &&
      typeof parsed.make === "string" &&
      typeof parsed.model === "string"
    ) {
      return {
        make: parsed.make,
        model: parsed.model,
        submodel:
          typeof parsed.submodel === "string" ? parsed.submodel : undefined,
        year: parsed.year,
      };
    }
  } catch {
    // ignored — fall through to null
  }
  return null;
}

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [vehicle, setVehicleState] = useState<Vehicle | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setVehicleState(readFromStorage());
    setHydrated(true);

    const onChange = () => {
      setVehicleState(readFromStorage());
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setVehicle = useCallback((v: Vehicle) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    window.dispatchEvent(new Event(EVENT_NAME));
    setVehicleState(v);
  }, []);

  const clearVehicle = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
    setVehicleState(null);
  }, []);

  const value = useMemo<Ctx>(
    () => ({ vehicle, setVehicle, clearVehicle, hydrated }),
    [vehicle, setVehicle, clearVehicle, hydrated]
  );

  return (
    <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>
  );
}

export function useSelectedVehicle(): Ctx {
  const ctx = useContext(VehicleContext);
  if (!ctx) {
    throw new Error("useSelectedVehicle must be used inside VehicleProvider");
  }
  return ctx;
}
