// layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner"
import ThemeWrapper from "@/components/theme-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",  // This matches the CSS variable above
});

export const metadata = {
  title: "Cafe Ordering System",
  description: "QR-based ordering system for your cafe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <ThemeWrapper>
            <div className="relative min-h-screen">
              {children}
            </div>
          </ThemeWrapper>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}