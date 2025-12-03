// src/components/theme-wrapper.js
'use client';

import { usePathname } from "next/navigation";
import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";
import { useEffect, useState } from "react";

export default function ThemeWrapper({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Define routes where theme should be available
  const themeRoutes = [
    '/dashboard',
    '/sign-in',
    '/sign-up',
  ];
  
  // Define order-related routes that should NOT have theme
  const orderRoutes = [
    '/order',
    // Add any other order-related routes here
  ];
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check if current route is a theme route
  const isThemeRoute = themeRoutes.some(route => 
    pathname?.startsWith(route)
  );
  
  // Check if current route is an order route
  const isOrderRoute = orderRoutes.some(route => 
    pathname?.startsWith(route)
  );

  if (!mounted) {
    return <div className="light">{children}</div>;
  }

  // For order routes, force light mode without theme provider
  if (isOrderRoute) {
    return <div className="light">{children}</div>;
  }

  // For theme routes, use ThemeProvider
  if (isThemeRoute) {
    return (
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
        disableTransitionOnChange
      >
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </ThemeProvider>
    );
  }

  // For any other routes, default to light mode
  return <div className="light">{children}</div>;
}