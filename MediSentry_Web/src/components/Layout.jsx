import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout-premium">
      <style>{`
        .layout-premium { display: flex; min-height: 100vh; background: #FAFAFB; }
        .main-content-v2 { flex: 1; margin-left: 280px; display: flex; flex-direction: column; transition: all 0.3s ease; }
        .page-content-v2 { padding: 10px 40px 40px; flex: 1; min-height: calc(100vh - 90px); }

        @media (max-width: 1024px) {
          .main-content-v2 { margin-left: 85px; }
        }
        @media (max-width: 768px) {
          .main-content-v2 { margin-left: 0; }
          .page-content-v2 { padding: 20px; }
        }
      `}</style>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="main-content-v2">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="page-content-v2">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
