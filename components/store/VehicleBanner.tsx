"use client";

import { IconCar, IconEdit, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelectedVehicle } from "@/lib/vehicle/VehicleProvider";

export function VehicleBanner() {
  const { vehicle, clearVehicle, hydrated } = useSelectedVehicle();
  const pathname = usePathname();

  // Only show on store pages
  if (!pathname?.startsWith("/store")) {
    return null;
  }
  if (!hydrated) {
    return null;
  }
  if (!vehicle) {
    return null;
  }

  const viewParts = `/store/vehicle?year=${vehicle.year}&make=${encodeURIComponent(
    vehicle.make
  )}&model=${encodeURIComponent(vehicle.model)}`;

  return (
    <div
      aria-live="polite"
      className="fixed top-16 right-0 left-0 z-40 bg-gray-900 text-white shadow-sm md:top-20"
      role="status"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <IconCar className="shrink-0 text-[#077BFF]" size={16} />
          <p className="truncate text-sm">
            <span className="hidden text-gray-400 sm:inline">
              Showing parts for{" "}
            </span>
            <span className="font-semibold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium text-gray-300 text-xs transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
            href={viewParts}
          >
            View parts
          </Link>
          <Link
            aria-label="Change vehicle"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium text-gray-300 text-xs transition-colors hover:bg-white/10 hover:text-white"
            href="/store/vehicle"
          >
            <IconEdit size={13} />
            <span className="hidden sm:inline">Change</span>
          </Link>
          <button
            aria-label="Clear selected vehicle"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium text-gray-300 text-xs transition-colors hover:bg-white/10 hover:text-white"
            onClick={clearVehicle}
            type="button"
          >
            <IconX size={13} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
}
