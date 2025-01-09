import React, { Suspense } from "react";
import './globals.css';
import SiteNavbar from "../components/SiteNavbar"; // Adjust the path as needed
import AnimatedBackground from "@/components/AnimatedBackground";


export const metadata = {
  title: "Tobie | Projects",
  description: "Full Stack Developer Examples",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Animated Background as a Client Component */}
        <Suspense fallback={<div>Loading Background...</div>}>
          <AnimatedBackground />
        </Suspense>

        {/* Main container for stacking context */}
        <div className="layout-wrapper">
          {/* Include the SiteNavbar above the children */}
          <div className="navbar-wrapper">
            <Suspense fallback={<div>Loading Navbar...</div>}>
              <SiteNavbar />
            </Suspense>
          </div>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
