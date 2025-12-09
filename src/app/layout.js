import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner"
import ThemeWrapper from "@/components/theme-wrapper";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cafe Ordering System",
  description: "QR-based ordering system for your cafe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
     <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
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