import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { isAuthenticated, getUserInfo } from '../utils/auth';
import { FaQrcode } from 'react-icons/fa';
import "../assets/css/HomePage.css";

const HomePage = () => {
    const navigate = useNavigate();
    const isLoggedIn = isAuthenticated();
    const userInfo = isLoggedIn ? getUserInfo() : null;
    const isStaff = userInfo?.roleName === 'Staff';
    const isStudent = userInfo?.roleName === 'Student';

    return (
        <div className="homepage-container">
            <Header />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Chào mừng đến với FPTU Internal Event</h1>
                    <p>Hệ thống đăng ký và quản lý sự kiện nội bộ FPT University</p>
                    <div className="hero-buttons">
                        {isLoggedIn && isStaff ? (
                            <>
                                <button className="btn-qr-scanner" onClick={() => navigate('/staff/qr-scanner')}>
                                    <FaQrcode className="qr-icon" /> Quét QR Check-in
                                </button>
                                <button className="btn-primary" onClick={() => navigate('/staff/events')}>
                                    Events
                                </button>
                            </>
                        ) : isLoggedIn && isStudent ? (
                            <>
                                <button className="btn-primary" onClick={() => navigate('/student/events')}>
                                    Xem sự kiện
                                </button>
                                <button className="btn-secondary" onClick={() => navigate('/student/my-tickets')}>
                                    Vé của tôi
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn-primary" onClick={() => navigate('/login')}>
                                    Đăng nhập ngay
                                </button>
                                <button className="btn-secondary" onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}>
                                    Xem sự kiện
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            

            <Footer />
        </div>

        
    )
}

export default HomePage