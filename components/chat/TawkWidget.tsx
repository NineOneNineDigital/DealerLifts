"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

declare global {
  interface Window {
    Tawk_API?: {
      visitor?: { name?: string; email?: string };
      setAttributes?: (
        attrs: Record<string, string>,
        callback?: (error?: unknown) => void,
      ) => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

export function TawkWidget() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  // Pre-fill visitor identity before the widget loads. Tawk reads
  // window.Tawk_API.visitor on init, so this must be set ahead of the
  // embed script. setAttributes is for *custom* attributes defined in
  // the Tawk dashboard — using it for name/email triggers a socket
  // callback that never acks ("Socket server did not execute the
  // callback for setAttributes").
  useEffect(() => {
    if (!isLoaded || isAdminRoute) return;

    const name =
      user?.fullName ||
      user?.firstName ||
      user?.primaryEmailAddress?.emailAddress;
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!name && !email) return;

    window.Tawk_API = window.Tawk_API ?? {};
    window.Tawk_API.visitor = {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
    };
  }, [isLoaded, isAdminRoute, user]);

  if (isAdminRoute) return null;
  if (!PROPERTY_ID || !WIDGET_ID) return null;

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: official tawk.to embed snippet
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
          (function(){
            var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1, s0);
          })();
        `,
      }}
    />
  );
}
