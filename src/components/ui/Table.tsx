import React, { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode } from 'react';

interface TableProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Table = ({ children, className = '' }: TableProps) => (
  <div className={`w-full overflow-x-auto ${className}`}>
    <table className="w-full text-left border-collapse">
      {children}
    </table>
  </div>
);

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export const TableHeader = ({ children, className = '' }: TableHeaderProps) => (
  <thead className={`bg-surface/50 border-b border-border ${className}`}>
    {children}
  </thead>
);

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  onClick?: () => void;
}

export const TableRow = ({ children, className = '', onClick }: TableRowProps) => (
  <tr 
    className={`border-b border-border hover:bg-surface/30 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export const TableHead = ({ children, className = '' }: TableHeadProps) => (
  <th className={`px-4 py-3 text-sm font-semibold text-text-secondary whitespace-nowrap ${className}`}>
    {children}
  </th>
);

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export const TableCell = ({ children, className = '' }: TableCellProps) => (
  <td className={`px-4 py-3 text-sm text-text ${className}`}>
    {children}
  </td>
);
