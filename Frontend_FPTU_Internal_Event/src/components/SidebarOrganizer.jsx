import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaMicrophone, FaUser, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { logout, getUserInfo } from '../utils/auth';
import { toast } from 'react-toastify';
import '../assets/css/SidebarOrganizer.css';
import fptLogo from "../assets/images/Logo_FPT.svg"; 

const SidebarOrganizer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = getUserInfo();

    const handleLogout = () => {
        logout();
        toast.success('Signed out successfully!', {
            position: "top-right",
            autoClose: 2000,
        });
        navigate('/login');
    };

    const handleBackHomePage = () => {
        navigate('/');
    };

    return (
        <div className="sidebar-organizer">
            <div className="sidebar-header">
                <div className="logo">  
                    <img src={fptLogo} alt="FPT Logo" className="logo" />
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-nav-content">
                    <ul className="menu-list">
                        <li>
                            <Link to="/organizer/events" className={`menu-item ${location.pathname === '/organizer/events' || location.pathname === '/organizer/create-event' ? 'active' : ''}`}>
                                <FaCalendarAlt className="menu-icon" />
                                <span>Event Management</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/organizer/speakers" className={`menu-item ${location.pathname === '/organizer/speakers' ? 'active' : ''}`}>
                                <FaMicrophone className="menu-icon" />
                                <span>Speaker Management</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/organizer/profile" className={`menu-item ${location.pathname === '/organizer/profile' ? 'active' : ''}`}>
                                <FaUser className="menu-icon" />
                                <span>Profile</span>
                            </Link>
                        </li>
                    </ul>

                    <div className="menu-divider"></div>

                    <ul className="menu-list">
                        <li>
                            <button onClick={handleBackHomePage} className="menu-item">
                                <FaHome className="menu-icon" />
                                <span>Home Page</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="menu-item">
                                <FaSignOutAlt className="menu-icon" />
                                <span>Sign Out</span>
                            </button>
                        </li>
                    </ul>

                    <div className="menu-divider"></div>
                </div>

                {/* User Info */}
                <div className="user-info">
                    <FaUser className="user-icon" />
                    <span className="user-name">{userInfo.userName}</span>
                    <span className="user-role">({userInfo.roleName})</span>
                </div>
            </nav>
        </div>
    );
};

export default SidebarOrganizer;
