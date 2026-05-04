import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Package,
  FileText,
  Settings,
  Book,
  Award,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const navItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  {
    name: "Clients",
    icon: Users,
    path: "/clients",
    subItems: [
      { name: "Client List", path: "/clients" },
      { name: "Add Client", path: "/clients/add" },
    ],
  },
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
    ],
  },
  { name: "Calibrations", icon: Award, path: "/calibrations" }, // Assuming a placeholder for now
  {
    name: "Certifications",
    icon: Award,
    path: "/certifications",
    subItems: [
      { name: "Certification List", path: "/certifications" },
      { name: "Generate Certificate", path: "/certifications/generate" },
    ],
  },
  {
    name: "Blogs",
    icon: Book,
    path: "/blog",
    subItems: [
      { name: "Blog List", path: "/blog" },
      { name: "Add Blog", path: "/blog/add" },
    ],
  },
  { name: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = React.useState<{
    [key: string]: boolean;
  }>({});

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg overflow-y-auto transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-blue-600 text-white p-2 rounded-md font-bold mr-2">
            DPT
          </div>
          <span className="text-lg font-semibold text-gray-800">
            Admin Panel
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="mt-5">
        {navItems.map(item => (
          <div key={item.name}>
            {item.subItems ? (
              <div className="relative">
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={`flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-blue-500 hover:text-white rounded-md transition-colors duration-200
                    ${location.pathname.startsWith(item.path) ? "bg-blue-600 text-white" : ""}`}
                >
                  <div className="flex items-center">
                    <item.icon size={20} className="mr-3" />
                    <span>{item.name}</span>
                  </div>
                  {openSubmenus[item.name] ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {openSubmenus[item.name] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map(subItem => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className={`flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-500 hover:text-white rounded-md transition-colors duration-200
                          ${location.pathname === subItem.path ? "bg-blue-600 text-white" : ""}`}
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
                className={`flex items-center px-4 py-2 text-gray-700 hover:bg-blue-500 hover:text-white rounded-md transition-colors duration-200
                  ${location.pathname === item.path ? "bg-blue-600 text-white" : ""}`}
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
        <Link
          to="/logout"
          className="flex items-center px-4 py-2 text-red-600 hover:bg-red-100 rounded-md transition-colors duration-200"
        >
          <X size={20} className="mr-3" />{" "}
          {/* Using X as a placeholder for logout icon */}
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
