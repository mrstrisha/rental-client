import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { DashboardSideBar } from "../component/DashboardSIdeBar"



const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
   <SidebarProvider>
   <DashboardSideBar></DashboardSideBar>
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}

export default Layout;