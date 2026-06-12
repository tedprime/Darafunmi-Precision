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
  CalendarCheck,
  ShoppingBag,
  // Wrench,
  // Building2,
  BookOpen,
  UserCog,
  Newspaper,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const navItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  {
    name: "Bookings",
    icon: CalendarCheck,
    path: "/bookings",
  },
  {
    name: "Orders",
    icon: ShoppingBag,
    path: "/orders",
    subItems: [
      { name: "Order List", path: "/orders" },
    ],
  },
  {
    name: "Clients",
    icon: Users,
    path: "/clients",
    subItems: [
      { name: "Client List", path: "/clients" },
      { name: "Add Client", path: "/clients/add" },
      { name: "Contact Submissions", path: "/clients/contact-submissions" },
    ],
  },
  {
    name: "Site Users",
    icon: UserCog,
    path: "/site-users",
    subItems: [
      { name: "User List", path: "/site-users" },
      { name: "Auth Management", path: "/site-users/auth" },
    ],
  },
  // {
  //   name: "Services",
  //   icon: Wrench,
  //   path: "/services",
  // },
  // {
  //   name: "Industries",
  //   icon: Building2,
  //   path: "/industries",
  // },
  {
    name: "Products",
    icon: Package,
    path: "/products",
    subItems: [
      { name: "Product List", path: "/products" },
      { name: "Add Product", path: "/products/add" },
      { name: "Categories", path: "/products/categories" },
    ],
  },
  {
    name: "Quotations",
    icon: FileText,
    path: "/quotes",
    subItems: [
      { name: "Quote List", path: "/quotes" },
      { name: "Add Quote", path: "/quotes/add" },
      { name: "Quote Requests", path: "/quotes/quote-requests" },
    ],
  },
  {
    name: "Calibrations",
    icon: Gauge,
    path: "/calibrations",
    subItems: [
      { name: "Add Calibration", path: "/calibrations/add" },
      { name: "History", path: "/calibrations/history" },
    ],
  },
  {
    name: "Certifications",
    icon: Award,
    path: "/certifications",
    subItems: [
      { name: "Certification List", path: "/certifications" },
      { name: "Generate Certificate", path: "/certifications/generate" },
      // { name: "Company Certifications", path: "/certifications/company" },
    ],
  },
  {
    name: "Content",
    icon: BookOpen,
    path: "/content", // Keeping path root baseline for submenus
    subItems: [
      { name: "Blog List", path: "/blog" },
      { name: "Add Blog", path: "/blog/add" },
      { name: "Case Studies", path: "/case-studies" },
      { name: "Add Case Study", path: "/case-studies/add" },
      // { name: "Testimonials", path: "/content/testimonials" },
      // { name: "Resources", path: "/content/resources" },
    ],
  },
  {
    name: "Newsletter",
    icon: Newspaper,
    path: "/newsletter",
  },
  { name: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = React.useState<{
    [key: string]: boolean;
  }>({});

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 bg-white shadow-lg flex flex-col h-screen transition-all duration-300
        ${isOpen ? "w-72" : "w-16"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 shrink-0">
        {isOpen && (
          <div className="flex items-center">
            <div className="bg-blue-600 text-white text-xl px-4 py-2 rounded-lg font-bold mr-2">
              D
            </div>
            <span className="text-lg font-semibold text-gray-800">
              Admin Panel
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`text-gray-500 hover:text-gray-700 focus:outline-none ${!isOpen ? "mx-auto" : ""}`}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Nav Container - Scrollable area */}
      <nav className="flex-1 overflow-y-auto mt-5 px-2 space-y-1">
        {navItems.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <div>
                <button
                  onClick={() => isOpen && toggleSubmenu(item.name)}
                  title={!isOpen ? item.name : undefined}
                  className={`flex items-center justify-between w-full py-3 font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-500 rounded-md transition-colors duration-200
                    ${location.pathname.startsWith(item.path) ? "bg-blue-50 text-blue-500" : ""}
                    ${!isOpen ? "justify-center px-2" : "px-4"}`}
                >
                  <div className={`flex items-center ${!isOpen ? "justify-center" : ""}`}>
                    <item.icon size={20} className={isOpen ? "mr-3" : ""} />
                    {isOpen && <span>{item.name}</span>}
                  </div>
                  {isOpen &&
                    (openSubmenus[item.name] ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>

                {isOpen && openSubmenus[item.name] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className={`flex items-center px-4 py-3 text-sm text-gray-500 hover:bg-blue-50 hover:text-blue-500 rounded-md transition-colors duration-200
                          ${location.pathname === subItem.path ? "bg-blue-50 text-blue-500" : ""}`}
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
                className={`flex items-center py-3 font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-500 rounded-md transition-colors duration-200
                  ${location.pathname === item.path ? "bg-blue-50 text-blue-500" : ""}
                  ${!isOpen ? "justify-center px-2" : "px-4"}`}
              >
                <item.icon size={20} className={isOpen ? "mr-3" : ""} />
                {isOpen && <span>{item.name}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-2 border-t border-gray-200 shrink-0 bg-white">
        <Link
          to="/login"
          title={!isOpen ? "Logout" : undefined}
          className={`flex items-center py-2 text-red-600 hover:bg-red-100 rounded-md transition-colors duration-200
            ${!isOpen ? "justify-center px-2" : "px-4"}`}
        >
          <LogOut size={20} className={isOpen ? "mr-3" : ""} />
          {isOpen && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;