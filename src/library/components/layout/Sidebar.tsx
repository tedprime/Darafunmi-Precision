import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Package,
  FileText,
  Settings,
  Award,
  Gauge,
  Menu,
  LogOut,
  ChevronDown,
  ChevronUp,
  X,
  Users2,
  CalendarCheck,
  ShoppingBag,
  Wrench,
  BookOpen,
  UserCog,
  Newspaper,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const navItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  { name: "Bookings",  icon: CalendarCheck, path: "/bookings" },
  { name: "Orders",    icon: ShoppingBag,   path: "/orders"   },
  {
    name: "Clients",
    icon: Users,
    path: "/clients",
    subItems: [
      { name: "Client List",          path: "/clients" },
      { name: "Contact Submissions",  path: "/clients/contact-submissions" },
    ],
  },
  { name: "Site Users", icon: UserCog, path: "/site-users" },
  { name: "Services",   icon: Wrench,  path: "/services"   },
  {
    name: "Team",
    icon: Users2,
    path: "/team",
    subItems: [
      { name: "Team Members", path: "/team"     },
      { name: "Add Member",   path: "/team/add" },
    ],
  },
  {
    name: "Products",
    icon: Package,
    path: "/products",
    subItems: [
      { name: "Product List", path: "/products"            },
      { name: "Add Product",  path: "/products/add"        },
      { name: "Categories",   path: "/products/categories" },
    ],
  },
  {
    name: "Quotations",
    icon: FileText,
    path: "/quotes",
    subItems: [
      { name: "Quote List",     path: "/quotes"                },
      { name: "Add Quote",      path: "/quotes/add"            },
      { name: "Quote Requests", path: "/quotes/quote-requests" },
    ],
  },
  {
    name: "Calibrations",
    icon: Gauge,
    path: "/calibrations",
    subItems: [
      { name: "Add Calibration", path: "/calibrations/add"     },
      { name: "History",         path: "/calibrations/history" },
    ],
  },
  {
    name: "Certifications",
    icon: Award,
    path: "/certifications",
    subItems: [
      { name: "Certification List",   path: "/certifications"          },
      { name: "Generate Certificate", path: "/certifications/generate" },
    ],
  },
  {
    name: "Content",
    icon: BookOpen,
    path: "/content",
    subItems: [
      { name: "Blog List",       path: "/blog"             },
      { name: "Add Blog",        path: "/blog/add"         },
      { name: "Case Studies",    path: "/case-studies"     },
      { name: "Add Case Study",  path: "/case-studies/add" },
    ],
  },
  { name: "Newsletter", icon: Newspaper, path: "/newsletter" },
  { name: "Settings",   icon: Settings,  path: "/settings"   },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [openSubmenus, setOpenSubmenus] = React.useState<{ [key: string]: boolean }>({});

  const toggleSubmenu = (name: string) =>
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <>
      {/* ── Mobile backdrop (tap to close) ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ── */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-100 flex flex-col
          transition-all duration-300 ease-in-out
          w-72
          ${isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-16"
          }
        `}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 shrink-0">
          {isOpen && (
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 text-white text-sm px-2.5 py-1.5 rounded-lg font-bold tracking-wide">
                DPT
              </div>
              <span className="text-sm font-semibold text-gray-800">Admin Panel</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`text-gray-400 hover:text-gray-700 focus:outline-none transition-colors ${!isOpen ? "mx-auto" : ""}`}
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Nav (custom-styled thin scrollbar) ── */}
        <nav
          className="
            flex-1 overflow-y-auto mt-3 px-2 space-y-0.5
            [scrollbar-width:thin]
            [scrollbar-color:theme(colors.gray.300)_transparent]
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb:hover]:bg-gray-400
          "
        >
          {navItems.map((item) => {
            const isActive = item.subItems
              ? location.pathname.startsWith(item.path)
              : location.pathname === item.path;

            return (
              <div key={item.name}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => isOpen && toggleSubmenu(item.name)}
                      title={!isOpen ? item.name : undefined}
                      className={`flex items-center justify-between w-full py-2.5 text-sm font-medium rounded-lg transition-colors duration-150
                        ${isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}
                        ${!isOpen ? "justify-center px-2" : "px-3"}`}
                    >
                      <div className={`flex items-center ${!isOpen ? "justify-center" : "gap-3"}`}>
                        <item.icon size={18} />
                        {isOpen && <span>{item.name}</span>}
                      </div>
                      {isOpen && (
                        openSubmenus[item.name]
                          ? <ChevronUp size={14} className="opacity-60" />
                          : <ChevronDown size={14} className="opacity-60" />
                      )}
                    </button>

                    {isOpen && openSubmenus[item.name] && (
                      <div className="ml-4 mt-0.5 mb-1 space-y-0.5 pl-4 border-l border-gray-200">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            onClick={() => {
                              /* close sidebar on mobile after navigation */
                              if (window.innerWidth < 1024) toggleSidebar();
                            }}
                            className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-150
                              ${location.pathname === subItem.path
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                              }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    title={!isOpen ? item.name : undefined}
                    onClick={() => {
                      if (window.innerWidth < 1024) toggleSidebar();
                    }}
                    className={`flex items-center py-2.5 text-sm font-medium rounded-lg transition-colors duration-150
                      ${isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}
                      ${!isOpen ? "justify-center px-2" : "px-3 gap-3"}`}
                  >
                    <item.icon size={18} />
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100 mx-2 my-2" />

        {/* ── Logout ── */}
        <div className="px-2 pb-3 shrink-0">
          <button
            onClick={logout}
            title={!isOpen ? "Logout" : undefined}
            className={`flex items-center w-full py-2.5 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150
              ${!isOpen ? "justify-center px-2" : "px-3 gap-3"}`}
          >
            <LogOut size={18} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
