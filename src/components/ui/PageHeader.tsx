import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
}

const PageHeader = ({ title, description, actions, breadcrumbs }: PageHeaderProps) => {
  return (
    <div className="page-header">
      <div className="min-w-0">
        {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
};

export default PageHeader;