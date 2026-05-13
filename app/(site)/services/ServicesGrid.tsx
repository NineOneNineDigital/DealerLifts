"use client";

import {
  IconArrowUp,
  IconWheel,
  IconShieldCheck,
  IconBulb,
  IconDroplet,
  IconDisc,
  IconEngine,
  IconCar4wd,
} from "@tabler/icons-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const services = [
  {
    icon: IconDroplet,
    title: "Oil Changes & Scheduled Maintenance",
    description:
      "Quick, quality oil changes, fluid flushes, and routine maintenance. Premium synthetic oils and filters to keep your vehicle running its best.",
    brands: [],
  },
  {
    icon: IconEngine,
    title: "Engine & Drivetrain Service",
    description:
      "Complete engine diagnostics, repair, and tuning. Transmission service, differential rebuilds, and drivetrain repair for all makes and models.",
    brands: ["Borla"],
  },
  {
    icon: IconDisc,
    title: "Brakes & Repair",
    description:
      "Brake inspections, pad and rotor replacement, stainless steel lines, and performance upgrades — stopping power you can count on.",
    brands: [],
  },
  {
    icon: IconWheel,
    title: "Wheels, Tires & Alignment",
    description:
      "Tire mounting, balancing, and alignment for any vehicle. New wheels and tires from Method, Fuel, BFGoodrich, Nitto, and Toyo.",
    brands: ["Method", "Fuel", "BFGoodrich"],
  },
  {
    icon: IconArrowUp,
    title: "Lift Kits & Suspension",
    description:
      "Premium lift kits and suspension systems from Carli, BDS, Fox, Icon, and King. From 2\" leveling kits to 12\" full suspension lifts.",
    brands: ["Carli", "BDS", "Fox", "Icon"],
  },
  {
    icon: IconBulb,
    title: "Lighting & Electrical",
    description:
      "Morimoto headlights, Rigid Industries light bars, rock lights, and complete electrical upgrades and diagnostics.",
    brands: ["Morimoto", "Rigid"],
  },
  {
    icon: IconShieldCheck,
    title: "Bumpers & Armor",
    description:
      "Heavy-duty steel bumpers, rock sliders, skid plates, and body armor from Fab Fours, ADD, and ARB for maximum trail protection.",
    brands: ["Fab Fours", "ADD", "ARB"],
  },
  {
    icon: IconCar4wd,
    title: "Custom Builds",
    description:
      "Full-service custom build packages. From concept to completion, your dream vehicle assembled with the best parts available.",
    brands: [],
  },
];

export function ServicesGrid() {
  return (
    <section className="pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-column layout: first 4 services in left col, next 4 in right, with staggered sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {services.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 0.05}>
              <div className="flex gap-4 p-5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group">
                <div className="w-10 h-10 bg-[#077BFF]/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#077BFF]/15 transition-colors">
                  <service.icon size={20} className="text-[#077BFF]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-base font-bold mb-1">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-2">
                    {service.description}
                  </p>
                  {service.brands.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {service.brands.map((brand) => (
                        <span
                          key={brand}
                          className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
