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
    const isOrganizer = userInfo?.roleName === 'Organizer';
    const isAdmin = userInfo?.roleName === 'Admin';

    return (
        <div className="homepage-container">
            <Header />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Welcome to FPTU Internal Event</h1>
                    <p>Registration and management system for FPT University internal events</p>
                    <div className="hero-buttons">
                        {isLoggedIn && isStaff ? (
                            <>
                                <button className="btn-qr-scanner" onClick={() => navigate('/staff/qr-scanner')}>
                                    <FaQrcode className="qr-icon" /> Scan QR Check-in
                                </button>
                                <button className="btn-primary" onClick={() => navigate('/staff/events')}>
                                    Events
                                </button>
                            </>
                        ) : isLoggedIn && isStudent ? (
                            <>
                                <button className="btn-primary" onClick={() => navigate('/student/events')}>
                                    View Events
                                </button>
                                <button className="btn-secondary" onClick={() => navigate('/student/my-tickets')}>
                                    My Tickets
                                </button>
                            </>
                        ) : isLoggedIn && isOrganizer ? (
                            <button className="btn-primary" onClick={() => navigate('/organizer/events')}>
                                Manage Events
                            </button>
                        ) : isLoggedIn && isAdmin ? (
                            <button className="btn-primary" onClick={() => navigate('/admin/dashboard')}>
                                Go to Admin Dashboard
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={() => navigate('/login')}>
                                Login Now
                            </button>
                        )}
                    </div>
                </div>
            </section>

            

            <Footer />
        </div>

        
    )
}

export default HomePage