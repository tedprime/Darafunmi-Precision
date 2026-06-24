import React from "react";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();

  const name    = user?.name  ?? "Admin";
  const email   = user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-14 bg-white border-b border-gray-100 shrink-0">
      {/* Mobile hamburger — hidden on desktop (sidebar has its own toggle) */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Spacer so user info stays right-aligned on desktop */}
      <div className="hidden lg:block" />

      {/* User info + logout */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{name}</p>
          {email && <p className="text-xs text-gray-400 leading-tight">{email}</p>}
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {initial}
        </div>
        <button
          onClick={logout}
          title="Logout"
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;
