import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { isAuthenticated, getUserInfo, logout } from '../utils/auth';
import { toast } from 'react-toastify';
import "../assets/css/Header.css"
import fptLogo from '../assets/images/Logo_FPT.svg';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();
  const userInfo = isLoggedIn ? getUserInfo() : null;
  const isAdmin = userInfo?.roleName === 'Admin';
  const isOrganizer = userInfo?.roleName === 'Organizer';
  const isStaff = userInfo?.roleName === 'Staff';
  const isStudent = userInfo?.roleName === 'Student';

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully!', {
      position: "top-right",
      autoClose: 2000,
    });
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img src={fptLogo} alt="FPT Logo" className="logo-img" />
          <span className="header-title">FPTU Internal Event</span>
        </Link>
        
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to={isOrganizer ? "/organizer/events" : isStudent ? "/student/events" : "/events"} className="nav-link">Events</Link>
          <Link to="/about" className="nav-link">About</Link>
          
          {/* Nếu role = Admin */}
          {isLoggedIn && isAdmin && (
            <Link to="/admin/dashboard" className="nav-link dashboard-link">
            Dashboard
            </Link>
          )}
          
          {/* Nếu role = Organizer */}
          {isLoggedIn && isOrganizer && (
            <>
              <Link to="/organizer/speakers" className="nav-link speakers-link">
                Speakers
              </Link>
            </>
          )}
          
          {/* Nếu role = Staff */}
          {isLoggedIn && isStaff && (
            <Link to="/staff/dashboard" className="nav-link staff-link">
            Dashboard
            </Link>
          )}
          
          {isLoggedIn ? (
            <div className="user-menu">
              <div className="user-info">
                <FaUser className="user-icon" />
                <span className="user-name">{userInfo.userName}</span>
                <span className="user-role">({userInfo.roleName})</span>
              </div>
              <button onClick={handleLogout} className="btn-logout">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;