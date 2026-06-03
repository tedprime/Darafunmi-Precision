import React, { useState, useEffect } from "react";
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
  // On mobile, sidebar is always closed by default
  const isMobile = () => window.innerWidth < 768;

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined" && isMobile()) return false;
    const saved = localStorage.getItem(SIDEBAR_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  // Close sidebar automatically when resizing down to mobile
  useEffect(() => {
    const handleResize = () => {
      if (isMobile()) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev: boolean) => {
      const next = !prev;
      // Only persist on desktop
      if (!isMobile()) {
        localStorage.setItem(SIDEBAR_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay — tapping outside closes sidebar */}
      {isSidebarOpen && isMobile() && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
          ${isSidebarOpen ? "md:ml-72" : "md:ml-16"} ml-0`}
      >
        <Header pageTitle={pageTitle} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
          {/* Page title row — stacks on mobile if action is present */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
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