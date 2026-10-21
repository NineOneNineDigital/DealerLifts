import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Oxanium } from "next/font/google";
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
      className={`${oxanium.variable} ${barlow.variable} ${barlowCondensed.variable}`}
      lang="en"
    >
      <head>
        {/* Google Tag Manager */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Google Tag Manager snippet provided for this site
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KBRQFZTM');`,
          }}
        />
      </head>
      <body className="bg-white font-sans text-gray-900 antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          {/* biome-ignore lint/a11y/useIframeTitle assist/source/useSortedAttributes: preserve supplied Google Tag Manager snippet */}
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KBRQFZTM"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
