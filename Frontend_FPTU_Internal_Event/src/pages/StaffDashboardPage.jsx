import React from "react";
import "../assets/css/StaffDashboardPage.css";
import SidebarStaff from "../components/SidebarStaff";

const StaffDashboardPage = () => {
    return (
        <div className="staff-dashboard">
            <SidebarStaff />
            
            <div className="dashboard-main">
                <div className="dashboard-content">
                    <h1>Staff Dashboard</h1>
                    <p>Chào mừng đến với trang quản lý dành cho nhân viên. Chọn mục từ menu bên trái.</p>
                    
                    <div className="dashboard-cards">
                        <div className="dashboard-card">
                            <div className="card-icon events-icon">📅</div>
                            <div className="card-content">
                                <h3>Quản lý Events</h3>
                                <p>Xem và quản lý các sự kiện được phân công</p>
                            </div>
                        </div>
                        
                        <div className="dashboard-card">
                            <div className="card-icon qr-icon">📱</div>
                            <div className="card-content">
                                <h3>Quét QR Check-in</h3>
                                <p>Quét mã QR để check-in người tham gia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboardPage;
