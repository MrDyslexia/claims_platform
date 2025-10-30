"use client";

import type React from "react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T) => string | number;
  renderCell?: (item: T, columnKey: React.Key) => React.ReactNode;
  "aria-label"?: string;
  bottomContent?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor = (item: any) =>
    item.id ||
    item.id_usuario ||
    item.id_empresa ||
    item.id_denuncia ||
    item.id_auditoria,
  renderCell,
  "aria-label": ariaLabel,
  bottomContent,
}: DataTableProps<T>) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table aria-label={ariaLabel} className="w-full">
          <thead className="bg-default-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-default-600 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-default-200">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-default-50 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm">
                    {renderCell
                      ? renderCell(item, column.key)
                      : column.render
                        ? column.render(item)
                        : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bottomContent && <div className="py-4">{bottomContent}</div>}
    </div>
  );
}
