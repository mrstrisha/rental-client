
"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  
  SidebarGroupContent,
 
SidebarHeader,
SidebarMenu,
SidebarMenuButton,
SidebarMenuItem,
 
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
type MenuItem = {
  name: string;
  url: string;
icon: LucideIcon;
};

type UserRole = "customer" | "admin" | "owner";

const menuItemsbyRole: Record<UserRole, MenuItem[]> ={
    customer:[

    ],
    admin:[

    ],
    owner:[

    ],
}
export function DashboardSideBar() {
  const { data: session, isPending } = authClient.useSession();
     const role = session?.user?.role as UserRole | undefined;

const menuItems = role ? menuItemsbyRole[role] : [];
  return (
    <Sidebar>
      <SidebarHeader >
          <p>Name: {session?.user?.name}</p>
    <p>Email: {session?.user?.email}</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
        <SidebarGroup>
 <SidebarMenu>
  {menuItems.map((item: MenuItem)=> (
    <SidebarMenuItem key={item.name}>
      <SidebarMenuButton render={<a href={item.url} />}>
        <item.icon />
        <span>{item.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))}
</SidebarMenu>
  <SidebarGroupContent></SidebarGroupContent>
</SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}