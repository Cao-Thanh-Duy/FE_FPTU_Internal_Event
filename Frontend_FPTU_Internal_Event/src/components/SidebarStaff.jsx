import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaCalendar, FaQrcode, FaSignInAlt, FaUser, FaHome } from 'react-icons/fa';
import { logout, getUserInfo } from '../utils/auth';
import { toast } from 'react-toastify';
import '../assets/css/SidebarStaff.css';
import fptLogo from "../assets/images/Logo_FPT.svg"; 

const SidebarStaff = () => {
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
        <div className="sidebar-staff">
            <div className="sidebar-header">
                <div className="logo">  
                    <img src={fptLogo} alt="FPT Logo" className="logo" />
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-nav-content">
                    <ul className="menu-list">
                        <li>
                            <Link to="/staff/dashboard" className={`menu-item ${location.pathname === '/staff/dashboard' ? 'active' : ''}`}>
                                <FaTachometerAlt className="menu-icon" />
                                <span className="menu-label">Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/staff/events" className={`menu-item ${location.pathname === '/staff/events' ? 'active' : ''}`}>
                                <FaCalendar className="menu-icon" />
                                <span className="menu-label">Manage Events</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/staff/qr-scanner" className={`menu-item ${location.pathname === '/staff/qr-scanner' ? 'active' : ''}`}>
                                <FaQrcode className="menu-icon" />
                                <span className="menu-label">QR Scanner</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/staff/profile" className={`menu-item ${location.pathname === '/staff/profile' ? 'active' : ''}`}>
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
                    {/* <FaUser className="user-icon" /> */}
                    <div>
                        <div className="user-name">{userInfo.userName}</div>
                        <div className="user-role">{userInfo.roleName}</div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default SidebarStaff;
