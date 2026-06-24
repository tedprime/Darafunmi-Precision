import React from "react";

interface TableProps {
  headers: string[];
  data: (React.ReactNode | string)[][];
  className?: string;
  /** Column indexes (0-based) to hide on mobile using max-md:hidden */
  hideColumnIndexes?: number[];
}

const Table: React.FC<TableProps> = ({ headers, data, className, hideColumnIndexes = [] }) => {
  return (
    <table className={`w-full ${className ?? ""}`}>
      <thead className="bg-gray-50/80 border-b border-gray-100">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              scope="col"
              className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide${
                hideColumnIndexes.includes(index) ? " max-md:hidden" : ""
              }`}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className={`px-4 py-3.5 text-sm text-gray-700 whitespace-normal break-words${
                  hideColumnIndexes.includes(cellIndex) ? " max-md:hidden" : ""
                }`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
