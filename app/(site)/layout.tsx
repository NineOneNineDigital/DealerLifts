import { TawkWidget } from "@/components/chat/TawkWidget";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { VehicleBanner } from "@/components/store/VehicleBanner";
import { VehicleProvider } from "@/lib/vehicle/VehicleProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VehicleProvider>
      <Navbar />
      <VehicleBanner />
      <main>{children}</main>
      <Footer />
      <TawkWidget />
    </VehicleProvider>
  );
}
