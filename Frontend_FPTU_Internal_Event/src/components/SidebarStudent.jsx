import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCalendar, FaTicketAlt, FaUser, FaHome, FaSignInAlt } from 'react-icons/fa';
import { logout, getUserInfo } from '../utils/auth';
import { toast } from 'react-toastify';
import '../assets/css/SidebarStudent.css';
import fptLogo from "../assets/images/Logo_FPT.svg"; 

const SidebarStudent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = getUserInfo();

    const handleLogout = () => {
        logout();
        toast.success('Logout successful!', {
            position: "top-right",
            autoClose: 2000,
        });
        navigate('/login');
    };

    const handleBackHomePage = () => {
        navigate('/');
    };

    return (
        <div className="sidebar-student">
            <div className="sidebar-header">
                <div className="logo">  
                    <img src={fptLogo} alt="FPT Logo" className="logo" />
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-nav-content">
                    <ul className="menu-list">
                        <li>
                            <Link to="/student/events" className={`menu-item ${location.pathname === '/student/events' ? 'active' : ''}`}>
                                <FaCalendar className="menu-icon" />
                                <span className="menu-label">Events</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/student/my-tickets" className={`menu-item ${location.pathname === '/student/my-tickets' ? 'active' : ''}`}>
                                <FaTicketAlt className="menu-icon" />
                                <span className="menu-label">My Tickets</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/student/profile" className={`menu-item ${location.pathname === '/student/profile' ? 'active' : ''}`}>
                                <FaUser className="menu-icon" />
                                <span className="menu-label">Profile</span>
                            </Link>
                        </li>
                    </ul>

                    <div className="menu-divider"></div>

                    <ul className="menu-list">
                        <li>
                            <button onClick={handleBackHomePage} className="menu-item">
                                <FaHome className="menu-icon" />
                                <span className="menu-label">Home</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="menu-item">
                                <FaSignInAlt className="menu-icon" />
                                <span className="menu-label">Logout</span>
                            </button>
                        </li>
                    </ul>

                    <div className="menu-divider"></div>
                </div>

                {/* User Info */}
                <div className="user-info">
                    <FaUser className="user-icon" />
                    <div className="user-details">
                        <div className="user-name">{userInfo.userName || 'Student'}</div>
                        <div className="user-role">{userInfo.roleName || 'Student'}</div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default SidebarStudent;
