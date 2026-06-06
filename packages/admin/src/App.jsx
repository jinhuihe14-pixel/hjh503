import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrderPage from './pages/OrderPage';
import ProductPage from './pages/ProductPage';
import MaterialPage from './pages/MaterialPage';
import StockRecordsPage from './pages/StockRecordsPage';
import RequisitionPage from './pages/RequisitionPage';
import ScrapPage from './pages/ScrapPage';
import PurchasePage from './pages/PurchasePage';
import FloristPage from './pages/FloristPage';
import SalaryPage from './pages/SalaryPage';
import StatsPage from './pages/StatsPage';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout>
              <Navigate to="/dashboard" />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <MainLayout>
              <OrderPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/products"
        element={
          <PrivateRoute>
            <MainLayout>
              <ProductPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/materials"
        element={
          <PrivateRoute>
            <MainLayout>
              <MaterialPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/stock-records"
        element={
          <PrivateRoute>
            <MainLayout>
              <StockRecordsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/requisitions"
        element={
          <PrivateRoute>
            <MainLayout>
              <RequisitionPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/scraps"
        element={
          <PrivateRoute>
            <MainLayout>
              <ScrapPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <PrivateRoute>
            <MainLayout>
              <PurchasePage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/florists"
        element={
          <PrivateRoute>
            <MainLayout>
              <FloristPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/salary"
        element={
          <PrivateRoute>
            <MainLayout>
              <SalaryPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <PrivateRoute>
            <MainLayout>
              <StatsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
