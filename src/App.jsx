import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import TrafficDashboard from './pages/TrafficDashboard';
import ParkingDashboard from './pages/ParkingDashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ParkingAnalytics from './pages/ParkingAnalytics';
import BookingHistory from './components/parking/BookingHistory';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminUsers from './pages/AdminUsers';
import { NotificationProvider } from './components/notifications/NotificationSystem';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Elements stripe={stripePromise}>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="traffic" element={<TrafficDashboard />} />
              <Route path="parking" element={<ParkingDashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="parking-analytics" element={<ParkingAnalytics />} />
              <Route path="booking-history" element={<BookingHistory />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin-users" element={<AdminUsers />} />
              <Route path="user-admin" element={<Navigate to="/admin-users" replace />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </Elements>
  );
}

export default App;
