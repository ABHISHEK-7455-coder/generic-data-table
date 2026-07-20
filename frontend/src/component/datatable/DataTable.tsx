import { useEffect, useMemo, useRef, useState } from "react";
import "./dataTable.css";
import type { DataTableProps } from "./types";

const ITEMS_PER_PAGE = 10;

export function DataTable<T>({ data: initialData, columns, onEdit, onDelete }: DataTableProps<T>) {
  const [data, setData] = useState<T[]>(initialData ?? []);
  const [page, setPage] = useState<number>(1);
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

  const totalPages:number = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const safePage:number = Math.min(page, totalPages);
  const startIndex:number = (safePage - 1) * ITEMS_PER_PAGE;
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
        <button type="button" onClick={() => setPage(page-1)} disabled={safePage === 1}>
          Previous
        </button>
        <span>
          Page {safePage} of {totalPages}
        </span>
        <button type="button" onClick={() => setPage(page+1)} disabled={safePage === totalPages}>
          Next
        </button>
      </div>
    </>
  );
}

// import { useEffect, useState } from "react";

// type ColumnDefinition<T extends Record<string, unknown>> = {
//   key: keyof T;
//   header: string;
// };

// type DataTableProps<T extends Record<string, unknown>> = {
//   data: T[];
//   columns: ColumnDefinition<T>[];
//   onEdit?: (row: T) => void;
//   onDelete?: (row: T) => void;
// };

// const ROW_HEIGHT = 56;
// const OVERSCAN = 6;

// export function DataTable<T extends Record<string, unknown>>({
//   data,
//   columns,
//   onEdit,
//   onDelete,
// }: DataTableProps<T>) {
//   const [scrollTop, setScrollTop] = useState(0);
//   const [viewportHeight, setViewportHeight] = useState(420);

//   useEffect(() => {
//     setScrollTop(0);
//   }, [data.length]);

//   useEffect(() => {
//     const updateViewportHeight = () => {
//       const height = Math.max(280, Math.min(560, window.innerHeight - 260));
//       setViewportHeight(height);
//     };

//     updateViewportHeight();
//     window.addEventListener("resize", updateViewportHeight);

//     return () => {
//       window.removeEventListener("resize", updateViewportHeight);
//     };
//   }, []);

//   const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
//   const endIndex = Math.min(
//     data.length,
//     startIndex + Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2,
//   );
//   const visibleRows = data.slice(startIndex, endIndex);
//   const gridTemplateColumns = `${columns.map(() => "minmax(0, 1fr)").join(" ")} 140px`;

//   return (
//     <div
//       style={{
//         border: "1px solid #e5e7eb",
//         borderRadius: 12,
//         overflow: "hidden",
//         background: "#fff",
//       }}
//     >
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns,
//           padding: "12px",
//           background: "#f9fafb",
//           fontWeight: 600,
//           color: "#374151",
//           borderBottom: "1px solid #e5e7eb",
//         }}
//       >
//         {columns.map((column) => (
//           <div key={String(column.key)}>{column.header}</div>
//         ))}
//         <div style={{ textAlign: "right" }}>Actions</div>
//       </div>

//       <div
//         onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
//         style={{ height: viewportHeight, overflowY: "auto" }}
//       >
//         {data.length === 0 ? (
//           <div
//             style={{
//               height: viewportHeight,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#6b7280",
//             }}
//           >
//             No records found
//           </div>
//         ) : (
//           <div style={{ position: "relative", height: data.length * ROW_HEIGHT }}>
//             {visibleRows.map((row, index) => {
//               const rowIndex = startIndex + index;
//               const rowKey = `${String(row[columns[0]?.key ?? "id"] ?? rowIndex)}`;

//               return (
//                 <div
//                   key={rowKey}
//                   style={{
//                     position: "absolute",
//                     top: rowIndex * ROW_HEIGHT,
//                     left: 0,
//                     right: 0,
//                     display: "grid",
//                     gridTemplateColumns,
//                     padding: "0 12px",
//                     minHeight: ROW_HEIGHT,
//                     alignItems: "center",
//                     borderBottom: "1px solid #f3f4f6",
//                     background: "#fff",
//                   }}
//                 >
//                   {columns.map((column) => (
//                     <div
//                       key={String(column.key)}
//                       style={{
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {String(row[column.key] ?? "")}
//                     </div>
//                   ))}

//                   <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
//                     {onEdit ? (
//                       <button
//                         type="button"
//                         onClick={() => onEdit(row)}
//                         style={{
//                           border: "1px solid #d1d5db",
//                           background: "#fff",
//                           borderRadius: 6,
//                           padding: "6px 10px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         Edit
//                       </button>
//                     ) : null}

//                     {onDelete ? (
//                       <button
//                         type="button"
//                         onClick={() => onDelete(row)}
//                         style={{
//                           border: "1px solid #ef4444",
//                           color: "#ef4444",
//                           background: "#fff",
//                           borderRadius: 6,
//                           padding: "6px 10px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         Delete
//                       </button>
//                     ) : null}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }