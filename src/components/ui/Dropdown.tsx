import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}

interface MenuPosition {
  top: number;
  left: number;
}

const MENU_WIDTH = 224;
const MENU_GAP = 8;

const DropdownContext = createContext<{ close: () => void } | null>(null);

export const Dropdown = ({ trigger, children, align = 'right' }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 0;

    let left = align === 'right' ? rect.right - MENU_WIDTH : rect.left;
    let top = rect.bottom + MENU_GAP;

    if (menuHeight > 0 && top + menuHeight > window.innerHeight - MENU_GAP) {
      top = rect.top - menuHeight - MENU_GAP;
    }

    left = Math.max(MENU_GAP, Math.min(left, window.innerWidth - MENU_WIDTH - MENU_GAP));
    top = Math.max(MENU_GAP, top);

    setPosition({ top, left });
  }, [align]);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const raf = requestAnimationFrame(updatePosition);

    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      close();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close]);

  const menu =
    isOpen &&
    createPortal(
      <DropdownContext.Provider value={{ close }}>
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: MENU_WIDTH,
            zIndex: 9999,
          }}
          className="rounded-xl glass-panel py-1 shadow-2xl border border-border"
          role="menu"
        >
          {children}
        </div>
      </DropdownContext.Provider>,
      document.body,
    );

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen((open) => !open)}
        className="cursor-pointer inline-block"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>
      {menu}
    </>
  );
};

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  danger?: boolean;
}

export const DropdownItem = ({
  children,
  onClick,
  className = '',
  danger = false,
}: DropdownItemProps) => {
  const context = useContext(DropdownContext);

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onClick?.();
        context?.close();
      }}
      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2
        ${
          danger
            ? 'text-error hover:bg-error/10 hover:text-error'
            : 'text-text-secondary hover:bg-surface hover:text-text'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export const DropdownDivider = () => <div className="h-px bg-border my-1" />;
