import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  action?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle = "Welcome back. Here's your business overview.",
  action,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
          ${isSidebarOpen ? "ml-72" : "ml-16"}`}
      >
        <Header pageTitle={pageTitle} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
              {pageSubtitle && (
                <p className="text-sm text-gray-500 mt-1">{pageSubtitle}</p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
