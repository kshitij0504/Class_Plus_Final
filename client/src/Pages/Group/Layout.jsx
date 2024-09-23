import React from "react";
import { Outlet } from "react-router-dom";
import SidebarComponent from "./SidebarComponent"; // Import the Sidebar

const Layout = () => {
  const { id } = useParams(); // Assuming 'id' is used in the sidebar

  return (
    <div className="flex min-h-screen">
      <SidebarComponent id={id} />

      <div className="flex-1 bg-gray-900 text-white p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
