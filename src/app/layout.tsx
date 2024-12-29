import type { Metadata } from "next";
import './globals.css';
import SiteNavbar from "../components/SiteNavbar"; // Adjust the path as needed

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Tobie Rathbun | Developer",
  description: "Full Stack Developer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Include the SiteNavbar above the children */}
        <SiteNavbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
