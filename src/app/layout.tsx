import type { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NavBar from "./components/nav-bar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const isActive = (path: string) => {

    const currentPath = new URL(window.location.href).pathname

    console.log(currentPath)
    return currentPath === path ? 'text-white' : 'text-gray-400';
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
      >
        <div className={`flex flex-row ${quicksand.className}  h-screen`}>

          {/* leftside navbar */}
          <div className="flex-initial h-full">
            <NavBar />
          </div>

          {/* rightside content */}
          <div className="flex-1 w-64 overflow-y-scroll">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
