import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, 
  History as HistoryIcon, 
  Bell, 
  User, 
  LogOut,
  PlusSquare,
  Activity,
  ShieldCheck,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={22} />, roles: ['DOCTOR', 'PHARMACIST', 'ADMIN'] },
    { name: 'New Prescription', path: '/prescription-entry', icon: <PlusSquare size={22} />, roles: ['DOCTOR'] },
    { name: 'History', path: '/history', icon: <HistoryIcon size={22} />, roles: ['DOCTOR', 'PHARMACIST', 'ADMIN'] },
    // Removed Surveillance as per request
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(userInfo?.role));

  return (
    <div className="sidebar-premium">
      <style>{`
        .sidebar-premium { width: 280px; height: 100vh; background: #28005C; color: white; display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 100; transition: all 0.3s ease; }
        .sidebar-logo-section { padding: 40px 30px; display: flex; align-items: center; gap: 12px; }
        .logo-img-sidebar { width: 35px; height: 35px; }
        .logo-text-premium { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.5px; }
        
        .nav-container { flex: 1; padding: 0 20px; }
        .sidebar-link { 
          display: flex; align-items: center; gap: 15px; padding: 16px 20px; color: rgba(255, 255, 255, 0.6); 
          text-decoration: none; border-radius: 16px; margin-bottom: 10px; font-weight: 700; font-size: 1.1rem; transition: all 0.2s;
        }
        .sidebar-link:hover { color: white; background: rgba(255,255,255,0.08); }
        .sidebar-link.active { color: white; background: rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        .sidebar-bottom { padding: 30px 20px; }
        .logout-btn-premium { 
          width: 100%; display: flex; align-items: center; gap: 15px; padding: 18px 20px; background: rgba(255, 255, 255, 0.05); 
          color: #FF9E9E; border-radius: 16px; font-weight: 800; font-family: inherit; font-size: 1.1rem; transition: all 0.2s; border: none; cursor: pointer;
        }
        .logout-btn-premium:hover { background: rgba(255, 82, 82, 0.15); color: #FF5252; }

        @media (max-width: 1024px) {
          .sidebar-premium { width: 85px; }
          .logo-text-premium, .sidebar-link span, .logout-btn-premium span { display: none; }
          .sidebar-logo-section, .sidebar-link, .logout-btn-premium { justify-content: center; }
        }
      `}</style>

      <div className="sidebar-logo-section">
        <img src="/assets/Logo.png" alt="Logo" className="logo-img-sidebar" />
        <span className="logo-text-premium">MediSentry AI</span>
      </div>

      <div className="nav-container">
        {filteredNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <NavLink to="/profile" className="sidebar-link"><User size={22} /><span>Profile</span></NavLink>
        <button onClick={handleLogout} className="logout-btn-premium">
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
