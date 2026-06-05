import React from "react";

interface HeaderProps {
  pageTitle: string;
  toggleSidebar: () => void;
  userName?: string;
  userEmail?: string;
  userInitial?: string;
}

const Header: React.FC<HeaderProps> = ({
  userName = "Funminiyi Daranijo",
  userEmail = "admin@dpt.com",
  userInitial = "FD",
}) => {
  return (
    <header className="flex items-center justify-end px-8 h-16 bg-white border-b border-gray-100">
      {/* User info + avatar */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800 leading-tight">
            {userName}
          </p>
          <p className="text-xs text-gray-500 leading-tight">{userEmail}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {userInitial}
        </div>
      </div>
    </header>
  );
};

export default Header;
