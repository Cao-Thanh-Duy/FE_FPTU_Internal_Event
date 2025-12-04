import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/HomePage.css";

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="homepage-container">
            <Header />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Chào mừng đến với FPTU Internal Event</h1>
                    <p>Hệ thống đăng ký và quản lý sự kiện nội bộ FPT University</p>
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate('/login')}>
                            Đăng nhập ngay
                        </button>
                        <button className="btn-secondary" onClick={() => document.getElementById('events').scrollIntoView({ behavior: 'smooth' })}>
                            Xem sự kiện
                        </button>
                    </div>
                </div>
            </section>

            

            <Footer />
        </div>

        
    )
}

export default HomePage