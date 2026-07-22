type TabCountProps = {
  count: number;
  active?: boolean;
};

const TabCount = ({ count, active = false }: TabCountProps) => (
  <span
    className={`ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none ${
      active ? 'bg-primary/15 text-primary' : 'bg-surface-muted text-text-secondary'
    }`}
  >
    {count}
  </span>
);

export default TabCount;
