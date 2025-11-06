import React from 'react';
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.userType || userType;

  if (!role) {
    return null; // hide navbar if no role detected
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const profileLink = role === 'employee' ? '/employee/profile' : '/profile';
  const dashboardLink = role === 'customer' ? '/customer/dashboard' : '/employee/dashboard';

  return (
    <nav className="navbar">
      <div className="nav-left">
        {role === 'customer' && <Link to="/customer/dashboard">Dashboard</Link>}
        {role === 'employee' && <Link to="/employee/dashboard">Dashboard</Link>}
        {!role && <Link to="/dashboard">Dashboard</Link>}
      </div>

      <div className="nav-center">
        <Link to={dashboardLink}>International Payments</Link>
      </div>

      <div className="nav-right">
        <Link to={profileLink} className="nav-link">Profile</Link>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
