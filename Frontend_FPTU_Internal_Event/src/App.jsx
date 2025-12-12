import React, { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboardPage";
import AdminUserPage from "./pages/AdminUserPage";
import AdminSlotPage from "./pages/AdminSlotPage";
import AdminEventPage from "./pages/AdminEventPage";
import OrganizerEventPage from "./pages/OrganizerEventPage";
import OrganizerSpeakerPage from "./pages/OrganizerSpeakerPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import StaffEventPage from "./pages/StaffEventPage";
import QRScannerPage from "./pages/QRScannerPage";
import StudentEventPage from "./pages/StudentEventPage";
import StudentTicketsPage from "./pages/StudentTicketsPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { setupAxiosInterceptors } from './utils/auth';
import AdminVenuePage from "./pages/AdminVenuePage";

function App() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);
  
  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminUserPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/venues" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminVenuePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/slots" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminSlotPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/events" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminEventPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/organizer/events" 
          element={
            <ProtectedRoute allowedRoles={['Organizer']}>
              <OrganizerEventPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/organizer/speakers" 
          element={
            <ProtectedRoute allowedRoles={['Organizer']}>
              <OrganizerSpeakerPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/staff/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffDashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/staff/events" 
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffEventPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/staff/qr-scanner" 
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <QRScannerPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/events" 
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentEventPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/my-tickets" 
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentTicketsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/profile" 
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentProfilePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>

    
    
    
    
  )
}

export default App