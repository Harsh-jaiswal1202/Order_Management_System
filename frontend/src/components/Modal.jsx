import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, large }) {
  if (!isOpen) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${large ? 'modal-lg' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <h2 className="panel-title">{title}</h2>
          <button className="panel-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="panel-body">{children}</div>
        {footer && <div className="panel-footer">{footer}</div>}
      </div>
    </div>
  );
}
