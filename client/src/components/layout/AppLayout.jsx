import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileHeader from './MobileHeader';
import MobileNavBar from './MobileNavBar';
import MoreMenuSheet from './MoreMenuSheet';

export default function AppLayout() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <div className="app-wrapper">
      {/* Desktop Sidebar Navigation */}
      <DesktopSidebar />

      {/* Main Viewport */}
      <div className="main-viewport">
        {/* iPhone & Mobile Safe Area Header */}
        <MobileHeader onOpenMore={() => setIsMoreOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="page-container">
          <Outlet />
        </main>

        {/* iPhone & Mobile Safe Area Bottom Navigation */}
        <MobileNavBar onOpenMore={() => setIsMoreOpen(true)} />

        {/* Mobile More Sections Sheet */}
        <MoreMenuSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
      </div>
    </div>
  );
}
