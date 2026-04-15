import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './auth/Login';
import ForgotPasswordEmail from './auth/ForgotPasswordEmail';
import ForgotPasswordOTP from './auth/ForgotPasswordOTP';
import ForgotPasswordNewPassword from './auth/ForgotPasswordNewPassword';
import ForgotPasswordSuccess from './auth/ForgotPasswordSuccess';
import AdminLayout from './layout/AdminLayout';

// Admin Pages
import Organization from './pages/admin/Organization';
import IndividualUsers from './pages/admin/IndividualUsers';
import PlatformOverview from './pages/admin/PlatformOverview';
import GlobalRoles from './pages/admin/GlobalRoles';
import Permissions from './pages/admin/Permissions';
import Products from './pages/admin/Products';
import PricePlans from './pages/admin/PricePlans';
import EmailTemplates from './pages/admin/EmailTemplates';
import Profile from './pages/admin/Profile';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswordEmail />} />
            <Route path="/forgot-password/otp" element={<ForgotPasswordOTP />} />
            <Route path="/forgot-password/new-password" element={<ForgotPasswordNewPassword />} />
            <Route path="/forgot-password/success" element={<ForgotPasswordSuccess />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route path="organization" element={<Organization />} />
              <Route path="users" element={<IndividualUsers />} />
              <Route path="overview" element={<PlatformOverview />} />
              <Route path="global-roles" element={<GlobalRoles />} />
              <Route path="permissions" element={<Permissions />} />
              <Route path="products" element={<Products />} />
              <Route path="price-plans" element={<PricePlans />} />
              <Route path="email-templates" element={<EmailTemplates />} />
              <Route path="profile" element={<Profile />} />
              <Route index element={<Navigate to="organization" replace />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
