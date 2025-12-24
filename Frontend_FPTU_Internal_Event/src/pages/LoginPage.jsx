import { FcGoogle } from 'react-icons/fc'; 
import { SiEventstore } from "react-icons/si";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import "../assets/css/LoginPage.css";
import fptLogo from "../assets/images/Logo_FPT.svg"; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle normal email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://localhost:7047/api/Auth/login', {
        email: email,
        password: password
      });

      // response.data format mới:
      // { success: true/false, message: "", data: { ...user } }
      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }

      const user = response.data.data;

      // Save data
      localStorage.setItem('token', user.token);
      localStorage.setItem('userId', user.userId);
      localStorage.setItem('userName', user.userName);
      localStorage.setItem('email', user.email);
      localStorage.setItem('roleName', user.roleName);
      localStorage.setItem('expiresAt', user.expiresAt);

      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;

      toast.success(`Welcome ${user.userName}! Login successfully.`, {
        position: "top-right",
        autoClose: 2000
      });

      // Redirect based on role
      setTimeout(() => {
        const role = user.roleName;
        if (role === 'Admin') {
          navigate('/admin/dashboard');
        } else if (role === 'Staff') {
          navigate('/');
        } else if (role === 'Organizer') {
          navigate('/');
        } else if (role === 'Student') {
          navigate('/');
        } else {
          navigate('/');
        }
      }, 2000);

    } catch (err) {
      console.log("Error from API:", err);
      console.log("Error response:", err.response);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your email and password.";

      setError(errorMessage);

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000
      });

      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://localhost:7047/api/Auth/google-login', {
        idToken: credentialResponse.credential
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Google login failed");
      }

      const user = response.data.data;

      // Save data
      localStorage.setItem('token', user.token);
      localStorage.setItem('userId', user.userId);
      localStorage.setItem('userName', user.userName);
      localStorage.setItem('email', user.email);
      localStorage.setItem('roleName', user.roleName);
      localStorage.setItem('expiresAt', user.expiresAt);

      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;

      toast.success(`Welcome ${user.userName}! Login successfully with Google.`, {
        position: "top-right",
        autoClose: 2000
      });

      // Redirect based on role
      setTimeout(() => {
        const role = user.roleName;
        if (role === 'Admin') {
          navigate('/admin/dashboard');
        } else if (role === 'Staff') {
          navigate('/');
        } else if (role === 'Organizer') {
          navigate('/');
        } else if (role === 'Student') {
          navigate('/');
        } else {
          navigate('/');
        }
      }, 2000);

    } catch (err) {
      console.log("Google login error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Google login failed. Please make sure your email is authorized.";

      setError(errorMessage);

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000
      });

      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error('Google login failed. Please try again.', {
      position: "top-right",
      autoClose: 3000
    });
  };

  return (
    <div className="container">
      <div className="login-box">

        <div className="left-col">
          <div className="header-login">
            <img src={fptLogo} alt="FPT Logo" className="logo" />
            <h2>Internal Event</h2>
          </div>

          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

            <button type="submit" className="btn-orange" disabled={loading}>
              {loading ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          <a href="#" className="link">Lost password?</a>
        </div>

        <div className="divider"></div>

        <div className="right-col">
          <div className="right-title">
            <p>FPTU Internal Event Registration & Ticketing System</p>
          </div>

          <div className="divider-text">Login with Gmail</div>

          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              type="standard"
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
