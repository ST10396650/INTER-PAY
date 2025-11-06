import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/CustomerDashboard'
import MakePayment from './pages/MakePayment'
import TransactionHistory from './pages/TransactionHistory'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import Footer from './components/Layout/Footer'
import { AuthProvider } from './contexts/AuthContext'
import { SecurityProvider } from './contexts/SecurityContext'
import { HelmetProvider } from 'react-helmet-async'


function AppContent() {
  const location = useLocation();
  
  const showNavbarRoutes = ['/dashboard', '/make-payment', '/transaction-history', '/profile'];
  const shouldShowNavbar = showNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} /> 
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/make-payment" element={<MakePayment />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SecurityProvider>
        <HelmetProvider>
          <Router>
            <AppContent />
          </Router>
        </HelmetProvider>
      </SecurityProvider>
    </AuthProvider>
  )
}

export default App