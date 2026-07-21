import { TawkWidget } from "@/components/chat/TawkWidget";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { NewSiteBanner } from "@/components/layout/NewSiteBanner";
import { VehicleProvider } from "@/lib/vehicle/VehicleProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VehicleProvider>
      <NewSiteBanner />
      <div className="flex min-h-screen flex-col pt-10">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <TawkWidget />
    </VehicleProvider>
  );
}
