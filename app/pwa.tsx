"use client";

import Script from "next/script";

export function PwaRegistration() {
  return <Script src="/register-sw.js" strategy="afterInteractive" />;
}
