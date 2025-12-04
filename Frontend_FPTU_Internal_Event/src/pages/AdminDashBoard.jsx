import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/AdminDashboard.css";

const AdminDashboard = () => {
    return (
        <div className="dashboard-container">
            <Header />

            {/* Dashboard Header */}
            <section className="dashboard-header">
                
                <p>Quản lý hệ thống sự kiện nội bộ FPT University (Admin)</p>
            </section>

            <Footer />
        </div>
    );
};

export default AdminDashboard;
