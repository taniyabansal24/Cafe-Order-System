'use client';

import { usePathname } from "next/navigation";
import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

export default function ThemeWrapper({ children }) {
  const pathname = usePathname();
  
  // Define routes where dark mode should be available
  const themeRoutes = [
    '/dashboard',
    '/signin',
    '/signup',
    // Add other dashboard-related routes here
  ];
  
  const shouldApplyTheme = themeRoutes.some(route => 
    pathname?.startsWith(route)
  );

  if (shouldApplyTheme) {
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

  // For non-theme routes, render children without theme provider
  return <>{children}</>;
}