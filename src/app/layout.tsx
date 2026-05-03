import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fincra Perú — Información Inmobiliaria Real y Transparente",
  description:
    "Plataforma inmobiliaria peruana con fichas técnicas honestas, Trust Score de verificación legal, comparador de propiedades y calculadora de cierre. Sin publicidad engañosa. Solo datos duros. Ica y Lima.",
  keywords: [
    "inmuebles Perú",
    "terrenos Ica",
    "casas Lima",
    "trust score inmobiliario",
    "comparador propiedades",
    "ficha técnica inmobiliaria",
    "propiedades saneadas",
    "terrenos saneados Ica",
    "inversión inmobiliaria Perú",
    "calculadora cierre inmobiliario",
    "precio metro cuadrado Perú",
    "verificación legal inmueble",
  ],
  authors: [{ name: "Fincra Perú" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Fincra Perú — Datos Duros, No Publicidad",
    description:
      "Plataforma inmobiliaria que prioriza la transparencia. Fichas técnicas honestas con Trust Score de verificación legal.",
    siteName: "Fincra Perú",
    type: "website",
    locale: "es_PE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fincra Perú — Información Inmobiliaria Real",
    description:
      "Fichas técnicas honestas, Trust Score de verificación legal, comparador de propiedades.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
