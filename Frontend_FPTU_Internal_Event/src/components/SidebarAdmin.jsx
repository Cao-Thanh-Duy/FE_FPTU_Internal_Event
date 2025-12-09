import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaTh, FaInbox, FaUsers, FaBox, FaSignInAlt, FaUserPlus, FaCrown, FaBook, FaLightbulb, FaQuestionCircle, FaUser } from 'react-icons/fa';
import { logout, getUserInfo } from '../utils/auth';
import { toast } from 'react-toastify';
import '../assets/css/SidebarAdmin.css';
import fptLogo from "../assets/images/Logo_FPT.svg"; 

const SidebarAdmin = () => {
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
        <div className="sidebar-admin">
            <div className="sidebar-header">
                <div className="logo">  
                        <img src={fptLogo} alt="FPT Logo" className="logo" />
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-nav-content">
                <ul className="menu-list">
                    <li>
                        <Link to="/admin/dashboard" className={`menu-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
                            <FaTachometerAlt className="menu-icon" />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/calendar" className={`menu-item ${location.pathname === '/admin/calendar' ? 'active' : ''}`}>
                            <FaTh className="menu-icon" />
                            <span>Event</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/users" className={`menu-item ${location.pathname === '/admin/users' ? 'active' : ''}`}>
                            <FaUsers className="menu-icon" />
                            <span>User</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/venues" className={`menu-item ${location.pathname === '/admin/venues' ? 'active' : ''}`}>
                            <FaInbox className="menu-icon" />
                            <span>Venue</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/tables" className={`menu-item ${location.pathname === '/admin/tables' ? 'active' : ''}`}>
                            <FaBox className="menu-icon" />
                            <span>Slot</span>
                        </Link>
                    </li>
                   
                </ul>

                <div className="menu-divider"></div>

                <ul className="menu-list">
                    <li>
                        <button onClick={handleBackHomePage} className="menu-item">
                            <FaSignInAlt className="menu-icon" />
                            <span>Home Page</span>
                        </button>
                    </li>


                    <li>
                        <button onClick={handleLogout} className="menu-item">
                            <FaSignInAlt className="menu-icon" />
                            <span>Sign In</span>
                        </button>
                    </li>
                    
                </ul>

                <div className="menu-divider"></div>
                </div>

               {/* UserInfor */}
               <div className="user-info">
                <FaUser className="user-icon" />
                <span className="user-name">{userInfo.userName}</span>
                <span className="user-role">({userInfo.roleName})</span>
              </div>

               
            </nav>
        </div>
    );
};

export default SidebarAdmin;