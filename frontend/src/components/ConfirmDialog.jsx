import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Action" footer={
      <>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Delete'}
        </button>
      </>
    }>
      <div className="confirm-dialog">
        <AlertTriangle size={48} />
        <h3>{title || 'Are you sure?'}</h3>
        <p>{message || 'This action cannot be undone.'}</p>
      </div>
    </Modal>
  );
}
