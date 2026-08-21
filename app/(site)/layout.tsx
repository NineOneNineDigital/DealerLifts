import { TawkWidget } from "@/components/chat/TawkWidget";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { NewSiteBanner } from "@/components/layout/NewSiteBanner";
import { getSiteSettings } from "@/lib/content/site-settings";
import { VehicleProvider } from "@/lib/vehicle/VehicleProvider";

export const revalidate = 60;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // cache() dedupes this with any page that also calls getSiteSettings(),
  // so a render performs one Hygraph request rather than one per consumer.
  const settings = await getSiteSettings();

  return (
    <VehicleProvider>
      <NewSiteBanner />
      <div className="flex min-h-screen flex-col pt-10">
        <Navbar phone={settings.phone} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </div>
      <TawkWidget />
    </VehicleProvider>
  );
}
