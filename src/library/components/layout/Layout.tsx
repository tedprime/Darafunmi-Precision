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
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
          ${isSidebarOpen ? "ml-72" : "ml-16"}`}
      >
        <Header />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
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