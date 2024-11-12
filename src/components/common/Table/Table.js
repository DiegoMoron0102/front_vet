import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

const Table = ({
  columns,
  data,
  pagination,
  onPageChange,
  onSort,
  onFilter,
  isLoading
}) => {
  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="mb-4 flex gap-4">
        {columns
          .filter(column => column.filterable)
          .map(column => (
            <div key={column.key} className="flex items-center">
              <input
                type="text"
                placeholder={`Filter by ${column.label}`}
                className="px-3 py-2 border rounded-md"
                onChange={(e) => onFilter(column.key, e.target.value)}
              />
            </div>
          ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <button
                        onClick={() => onSort(column.key)}
                        className="hover:text-gray-700"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index}>
                  {columns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Showing {pagination.pageSize * pagination.pageNumber + 1} to{' '}
            {Math.min(
              pagination.pageSize * (pagination.pageNumber + 1),
              pagination.totalElements
            )}{' '}
            of {pagination.totalElements} entries
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(pagination.pageNumber - 1)}
            disabled={pagination.pageNumber === 0}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="px-4 py-1">
            Page {pagination.pageNumber + 1} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.pageNumber + 1)}
            disabled={pagination.pageNumber === pagination.totalPages - 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;