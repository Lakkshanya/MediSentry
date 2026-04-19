import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import EmailVerification from './pages/EmailVerification';
import PrescriptionEntry from './pages/PrescriptionEntry';
import RiskResult from './pages/RiskResult';
import History from './pages/History';
import VerificationDetail from './pages/VerificationDetail';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminAuditTimeline from './pages/AdminAuditTimeline';
import ForgotPassword from './pages/ForgotPassword';

const ProtectedRoute = ({ children }) => {
    const { userToken, isLoading } = useContext(AuthContext);
    if (isLoading) return <div className="loading-screen">Starting MediSentry AI...</div>;
    return userToken ? children : <Navigate to="/login" replace={true} />;
};

const Splash = () => {
    const { userToken, isLoading } = useContext(AuthContext);
    if (isLoading) return <div className="loading-screen">Starting MediSentry AI...</div>;
    return userToken ? <Dashboard /> : <Welcome />;
};

const App = () => {
    return (
        <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/" element={<Splash />} />
            <Route path="/prescription-entry" element={<ProtectedRoute><PrescriptionEntry /></ProtectedRoute>} />
            <Route path="/risk-result" element={<ProtectedRoute><RiskResult /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/verification-detail/:id" element={<ProtectedRoute><VerificationDetail /></ProtectedRoute>} />
            <Route path="/prescription-detail/:id" element={<ProtectedRoute><VerificationDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/audit-timeline" element={<ProtectedRoute><AdminAuditTimeline /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
    );
};

export default App;
