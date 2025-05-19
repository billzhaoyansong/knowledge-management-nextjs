import type { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bill Zhao Yansong's Knowledge Management Site",
  description: "",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <div className="flex-1 w-full">
            {children}
          </div>
      </body>
    </html>
  );
}
