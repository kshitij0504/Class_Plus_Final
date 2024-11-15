import React from "react";
import Sidebar, { SidebarItem } from "../Components/Sidebar";
import {
  Calendar,
  Home as Home1,
  MessageCircle,
  Presentation,
} from "lucide-react";
import { RxUpdate } from "react-icons/rx";
import { Outlet } from "react-router-dom";
import { IoChatbubblesOutline } from "react-icons/io5";
import { IoIosNotificationsOutline } from "react-icons/io";
const LayoutwithSidebar = () => {
  return (
    <div className="flex bg-gray-900 text-white">
      <Sidebar>
        <SidebarItem icon={<Home1 size={20} />} text="Home" to="/home" />
        <SidebarItem
          icon={<MessageCircle size={20} />}
          text="Group"
          to="/displaygroups"
        />
        <SidebarItem
          icon={<Presentation size={20} />}
          text="Meeting"
          to="/meeting"
        />
        <SidebarItem
          icon={<RxUpdate size={20} />}
          text="Update Profile"
          to="/updateprofile"
        />
        <SidebarItem
          icon={<Calendar size={20} />}
          text="Schedule"
          to="/session"
        />
        <SidebarItem
          icon={<IoIosNotificationsOutline size={20} />}
          text="Notification"
          to="/notification"
        />
        <SidebarItem
          icon={<IoChatbubblesOutline size={20} />}
          text="Chat"
          to="/chat"
        />
      </Sidebar>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutwithSidebar;
