"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { gsap } from "gsap";
import { useRef, useEffect } from "react";

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

export function TeamSwitcher({ teams }) {
  const { isMobile } = useSidebar();
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initial state - both start from center
    gsap.set(logoRef.current, {
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      rotation: -180,
      opacity: 0,
    });

    gsap.set(textRef.current, {
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      scale: 0.8,
    });

    // Animation sequence
    tl.to(logoRef.current, {
      opacity: 1,
      scale: 1.5,
      rotation: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    })
    .to(logoRef.current, {
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    })
    .to(logoRef.current, {
      left: "0%",
      xPercent: 0,
      duration: 1,
      ease: "power2.inOut",
    })
    .fromTo(
      textRef.current,
      {
        opacity: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        scale: 1,
        left: "50px", // This should match where the text should end up (next to the logo)
        xPercent: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      },
      "-=0.6"
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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground relative h-16"
            >
              {/* Container for both logo and text */}
              <div className="relative w-full h-full">
                {/* Logo Container */}
                <div
                  ref={logoRef}
                  className="flex aspect-square size-8 items-center justify-center rounded-4xl border-2 border-black bg-gray-100 shadow-md absolute"
                >
                  <img
                    src="/assets/logo.png"
                    alt="Cafe Order Logo"
                    className="size-6"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden size-8 items-center justify-center text-gray-700 font-bold text-lg">
                    ☕
                  </div>
                </div>

                {/* Text Container - separate but in the same parent */}
                <div
                  ref={textRef}
                  className="grid text-left text-sm leading-tight absolute"
                >
                  <span className="truncate font-medium">
                    Cafe Order System
                  </span>
                  <span className="truncate text-xs">
                    Scan & Order
                  </span>
                </div>
              </div>

              
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}