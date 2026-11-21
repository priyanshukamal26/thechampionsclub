import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Grain } from "@/components/ui/kit";
import PWAProvider from "@/components/pwa/PWAProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Champions Club | Play. Compete. Belong.",
  description:
    "The Champions Club — tennis, padel, badminton and cricket nets in New Delhi. Book courts, join Friday social play, shop pro gear and settle up at the clubhouse bar.",
  applicationName: "The Champions Club",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Champions Club",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#17150f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="min-h-screen bg-paper text-ink">
        <AuthProvider>{children}</AuthProvider>
        <PWAProvider />
        <Grain />
      </body>
    </html>
  );
}
