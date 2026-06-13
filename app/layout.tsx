import type { Metadata, Viewport } from "next";
import { PwaRegistration } from "@/app/pwa";
import "./globals.css";

export const metadata: Metadata = {
  title: "TennisTour",
  description: "Organisez et pilotez vos tournées de tennis.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "TennisTour",
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  themeColor: "#0C0C0C",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="dark">
      <body>
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
