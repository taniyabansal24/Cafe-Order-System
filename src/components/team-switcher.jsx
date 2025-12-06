"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Coffee } from "lucide-react";
import { gsap } from "gsap";
import { useRef, useEffect } from "react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function TeamSwitcher({ teams }) {
  const { isMobile } = useSidebar();
  const logoRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initial state - elements start hidden
    gsap.set(logoRef.current, {
      scale: 0,
      opacity: 0,
    });

    gsap.set(textRef.current, {
      opacity: 0,
      x: -10,
    });

    // Animation sequence
    tl.to(logoRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.7)",
    })
    .to(
      textRef.current,
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: "power2.out",
      },
      "-=0.3"
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground relative h-16 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center space-x-3 w-full">
                {/* Logo Container - Exact same as navigation */}
                <div
                  ref={logoRef}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"
                >
                  <Coffee className="h-6 w-6 text-white dark:invert" />
                </div>

                {/* Text Container - Exact same gradient text */}
                <div
                  ref={textRef}
                  className="flex flex-col items-start text-left"
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    CafeFlow
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Smart Cafe Management
                  </span>
                </div>
              </div>

              {!isMobile && (
                <ChevronsUpDown className="ml-auto size-4" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            className="w-64"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              My Cafes
            </DropdownMenuLabel>
            {teams?.map((team, index) => (
              <DropdownMenuItem key={index} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm bg-primary/10">
                  <Coffee className="size-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{team.label}</span>
                  {team.subLabel && (
                    <span className="text-xs text-muted-foreground">
                      {team.subLabel}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Link href="/dashboard/add-cafe">
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border border-dashed border-primary">
                  <Plus className="size-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-primary">Add Cafe</span>
                  <span className="text-xs text-muted-foreground">
                    Create new cafe profile
                  </span>
                </div>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}