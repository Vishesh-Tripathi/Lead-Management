import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LeadsPage from './pages/LeadsPage';
import CreateLeadPage from './pages/CreateLeadPage';
import EditLeadPage from './pages/EditLeadPage';
import LeadDetailsPage from './pages/LeadDetailsPage';
import BulkLeadUploadPage from './pages/BulkLeadUploadPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LeadsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/create"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateLeadPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/bulk-upload"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BulkLeadUploadPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LeadDetailsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditLeadPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/leads" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
