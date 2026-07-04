import React, { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode } from 'react';

interface TableProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Table = ({ children, className = '' }: TableProps) => (
  <div className={`w-full overflow-x-auto ${className}`}>
    <table className="w-full text-left border-collapse min-w-[640px]">
      {children}
    </table>
  </div>
);

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export const TableHeader = ({ children, className = '' }: TableHeaderProps) => (
  <thead className={`bg-surface/60 border-b border-border ${className}`}>
    {children}
  </thead>
);

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  onClick?: () => void;
}

export const TableRow = ({ children, className = '', onClick }: TableRowProps) => (
  <tr
    className={`border-b border-border/60 last:border-b-0 transition-colors duration-150
      ${onClick ? 'cursor-pointer hover:bg-surface-elevated/60' : 'hover:bg-surface/40'}
      ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export const TableHead = ({ children, className = '' }: TableHeadProps) => (
  <th
    className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap ${className}`}
  >
    {children}
  </th>
);

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export const TableCell = ({ children, className = '', ...props }: TableCellProps) => (
  <td className={`px-5 py-4 text-sm text-text align-middle ${className}`} {...props}>
    {children}
  </td>
);