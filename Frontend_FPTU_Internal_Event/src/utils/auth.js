import axios from 'axios';

// Kiểm tra xem user đã đăng nhập chưa
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const expiresAt = localStorage.getItem('expiresAt');
  
  if (!token || !expiresAt) {
    return false;
  }
  
  // Kiểm tra token có hết hạn chưa
  const isExpired = new Date(expiresAt) < new Date();
  if (isExpired) {
    logout();
    return false;
  }
  
  return true;
};

// Lấy thông tin user từ localStorage
export const getUserInfo = () => {
  return {
    userId: localStorage.getItem('userId'),
    userName: localStorage.getItem('userName'),
    email: localStorage.getItem('email'),
    roleName: localStorage.getItem('roleName'),
    token: localStorage.getItem('token')
  };
};

// Đăng xuất
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('email');
  localStorage.removeItem('roleName');
  localStorage.removeItem('expiresAt');
  delete axios.defaults.headers.common['Authorization'];
};

// Thiết lập token cho axios
export const setupAxiosInterceptors = () => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Interceptor để tự động logout khi token hết hạn
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
    // KHÔNG redirect khi đang ở trang login
    if (!window.location.pathname.includes('/login')) {
        logout();
        window.location.href = '/login';
    }
}
      return Promise.reject(error);
    }
  );
};