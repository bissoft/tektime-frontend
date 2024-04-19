import React from "react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

function Base(props) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="dashboard-container">
      <div
        className="sidebar-container"
        style={{
          display:
            window.location.href.includes("/ContractLinkEnterprises") ||
            window.location.href.includes("/ContractToTeam") ||
            window.location.href.includes("/ContractToUser") ||
            window.location.href.includes("/EntreprisesToTeam") ||
            window.location.href.includes("/EntreprisesToUsers") ||
            window.location.href.includes("/view") ||
            window.location.href.includes("/PlayMeeting") ||
            window.location.href.includes("/play") ||
            window.location.href.includes("/users") ||
            window.location.href.includes("/ModifierUser") ||
            window.location.href.includes("/updateMeeting") ||
            window.location.href.includes("/copyMeeting") ||
            window.location.href.includes("/participantToAction")
              ? "none"
              : "block",
        }}
      >
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isAuthenticated={props.isAuthenticated}
          onLogin={props.onLogin}
          onLogout={props.onLogout}
          onRemove={props.onRemove}
        />
      </div>
      <div
        className={`main-content ${isSidebarOpen ? "" : "closed-sidebar"} ${
          window?.location?.href?.includes("/ContractLinkEnterprises") ||
          window?.location?.href?.includes("/ContractToTeam") ||
          window?.location?.href?.includes("/ContractToUser") ||
          window?.location?.href?.includes("/EntreprisesToTeam") ||
          window?.location?.href?.includes("/EntreprisesToUsers") ||
          window?.location?.href?.includes("/play") ||
          window?.location?.href?.includes("/PlayMeeting") ||
          window.location.href.includes("/view") ||
          window.location.href.includes("/users") ||
          window.location.href.includes("/ModifierUser") ||
          window.location.href.includes("/updateMeeting") ||
          window.location.href.includes("/copyMeeting") ||
          window.location.href.includes("/participantToAction") 
            ? "mr-link"
            : "mr-0"
        }`}
      >
        <Header
          onLogout={props.onLogout}
          isAuthenticated={props.isAuthenticated}
          onLogin={props.onLogin}
          onRemove={props.onRemove}
        />
        <Outlet />
      </div>
    </div>
  );
}

export default Base;
