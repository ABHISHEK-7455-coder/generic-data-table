export type Column<T> = {
  key: keyof T;
  header: string;
};

export type DataTableProps<T> = {
  data?: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
};