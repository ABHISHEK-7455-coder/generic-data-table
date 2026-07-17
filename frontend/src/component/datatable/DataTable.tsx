import { useEffect, useMemo, useRef, useState } from "react";
import "./dataTable.css";
import type { DataTableProps } from "./types";

const ITEMS_PER_PAGE = 8;

export function DataTable<T>({ data: initialData, columns, onEdit, onDelete }: DataTableProps<T>) {
  const [data, setData] = useState<T[]>(initialData ?? []);
  const [page, setPage] = useState(1);
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setPage(1);
      return;
    }

    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((result) => {
        setData(result as T[]);
        setPage(1);
      })
      .catch(() => setData([]));
  }, [initialData]);

  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const visibleRows = useMemo(() => data.slice(startIndex, startIndex + ITEMS_PER_PAGE), [data, startIndex]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollTop = 0;
    }
  }, [safePage]);

  return (
    <>
      <div className="table-wrapper" ref={tableWrapperRef} key={safePage}>
        <table className="data-table" key={safePage}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)}>{column.header}</th>
              ))}
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row, rowIndex) => {
              const rowKey = `${safePage}-${startIndex + rowIndex}`;
              return (
                <tr key={rowKey}>
                {columns.map((column) => (
                  <td key={String(column.key)}>{String(row[column.key])}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td style={{ display: "flex", gap: "0.5rem" }}>
                    {onEdit && (
                      <button type="button" className="action-btn edit-btn" onClick={() => onEdit(row)}>
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button type="button" className="action-btn delete-btn" onClick={() => onDelete(row)}>
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1}>
          Previous
        </button>
        <span>
          Page {safePage} of {totalPages}
        </span>
        <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>
          Next
        </button>
      </div>
    </>
  );
}