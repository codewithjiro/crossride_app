import "~/styles/globals.css";

import { type Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

export const metadata: Metadata = {
  title: "CrossRide | Holy Cross College",
  description:
    "CrossRide is a modern school transport scheduling platform for Holy Cross College.",
  icons: [{ rel: "icon", url: "/images/logohcc-150x150.png" }],
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable} data-scroll-behavior="smooth">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
