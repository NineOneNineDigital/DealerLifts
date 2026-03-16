"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbox } from "@/components/ui/Lightbox";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";

const categories = ["All", "Trucks", "Jeeps", "SUVs", "Lighting", "Wheels"];

const galleryItems = [
  {
    title: "2024 Ford F-250 Platinum Build",
    category: "Trucks",
    services: "6\" BDS Lift, Method Wheels, 37\" Nitto Ridge Grapplers",
    image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80",
  },
  {
    title: "2023 Jeep Wrangler Rubicon",
    category: "Jeeps",
    services: "4.5\" Carli Lift, 40\" BFG KM3, Morimoto XB LED",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
  },
  {
    title: "2024 Toyota 4Runner TRD Pro",
    category: "SUVs",
    services: "Icon Stage 4, Method 703 Wheels, Rigid Light Bar",
    image: "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&q=80",
  },
  {
    title: "2023 Ram 2500 Cummins",
    category: "Trucks",
    services: "Carli Pintop, Fuel Wheels, BFG KO2 37\"",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
  },
  {
    title: "Morimoto XB Headlight Install",
    category: "Lighting",
    services: "Full Morimoto XB LED Conversion",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
  },
  {
    title: "Method Race Wheels Package",
    category: "Wheels",
    services: "Method 305 NV, Nitto Trail Grappler 35\"",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
  },
  {
    title: "2024 Ford Bronco Raptor",
    category: "SUVs",
    services: "King Coilovers, Warn Bumper, Rigid Lights",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
  },
  {
    title: "2023 Chevy Silverado Trail Boss",
    category: "Trucks",
    services: "Fox 2.5 Factory Race, Fuel Rebel 20\", Borla ATAK",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
  },
  {
    title: "2024 Jeep Gladiator Mojave",
    category: "Jeeps",
    services: "AEV 3.5\" Lift, BFG KM3, ARB Rear Bumper",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
  },
];

export function GalleryContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filtered =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  const lightboxImages = filtered.map((item) => ({
    src: item.image,
    alt: item.title,
  }));

  return (
    <section className="pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[#077BFF] text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Before/After */}
        <div className="mb-16">
          <div className="text-center mb-4">
            <h3 className="font-heading text-xl font-bold">Before &amp; After</h3>
            <span className="text-xs text-gray-400">Drag to compare</span>
          </div>
          <div className="max-w-3xl mx-auto">
            <BeforeAfterSlider
              beforeSrc="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80"
              afterSrc="https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80"
              beforeAlt="Stock truck"
              afterAlt="After lift kit installation"
              className="aspect-[16/9]"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.title}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="break-inside-avoid group cursor-pointer"
                onClick={() => {
                  setLightboxIndex(i);
                  setLightboxOpen(true);
                }}
              >
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="font-heading text-sm font-bold text-white">
                        {item.title}
                      </h4>
                      <p className="text-white/70 text-xs mt-1">
                        {item.services}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Lightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}
