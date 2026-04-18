import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { RealtimeAnnouncements } from '../announcements';
import GeneralFooter from '../../pages/GeneralFooter';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* New Navbar with sidebar toggle */}
      <Navbar toggleSidebar={toggleSidebar} />

      <RealtimeAnnouncements />

      <div className="flex flex-1 pt-16">
        {/* Sidebar - Fixed position, doesn't scroll */}
        <div className="hidden md:block fixed left-0 top-16 bottom-0 z-40 w-64">
          <Sidebar isOpen={true} toggleSidebar={toggleSidebar} />
        </div>
        
        {/* Mobile Sidebar */}
        <div className={`md:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`} style={{ top: ' ' }}>
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        </div>

        {/* Main content wrapper - with left margin on desktop to account for fixed sidebar */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-[calc(100vh-64px)]">
          <main className="flex-1 pt-2">
            <div className="container mx-auto px-4 py-4 md:px-6 md:py-6">
              {children || <Outlet />}
            </div>
          </main>
          
          {/* Footer inside main content area so it scrolls with content */}
          {/* <GeneralFooter /> */}
        </div>
      </div>
    </div>
  );
};

export default Layout;