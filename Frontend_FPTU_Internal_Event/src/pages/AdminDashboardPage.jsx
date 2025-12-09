import React from "react";
import "../assets/css/AdminDashboardPage.css";
import SidebarAdmin from "../components/SidebarAdmin";

const AdminDashboardPage = () => {
    return (
        <div className="admin-dashboard">
            <SidebarAdmin />
            
            <div className="dashboard-main">
                <div className="dashboard-content">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome to the admin dashboard. Select a menu item from the sidebar.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
