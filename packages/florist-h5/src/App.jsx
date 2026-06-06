import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import RequisitionsPage from './pages/RequisitionsPage';
import ScrapsPage from './pages/ScrapsPage';
import SalaryPage from './pages/SalaryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/requisitions" element={<RequisitionsPage />} />
      <Route path="/scraps" element={<ScrapsPage />} />
      <Route path="/salary" element={<SalaryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
