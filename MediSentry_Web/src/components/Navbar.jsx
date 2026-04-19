import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Menu, Search, User, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="navbar-premium">
      <style>{`
        .navbar-premium { height: 90px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 50px; position: sticky; top: 0; z-index: 90; border-bottom: 1.5px solid #F0F0F0; }
        .nav-left-v2 { display: flex; align-items: center; gap: 25px; flex: 1; }
        .nav-logo-web { width: 35px; height: 35px; margin-right: 15px; }
        .search-container-v2 { background: #F8F9FA; border-radius: 16px; border: 1.5px solid #EAEAEA; display: flex; align-items: center; padding: 12px 20px; gap: 12px; width: 100%; max-width: 450px; transition: all 0.2s; }
        .search-container-v2:focus-within { border-color: #28005C; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .search-container-v2 input { background: none; border: none; font-size: 1rem; width: 100%; outline: none; font-family: inherit; font-weight: 600; }
        
        .nav-right-v2 { display: flex; align-items: center; gap: 35px; }
        .nav-icon-link { background: #F8F9FA; width: 50px; height: 50px; border-radius: 15px; display: flex; align-items: center; justify-content: center; position: relative; color: #666; transition: all 0.2s; }
        .nav-icon-link:hover { color: #28005C; background: #F3F0F7; }
        .notification-indicator { position: absolute; top: 12px; right: 12px; width: 10px; height: 10px; background: #FF3B30; border-radius: 50%; border: 2px solid white; }
        
        .user-identity-v2 { display: flex; align-items: center; gap: 18px; padding: 8px 12px; border-radius: 18px; transition: all 0.2s; cursor: pointer; }
        .user-identity-v2:hover { background: #F8F9FA; }
        .identity-text { display: flex; flex-direction: column; text-align: right; }
        .identity-name { font-weight: 800; font-size: 1.15rem; color: #28005C; }
        .identity-role { font-size: 0.85rem; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .identity-avatar { width: 50px; height: 50px; background: #28005C; border-radius: 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(40, 0, 92, 0.2); }
        
        @media (max-width: 1024px) {
            .nav-logo-web { display: block; }
        }
        @media (min-width: 1025px) {
            .nav-logo-web { display: none; } /* Logo is already in Sidebar for large screens */
        }
      `}</style>

      <div className="nav-left-v2">
        <img src="/assets/Logo.png" alt="Logo" className="nav-logo-web" />
        <div className="search-container-v2">
          <Search size={22} color="#999" />
          <input type="text" placeholder="Search audit logs, patients..." />
        </div>
      </div>

      <div className="nav-right-v2">
        {userInfo?.role !== 'PHARMACIST' && (
          <button className="nav-icon-link" onClick={() => {
            if (userInfo?.role === 'ADMIN') {
              navigate('/audit-timeline');
            } else {
              navigate('/notifications');
            }
          }}>
            <Bell size={24} />
            <div className="notification-indicator"></div>
          </button>
        )}
        
        <div className="user-identity-v2">
          <div className="identity-text">
            <span className="identity-name">{userInfo?.username || 'Pranav Rajesh'}</span>
            <span className="identity-role">{userInfo?.role || 'Doctor'}</span>
          </div>
          <div className="identity-avatar">
            <User size={24} color="white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
