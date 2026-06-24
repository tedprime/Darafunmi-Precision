import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  action?: React.ReactNode;
}

const SIDEBAR_KEY = "sidebarOpen";

const Layout: React.FC<LayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle = "Welcome back. Here's your business overview.",
  action,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev: boolean) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar already uses fixed positioning internally */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* On desktop only: shift right by sidebar width. Mobile: no margin (sidebar is overlay). */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? "lg:ml-72" : "lg:ml-16"}`}>
        {/* Sticky header */}
        <div className="sticky top-0 z-30">
          <Header onMenuToggle={toggleSidebar} />
        </div>

        {/* Page content — natural height, body scrolls */}
        <main className="flex-1 p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {pageTitle}
              </h1>
              {pageSubtitle && (
                <p className="text-sm text-gray-500 mt-1">{pageSubtitle}</p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
