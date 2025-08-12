"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  QrCode,
  Utensils,
  Sandwich,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data for teams and navigation (keeping static for now)
const staticData = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Menu Items",
      url: "/dashboard/menu",
      icon: Utensils,
      items: [
        { title: "All Items", url: "/dashboard/menu" },
        { title: "Add Item", url: "/dashboard/menu/add" },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: Sandwich,
      items: [
        { title: "Pending Orders", url: "/dashboard/orders/pending" },
        { title: "All Orders", url: "/dashboard/orders" },
        { title: "Completed Orders", url: "/dashboard/orders/completed" },
      ],
    },
    {
      title: "QR",
      url: "/dashboard/generate-qr",
      icon: QrCode,
      items: [{ title: "Generate QR", url: "dashboard/generate-qr" }],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      items: [
        { title: "General", url: "/dashboard/settings/general" },
        { title: "Team", url: "/dashboard/settings/team" },
        { title: "Billing", url: "/dashboard/settings/billing" },
        { title: "Limits", url: "/dashboard/settings/limits" },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const { data: session } = useSession();

  // Create real user data from session with cafe-first approach
  const realUserData = session?.user ? {
    // Primary display shows cafe name prominently
    cafeName: session.user.cafeName || "My Cafe",
    // Owner name as secondary information
    ownerName: session.user.name || "Owner",
    // Email for contact purposes
    email: session.user.email || "",
    // Use cafe logo if available, otherwise fallback to user image or cafe icon
    avatar: session.user.cafeLogo || session.user.image || "/cafe-default.png",
    // Additional metadata (like subscription plan)
    plan: session.user.plan || "Basic Plan"
  } : null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={staticData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavProjects projects={staticData.projects} />
      </SidebarContent>
      <SidebarFooter>
        {realUserData ? (
          <NavUser 
            user={{
              // Main display shows cafe name
              name: realUserData.cafeName,
              // Secondary line shows "Owner: [Name]"
              secondary: `Owner: ${realUserData.ownerName}`,
              // Tertiary could show plan status
              tertiary: realUserData.plan,
              avatar: realUserData.avatar,
              // Include email in metadata
              email: realUserData.email
            }}
          />
        ) : (
          <div className="p-4 text-sm text-muted-foreground">
            Loading cafe information...
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}