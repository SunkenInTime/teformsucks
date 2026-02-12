import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Te Form Sucks",
  description: "Minimal Japanese conjugation drills for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" as="audio" href="/sound/correct.mp3" />
        <link rel="preload" as="audio" href="/sound/wrong.mp3" />
        <link rel="preload" as="audio" href="/sound/swipe.mp3" />
      </head>
      <body className={`${ibmPlexSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
