import React from "react";
import { LogOut } from "lucide-react";
import { getStoredUser, logout } from "../../../services/auth.jsx";

const Header: React.FC = () => {
  const user = getStoredUser();

  const name = user?.name ?? "Admin";
  const email = user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-end px-8 h-16 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {name}
            </p>
            <p className="text-xs text-gray-500 leading-tight">{email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {initial}
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;