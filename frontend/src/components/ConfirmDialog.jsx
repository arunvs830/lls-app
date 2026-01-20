import React from 'react';

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

    const variantStyles = {
        primary: {
            background: 'linear-gradient(135deg, #14BF96, #0D8B6B)',
            hoverBg: '#10A37E',
        },
        danger: {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            hoverBg: '#dc2626',
        },
        warning: {
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            hoverBg: '#d97706',
        },
    };

    const variant = variantStyles[confirmVariant] || variantStyles.primary;

    return (
        <>
            {/* Overlay */}
            <div
                style={styles.overlay}
                onClick={onCancel}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
                style={styles.dialog}
            >
                <h2 id="confirm-dialog-title" style={styles.title}>
                    {title}
                </h2>
                <p id="confirm-dialog-message" style={styles.message}>
                    {message}
                </p>
                <div style={styles.actions}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={styles.cancelBtn}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        style={{
                            ...styles.confirmBtn,
                            background: variant.background,
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
    },
    dialog: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        zIndex: 1001,
    },
    title: {
        margin: '0 0 12px 0',
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#21272A',
    },
    message: {
        margin: '0 0 24px 0',
        color: '#5C6873',
        lineHeight: '1.5',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
    },
    cancelBtn: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid #E3E5E8',
        background: '#F5F7FA',
        color: '#21272A',
        cursor: 'pointer',
        fontWeight: '500',
    },
    confirmBtn: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '600',
    },
};

export default ConfirmDialog;
