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
      </body>
    </html>
  );
}
