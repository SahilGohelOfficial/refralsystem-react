import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import DashboardSection from './DashboardSection';

export type QuickActionItem = {
  to: string;
  label: string;
  description?: string;
  icon: ReactNode;
  /** Highlight primary action (e.g. register user) */
  primary?: boolean;
};

type QuickActionsProps = {
  title: string;
  actions: QuickActionItem[];
  className?: string;
};

const QuickActions = ({ title, actions, className = '' }: QuickActionsProps) => (
  <DashboardSection title={title} className={className}>
    <div className="grid grid-cols-1 gap-2.5">
      {actions.map((action) => (
        <Link
          key={action.to + action.label}
          to={action.to}
          className={`
            group flex items-start gap-3 rounded-xl border p-3.5
            transition-all duration-150 no-underline
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
            ${
              action.primary
                ? 'border-primary/30 bg-primary/10 hover:bg-primary/15 hover:border-primary/45'
                : 'border-border bg-surface/40 hover:bg-surface-elevated hover:border-border-strong'
            }
          `}
        >
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
              transition-colors
              ${
                action.primary
                  ? 'bg-primary/20 border-primary/25 text-primary'
                  : 'bg-surface border-border text-text-secondary group-hover:text-primary group-hover:border-primary/20'
              }
            `}
          >
            {action.icon}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <p
                className={`text-sm font-semibold leading-snug ${
                  action.primary ? 'text-text' : 'text-text group-hover:text-text'
                }`}
              >
                {action.label}
              </p>
              <ChevronRight
                size={16}
                className="shrink-0 text-text-muted opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary"
              />
            </div>
            {action.description ? (
              <p className="mt-0.5 text-xs text-text-secondary leading-relaxed line-clamp-2">
                {action.description}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  </DashboardSection>
);

export default QuickActions;
