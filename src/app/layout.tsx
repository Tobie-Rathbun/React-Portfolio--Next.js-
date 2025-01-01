import React, { Suspense } from "react";
import './globals.css';
import SiteNavbar from "../components/SiteNavbar"; // Adjust the path as needed
import AnimatedBackground from "@/components/AnimatedBackground";


export const metadata = {
  title: "Tobie Rathbun | Developer",
  description: "Full Stack Developer Portfolio",
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
        <AnimatedBackground />

        {/* Main container for stacking context */}
        <div className="layout-wrapper">
          {/* Include the SiteNavbar above the children */}
          <div className="navbar-wrapper">
            <Suspense fallback={<div>Loading Navbar...</div>}>
              <SiteNavbar />
            </Suspense>
          </div>
          <main>{children}</main>

          {/* Hidden Static Form for Netlify Detection */}
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            hidden
          >
            <input type="hidden" name="form-name" value="contact" />
            <input type="text" name="name" />
            <input type="email" name="email" />
            <textarea name="message"></textarea>
          </form>
        </div>
      </body>
    </html>
  );
}
