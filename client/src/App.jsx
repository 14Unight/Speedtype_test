import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from '@/components/common/ErrorBoundary.jsx';
import { ProtectedRoute, GuestOnlyRoute, PublicRoute } from '@/components/common/ProtectedRoute.jsx';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { Header } from '@/components/Layout/Header.jsx';
import { Footer } from '@/components/Layout/Footer.jsx';

// Page components (to be created)
import HomePage from '@/pages/HomePage.jsx';
import TestPage from '@/pages/TestPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import LeaderboardPage from '@/pages/LeaderboardPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import NotFoundPage from '@/pages/NotFoundPage.jsx';

// Styles
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app">
            <Header />
            
            <main className="main">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
                <Route path="/test" element={<PublicRoute><TestPage /></PublicRoute>} />
                
                {/* Guest-only routes */}
                <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
                <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />
                
                {/* Protected routes */}
                <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
          
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
            theme="light"
          />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
