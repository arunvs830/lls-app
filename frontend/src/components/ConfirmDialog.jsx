import React from 'react';
import '../styles/ConfirmDialog.css';

/**
 * ConfirmDialog - A reusable modal component to replace window.confirm()
 * 
 * Usage:
 * const [showConfirm, setShowConfirm] = useState(false);
 * const [deleteId, setDeleteId] = useState(null);
 * 
 * const handleDelete = (id) => {
 *   setDeleteId(id);
 *   setShowConfirm(true);
 * };
 * 
 * const confirmDelete = async () => {
 *   await api.delete(deleteId);
 *   setShowConfirm(false);
 *   setDeleteId(null);
 * };
 * 
 * <ConfirmDialog 
 *   isOpen={showConfirm}
 *   title="Delete Student"
 *   message="Are you sure you want to delete this student? This action cannot be undone."
 *   onConfirm={confirmDelete}
 *   onCancel={() => setShowConfirm(false)}
 *   confirmText="Delete"
 *   confirmVariant="danger"
 * />
 */
const ConfirmDialog = ({
    isOpen,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'primary', // 'primary', 'danger', 'warning'
}) => {
    if (!isOpen) return null;

    const getVariantClass = () => {
        switch (confirmVariant) {
            case 'danger': return 'btn-danger';
            case 'warning': return 'btn-warning'; // Assuming you might have this or use primary
            default: return 'btn-primary';
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel} aria-hidden="true">
            <div
                className="modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '400px' }}
            >
                <div className="modal-header">
                    <h3 id="confirm-dialog-title">{title}</h3>
                    <button className="modal-close" onClick={onCancel} aria-label="Close">
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    <p id="confirm-dialog-message" style={{ color: 'var(--text-secondary)' }}>
                        {message}
                    </p>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`btn ${getVariantClass()}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
