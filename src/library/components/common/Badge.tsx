import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "green" | "yellow" | "red" | "blue" | "purple" | "orange" | "gray";
}

const dotColors = {
  green:  "bg-green-500",
  yellow: "bg-yellow-500",
  red:    "bg-red-500",
  blue:   "bg-blue-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  gray:   "bg-gray-400",
};

const pillColors = {
  green:  "bg-green-50 text-green-700 ring-1 ring-green-200",
  yellow: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
  red:    "bg-red-50 text-red-700 ring-1 ring-red-200",
  blue:   "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  gray:   "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

const Badge: React.FC<BadgeProps> = ({ children, color = "gray" }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${pillColors[color]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[color]}`} />
      {children}
    </span>
  );
};

export default Badge;
