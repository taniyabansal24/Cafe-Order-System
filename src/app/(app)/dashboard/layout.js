// app/dashboard/layout.js
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <DashboardProvider>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        }}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              
              {/* Mobile Breadcrumb */}
              <div className="md:hidden flex-1 min-w-0">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                    <span className="truncate">
                      {pathSegments.length > 1 
                        ? pathSegments[pathSegments.length - 1]
                            .split('-')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                        : 'Dashboard'
                      }
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {pathSegments.map((segment, index) => {
                      const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                      const label = segment
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                      
                      return (
                        <DropdownMenuItem key={index} asChild>
                          <BreadcrumbLink href={href} className="flex items-center gap-2">
                            {label}
                          </BreadcrumbLink>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Breadcrumb */}
              <Breadcrumb className="hidden md:block">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>

                  {pathSegments.slice(1).map((segment, index) => {
                    const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
                    const isLast = index === pathSegments.length - 2;
                    const label = segment
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');

                    return (
                      <span key={index} className="flex items-center">
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage>{label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </span>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  );
}