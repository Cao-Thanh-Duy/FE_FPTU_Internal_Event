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
            Registration and management system for FPT University internal events
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
           
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Information</h4>
          <ul className="footer-info">
            <li>📧 Email: support@fptu.edu.vn</li>
           
          </ul>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
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
