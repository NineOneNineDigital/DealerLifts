"use client";

import {
  IconAlertCircle,
  IconCar,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSelectedVehicle } from "@/lib/vehicle/VehicleProvider";

interface FitmentPanelProps {
  productId: Id<"products">;
}

/** Collapse [2018,2019,2020,2022,2023] -> "2018-2020, 2022-2023". */
function formatYearRanges(years: number[]): string {
  if (years.length === 0) {
    return "";
  }
  const sorted = [...years].sort((a, b) => a - b);
  const ranges: [number, number][] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const y = sorted[i];
    if (y === prev + 1) {
      prev = y;
      continue;
    }
    ranges.push([start, prev]);
    start = y;
    prev = y;
  }
  ranges.push([start, prev]);
  return ranges.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(", ");
}

export function FitmentPanel({ productId }: FitmentPanelProps) {
  const { vehicle } = useSelectedVehicle();
  const grouped = useQuery(api.fitments.getForProduct, { productId });
  const [expanded, setExpanded] = useState(false);

  const totalModels = useMemo(() => {
    if (!grouped) {
      return 0;
    }
    return Object.values(grouped).reduce(
      (acc, models) => acc + Object.keys(models).length,
      0
    );
  }, [grouped]);

  const matches = useMemo(() => {
    if (!(vehicle && grouped)) {
      return false;
    }
    const models = grouped[vehicle.make];
    if (!models) {
      return false;
    }
    const years = models[vehicle.model];
    if (!years) {
      return false;
    }
    return years.includes(vehicle.year);
  }, [grouped, vehicle]);

  // Don't render anything while loading or when product has no fitment data —
  // showing an empty panel adds noise without value.
  if (grouped === undefined) {
    return null;
  }
  if (totalModels === 0 && !vehicle) {
    return null;
  }

  return (
    <section className="mt-12 border-gray-200 border-t pt-8">
      <h2 className="mb-4 flex items-center gap-2 font-bold font-heading text-gray-900 text-lg">
        <IconCar className="text-[#077BFF]" size={18} />
        Vehicle Fitment
      </h2>

      {vehicle && totalModels > 0 && (
        <div
          className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${
            matches
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          {matches ? (
            <IconCheck className="mt-0.5 shrink-0 text-green-600" size={20} />
          ) : (
            <IconAlertCircle
              className="mt-0.5 shrink-0 text-amber-600"
              size={20}
            />
          )}
          <div>
            <p
              className={`font-semibold text-sm ${
                matches ? "text-green-900" : "text-amber-900"
              }`}
            >
              {matches
                ? `Fits your ${vehicle.year} ${vehicle.make} ${vehicle.model}`
                : `May not fit your ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            </p>
            {!matches && (
              <p className="mt-0.5 text-amber-800 text-xs">
                This product isn't listed for your vehicle. Check the full
                fitment list below or contact us to confirm.
              </p>
            )}
          </div>
        </div>
      )}

      {totalModels === 0 ? (
        <p className="text-gray-500 text-sm">
          Fitment data not available for this product. Contact us to confirm
          compatibility with your vehicle.
        </p>
      ) : (
        <>
          <button
            aria-expanded={expanded}
            className="flex w-full items-center justify-between py-2 text-left font-medium text-gray-700 text-sm hover:text-gray-900"
            onClick={() => setExpanded((e) => !e)}
            type="button"
          >
            <span>
              Fits {totalModels} vehicle{totalModels === 1 ? "" : "s"}
            </span>
            {expanded ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-4">
              {Object.keys(grouped)
                .sort()
                .map((make) => {
                  const models = grouped[make];
                  return (
                    <div key={make}>
                      <h3 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                        {make}
                      </h3>
                      <ul className="space-y-1.5">
                        {Object.keys(models)
                          .sort()
                          .map((model) => (
                            <li
                              className="flex flex-wrap items-baseline gap-x-2 text-gray-700 text-sm"
                              key={model}
                            >
                              <span className="font-medium text-gray-900">
                                {model}
                              </span>
                              <span className="text-gray-500">
                                {formatYearRanges(models[model])}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
