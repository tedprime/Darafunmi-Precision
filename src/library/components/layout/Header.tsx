import React from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  pageTitle: string;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, toggleSidebar }) => {
  return (
    <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4 lg:hidden"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">{pageTitle}</h1>
      </div>
      <div className="flex items-center">
        <span className="text-gray-700 mr-2">Admin</span>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>
    </header>
  );
};

export default Header;
