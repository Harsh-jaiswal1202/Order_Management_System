import { X } from 'lucide-react';

export default function SlideOver({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="slideover open">
        <div className="panel-header">
          <h2 className="panel-title">{title}</h2>
          <button onClick={onClose} className="panel-close" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="panel-body">
          {children}
        </div>
      </div>
    </>
  );
}
