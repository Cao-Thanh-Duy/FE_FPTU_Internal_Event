import React from 'react';
import '../assets/css/Footer.css';
import fptLogo from '../assets/images/Logo_FPT.svg';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <img src={fptLogo} alt="FPT Logo" className="footer-logo-img" />
            <h3>FPTU Internal Event</h3>
          </div>
          <p className="footer-description">
            Hệ thống đăng ký và quản lý sự kiện nội bộ FPT University
          </p>
        </div>

        <div className="footer-section">
          <h4>Liên kết nhanh</h4>
          <ul className="footer-links">
            <li><a href="#home">Trang chủ</a></li>
           
          </ul>
        </div>

        <div className="footer-section">
          <h4>Thông tin liên hệ</h4>
          <ul className="footer-info">
            <li>📧 Email: support@fptu.edu.vn</li>
           
          </ul>
        </div>

        <div className="footer-section">
          <h4>Theo dõi chúng tôi</h4>
          <div className="social-links">
            <a href="#" className="social-link">Facebook</a>
            <a href="#" className="social-link">LinkedIn</a>
         
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 FPTU Internal Event. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
