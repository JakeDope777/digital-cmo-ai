import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ChatPage from './pages/ChatPage';
import ControlTowerPage from './pages/ControlTowerPage';
import MarginBrainPage from './pages/MarginBrainPage';
import InventoryWastePage from './pages/InventoryWastePage';
import SettingsPage from './pages/SettingsPage';
import IndustryPage from './pages/IndustryPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BillingPage from './pages/BillingPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/industries/:slug" element={<IndustryPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/control-tower" replace />} />
          <Route path="control-tower" element={<ControlTowerPage />} />
          <Route path="margin-brain" element={<MarginBrainPage />} />
          <Route path="inventory-waste" element={<InventoryWastePage />} />
          <Route path="manager-chat" element={<ChatPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="dashboard" element={<ControlTowerPage />} />
          <Route path="analysis" element={<MarginBrainPage />} />
          <Route path="crm" element={<InventoryWastePage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
