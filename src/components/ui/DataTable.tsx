import { ReactNode } from 'react';
import clsx from 'clsx';

export interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  align?: 'left' | 'right' | 'center';
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface DataTableProps<T extends { id: string | number }> {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  caption?: string;
}

export const DataTable = <T extends { id: string | number }>({ columns, data, caption }: DataTableProps<T>) => (
  <div className="overflow-hidden rounded-3xl bg-surface-1 shadow-card">
    <table className="w-full border-collapse text-sm">
      {caption && (
        <caption className="px-6 py-4 text-left text-base font-semibold text-text-primary">{caption}</caption>
      )}
      <thead className="text-muted">
        <tr>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              scope="col"
              className={clsx('px-6 py-3 font-medium uppercase tracking-wide text-xs', {
                'text-left': column.align === 'left' || !column.align,
                'text-right': column.align === 'right',
                'text-center': column.align === 'center',
              })}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-t border-white/5 text-text-secondary">
            {columns.map((column) => (
              <td
                key={String(column.key)}
                className={clsx('px-6 py-4', {
                  'text-left': column.align === 'left' || !column.align,
                  'text-right': column.align === 'right',
                  'text-center': column.align === 'center',
                })}
              >
                {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;

