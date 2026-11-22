import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSideBar } from "../component/DashboardSIdeBar";
import Navbar from "../components/Navbar";

// Tin dashboard (customer, owner, admin) shobar layout eta
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      {/* Bame sidebar */}
      <DashboardSideBar />

      {/* Dane: upore navbar, tar niche page er content */}
      <SidebarInset className="min-h-screen bg-[#F3EEE3]">
        <Navbar inDashboard leading={<SidebarTrigger />} />

        <div className="w-full px-4 pb-8 md:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}