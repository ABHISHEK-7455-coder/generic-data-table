import { useEffect, useState } from "react";
import "./dataTable.css";
import type { DataTableProps } from "./types";

export function DataTable<T>({ data: initialData, columns, onEdit, onDelete }: DataTableProps<T>) {
  const [data, setData] = useState<T[]>(initialData ?? []);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      return;
    }

    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((result) => setData(result as T[]))
      .catch(() => setData([]));
  }, [initialData]);

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={String(column.key)}>{column.header}</th>
          ))}
          {(onEdit || onDelete) && <th>Actions</th>}
        </tr>
      </thead>

      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={String((row as Record<string, unknown>).id ?? rowIndex)}>
            {columns.map((column) => (
              <td key={String(column.key)}>{String(row[column.key])}</td>
            ))}
            {(onEdit || onDelete) && (
              <td>
                {onEdit && (
                  <button type="button" onClick={() => onEdit(row)} style={{ marginRight: "0.5rem" }}>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button type="button" onClick={() => onDelete(row)}>
                    Delete
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}