import Button from './Button';

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-2xl">🍽️</div>
      <h3 className="text-2xl font-extrabold text-white">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">{description}</p>
      {actionLabel ? <Button className="mt-6" onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}