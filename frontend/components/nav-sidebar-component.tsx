import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"


import { PanelLeftIcon } from "lucide-react"

const NavSidebarToggle = () => {
  const { toggleSidebar } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={toggleSidebar}
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <span><PanelLeftIcon /></span>
          </div>
          <span className="truncate font-medium">Sidebar Toggle</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
};

export default NavSidebarToggle;

