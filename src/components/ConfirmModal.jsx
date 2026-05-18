import React from 'react';
import Button from './Button';

export default function ConfirmModal({ open, title, body, onConfirm, onClose, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, extraAction = null }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="glass-card max-w-md p-6">
        <h3 className="text-xl font-bold text-[var(--fh-text)]">{title}</h3>
        <p className="mt-3 text-[var(--fh-muted)]">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          {extraAction ? (
            <Button variant={extraAction.variant ?? 'secondary'} onClick={extraAction.onClick}>{extraAction.label}</Button>
          ) : null}
          <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
