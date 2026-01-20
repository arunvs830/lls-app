import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CertificateLayoutList = () => {
    const [layouts, setLayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadLayouts();
    }, []);

    const loadLayouts = async () => {
        try {
            const response = await fetch('/api/certificate-layouts');
            const data = await response.json();
            setLayouts(data);
        } catch (error) {
            console.error('Error loading layouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this certificate layout?')) return;

        try {
            await fetch(`/api/certificate-layouts/${id}`, { method: 'DELETE' });
            setLayouts(layouts.filter(layout => layout.id !== id));
        } catch (error) {
            console.error('Error deleting layout:', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="admin-list-container">
            <div className="list-header">
                <h2>Certificate Layouts</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/admin/certificates/new')}
                >
                    + Create New Layout
                </button>
            </div>

            {layouts.length === 0 ? (
                <div className="empty-state">
                    <p>No certificate layouts found. Create your first layout!</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Layout Name</th>
                                <th>Program</th>
                                <th>Default</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {layouts.map((layout) => (
                                <tr key={layout.id}>
                                    <td>{layout.layout_name}</td>
                                    <td>{layout.program?.program_name || 'N/A'}</td>
                                    <td>
                                        {layout.is_default ? (
                                            <span className="badge badge-success">Default</span>
                                        ) : (
                                            <span className="badge badge-secondary">—</span>
                                        )}
                                    </td>
                                    <td>{new Date(layout.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => navigate(`/admin/certificates/edit/${layout.id}`)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(layout.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CertificateLayoutList;
