import { ReactNode } from 'react';
import clsx from 'clsx';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  actions?: ReactNode;
  children?: ReactNode;
}

export const Modal = ({ open, title, description, onClose, actions, children }: ModalProps) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-surface-1 p-8 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="space-y-2">
          <h3 className="text-2xl font-semibold text-text-primary">{title}</h3>
          {description && <p className="text-sm text-muted">{description}</p>}
        </header>
        <div className={clsx('mt-6 space-y-4 text-text-secondary')}>{children}</div>
        {actions && <div className="mt-8 flex justify-end gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;

