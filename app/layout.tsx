import type { Metadata, Viewport } from "next";
import { Oxanium, Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/store/cart-context";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dealer Lifts | Premium Automotive Performance & Off-Road Shop",
    template: "%s | Dealer Lifts",
  },
  description:
    "North Carolina's premier automotive performance and off-road shop. Lift kits, suspension, wheels, custom builds, and expert auto repair. 30+ years experience, 100+ five-star reviews.",
  keywords: [
    "lift kits",
    "suspension",
    "off-road",
    "automotive performance",
    "truck accessories",
    "Jeep builds",
    "auto repair",
    "North Carolina",
  ],
  openGraph: {
    title: "Dealer Lifts | Premium Automotive Performance & Off-Road Shop",
    description:
      "North Carolina's premier automotive performance and off-road shop. 30+ years experience.",
    type: "website",
    locale: "en_US",
    siteName: "Dealer Lifts",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#077BFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${oxanium.variable} ${barlow.variable} ${barlowCondensed.variable}`}
    >
      <body className="font-sans antialiased bg-white text-gray-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
