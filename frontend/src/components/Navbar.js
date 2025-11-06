import React from 'react';
import { useAuth } from '../contexts/AuthContext'
import {Link, useNavigate} from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Return null if no user is logged in
  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
     
      <div className="nav-left">
        {user.role === 'customer' && (
          <Link to="/customer/dashboard">Dashboard</Link>
        )}
        {user.role === 'employee' && (
          <Link to="/employee/dashboard">Dashboard</Link>
        )}
        
        {!user.role && (
          <Link to="/dashboard">Dashboard</Link>
        )}
      </div>

      
      <div className="nav-center">
        <Link to={user.role === 'customer' ? '/customer/dashboard' : '/employee/dashboard'}>
          International Payments
        </Link>
      </div>

     
      <div className="nav-right">
        <Link to="/profile" className="nav-link">
          Profile
        </Link>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;