import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (allowedRoles.length > 0) {
    const roleName = localStorage.getItem('roleName');
    if (!allowedRoles.includes(roleName)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;