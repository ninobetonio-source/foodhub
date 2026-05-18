import clsx from 'clsx';

export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const styles = {
    primary: 'bg-[var(--fh-accent)] text-[var(--fh-bg)]',
    secondary: 'bg-transparent border border-[var(--fh-border)] text-[var(--fh-text)]',
    ghost: 'bg-transparent text-[var(--fh-text)] border border-[var(--fh-border)]',
    danger: 'bg-transparent text-[var(--fh-danger)] border border-[var(--fh-danger)] hover:bg-[var(--fh-danger)] hover:text-[var(--fh-bg)]'
  };

  return (
    <button
      style={{ height: 44 }}
      className={clsx('inline-flex items-center justify-center rounded-md px-5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60', styles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}