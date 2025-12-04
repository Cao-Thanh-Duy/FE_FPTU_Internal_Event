
import { FcGoogle } from 'react-icons/fc'; 
import "../assets/css/LoginPage.css";
import fptLogo from '../assets/images/Logo_FPT.svg'; 


const LoginPage = () => {
  return (
    <div className="container">
      <div className="login-box">
   
        
        <div className="left-col">
          <div className="header">
            <img 
              src={fptLogo} 
              alt="FPT Logo" 
              className="logo" 
            />
            <h2>Internal Event</h2>
          </div>

          <form>
            <input type="text" placeholder="Email (FPTU)" className="input-field" />
            <input type="password" placeholder="Password" className="input-field" />
            <button className="btn-orange">Log in</button>
          </form>

          <a href="#" className="link">Lost password?</a>
        </div>

      
        <div className="divider"></div>

    
        <div className="right-col">

        <div className="right-title">
             <p>FPTU Internal Event Registration & Ticketing System</p>  
       </div>
         

            <button className="btn-google">
        
              <FcGoogle size={24} style={{ marginRight: '10px' }} />
              
              <span>@fpt.edu.vn (Internal FPTU Only)</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;