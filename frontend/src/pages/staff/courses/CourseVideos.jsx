import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi, studyMaterialApi, assignmentApi, API_ORIGIN } from '../../../services/api';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/CourseVideos.css';

const CourseVideos = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { success, error: notifyError } = useNotification();
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [materialAssignments, setMaterialAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Confirm Dialog State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        loadData();
    }, [courseId]);

    // Fetch assignments when material changes
    useEffect(() => {
        if (selectedMaterial) {
            loadAssignments(selectedMaterial.id);
        } else {
            setMaterialAssignments([]);
        }
    }, [selectedMaterial]);

    const loadData = async () => {
        try {
            const [courses, materialData] = await Promise.all([
                courseApi.getAll(),
                studyMaterialApi.getByCourse(courseId)
            ]);
            const foundCourse = courses.find(c => c.id === parseInt(courseId));
            setCourse(foundCourse);
            setMaterials(materialData);
            if (materialData.length > 0) {
                if (!selectedMaterial) setSelectedMaterial(materialData[0]);
                else {
                    const updated = materialData.find(m => m.id === selectedMaterial.id);
                    if (updated) setSelectedMaterial(updated);
                }
            }
        } catch (error) {
            console.error('Error loading:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAssignments = async (materialId) => {
        try {
            const assignments = await assignmentApi.getByMaterial(materialId);
            setMaterialAssignments(assignments);
        } catch (error) {
            console.error('Error loading assignments:', error);
            setMaterialAssignments([]);
        }
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await studyMaterialApi.delete(itemToDelete);
            success('Material deleted successfully');
            loadData();
            // If the deleted material was selected, clear selection or selection logic keys off re-fetch
            if (selectedMaterial?.id === itemToDelete) {
                setSelectedMaterial(null);
            }
        } catch (err) {
            console.error('Error deleting:', err);
            notifyError('Failed to delete material');
        } finally {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    const getTypeIcon = (type) => ({ youtube: '🎬', pdf: '📄', ppt: '📊', video: '📹' }[type] || '📁');
    const getTypeClass = (type) => `cv-type-${type || 'default'}`;

    const getVideoId = (url) => {
        if (!url) return null;
        if (url.includes('watch?v=')) return url.split('watch?v=')[1].split('&')[0];
        if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
        return null;
    };

    // Helper to get full URL for file downloads
    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        if (filePath.startsWith('/api')) {
            return `${API_ORIGIN}${filePath}`;
        }
        if (filePath.startsWith('http')) {
            return filePath;
        }
        return null;
    };

    if (loading) return <div className="cv-loading">Loading experience...</div>;

    const typeClass = selectedMaterial ? getTypeClass(selectedMaterial?.file_type) : '';

    return (
        <div className="course-videos-page">
            {/* Elegant Header */}
            <header className="cv-header">
                <div className="cv-header-title-area">
                    <button onClick={() => navigate('/staff/my-courses')} className="cv-back-link">
                        <span>←</span> My Courses
                    </button>
                    <h1 className="cv-page-title">{course?.course_name || 'Course Content'}</h1>
                </div>
                <div className="cv-header-actions">
                    <button
                        onClick={() => navigate(`/staff/course/${courseId}/videos/new`)}
                        className="cv-add-material-btn"
                    >
                        + Add New Material
                    </button>
                </div>
            </header>

            <div className="cv-content-grid">
                {/* Primary Content Column */}
                <main className="cv-main-content">
                    {/* Player Card */}
                    <div className="cv-player-container">
                        <div className="cv-aspect-ratio-box">
                            {selectedMaterial?.file_type === 'youtube' && getVideoId(selectedMaterial.file_path) ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${getVideoId(selectedMaterial.file_path)}?modestbranding=1&rel=0`}
                                    className="cv-iframe"
                                    allowFullScreen
                                    title={selectedMaterial.title}
                                />
                            ) : selectedMaterial?.file_type === 'pdf' && getFileUrl(selectedMaterial.file_path) ? (
                                // Embedded PDF Viewer
                                <iframe
                                    src={getFileUrl(selectedMaterial.file_path)}
                                    className="cv-iframe"
                                    title={selectedMaterial.title}
                                />
                            ) : selectedMaterial?.file_type === 'ppt' && getFileUrl(selectedMaterial.file_path) ? (
                                // Enhanced PPT Preview
                                <div className="cv-ppt-preview-container">
                                    <div className="cv-slide-frame">
                                        <div className="cv-slide-mockup">
                                            <div className="cv-slide-header">
                                                <div className="cv-slide-header-bar">
                                                    <span className="cv-slide-window-dot"></span>
                                                    <span className="cv-slide-window-dot" style={{ background: '#FBBF24' }}></span>
                                                    <span className="cv-slide-window-dot" style={{ background: '#34D399' }}></span>
                                                </div>
                                            </div>
                                            <div className="cv-slide-content">
                                                {selectedMaterial.thumbnail_path ? (
                                                    <img
                                                        src={getFileUrl(selectedMaterial.thumbnail_path)}
                                                        alt="PPT Preview"
                                                        className="cv-slide-image"
                                                    />
                                                ) : (
                                                    <div className="cv-slide-mockup-content">
                                                        <div className="cv-slide-icon">📊</div>
                                                        <h3 className="cv-slide-title-mock">{selectedMaterial.title}</h3>
                                                        <p className="cv-slide-sub-mock">PowerPoint Presentation</p>
                                                        <div className="cv-slide-bars">
                                                            <div className="cv-slide-bar" style={{ width: '80%' }}></div>
                                                            <div className="cv-slide-bar" style={{ width: '60%' }}></div>
                                                            <div className="cv-slide-bar" style={{ width: '70%' }}></div>
                                                        </div>
                                                        <p className="cv-no-preview-text">No preview available</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cv-ppt-actions">
                                        <a
                                            href={getFileUrl(selectedMaterial.file_path)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="cv-ppt-download-btn"
                                        >
                                            📥 Download & Open
                                        </a>
                                    </div>
                                </div>
                            ) : selectedMaterial ? (
                                <div className={`cv-non-video-placeholder ${typeClass}`}>
                                    <div className="cv-large-icon" style={{ color: 'var(--type-color)' }}>
                                        {getTypeIcon(selectedMaterial.file_type)}
                                    </div>
                                    <h3 className="cv-placeholder-title">{selectedMaterial.title}</h3>
                                    {getFileUrl(selectedMaterial.file_path) && (
                                        <a href={getFileUrl(selectedMaterial.file_path)} target="_blank" rel="noopener noreferrer"
                                            className="cv-primary-btn"
                                            style={{ background: 'var(--type-color)' }}>
                                            View {selectedMaterial.file_type?.toUpperCase()}
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="cv-empty-player">
                                    <p>Select a material to begin learning</p>
                                </div>
                            )}
                        </div>

                        {/* Info Section beneath player */}
                        {selectedMaterial && (
                            <div className={`cv-selection-info ${typeClass}`}>
                                <div className="cv-info-top-row">
                                    <span className="cv-status-tag">
                                        {selectedMaterial.file_type?.toUpperCase()}
                                    </span>
                                    <span className="cv-upload-time">
                                        Uploaded on {selectedMaterial.upload_date ? new Date(selectedMaterial.upload_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date'}
                                    </span>
                                </div>
                                <h2 className="cv-selected-title">{selectedMaterial.title}</h2>
                                {selectedMaterial.description && (
                                    <p className="cv-selected-desc">{selectedMaterial.description}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sub-materials / Related Column */}
                    {selectedMaterial?.children?.length > 0 && (
                        <div className="cv-related-section">
                            <h3 className="cv-section-heading">
                                <span style={{ marginRight: '8px', opacity: 0.8 }}>📎</span>
                                Attachments & Related
                                <span className="cv-count-badge">{selectedMaterial.children.length}</span>
                            </h3>
                            <div className="cv-related-list">
                                {selectedMaterial.children.map(child => (
                                    <div key={child.id} className={`cv-attachment-card ${getTypeClass(child.file_type)}`}>
                                        <div className="cv-attachment-core">
                                            <div className="cv-attachment-icon">
                                                {getTypeIcon(child.file_type)}
                                            </div>
                                            <div className="cv-attachment-meta">
                                                <div className="cv-attachment-name">{child.title}</div>
                                                <div className="cv-attachment-type">
                                                    {child.file_type?.toUpperCase()} DOCUMENT
                                                </div>
                                            </div>
                                            {getFileUrl(child.file_path) && (
                                                <a href={getFileUrl(child.file_path)} target="_blank" rel="noopener noreferrer"
                                                    className="cv-action-btn-outline">
                                                    Open File
                                                </a>
                                            )}
                                        </div>
                                        {child.description && (
                                            <div className="cv-attachment-body">
                                                <p className="cv-attachment-desc">{child.description}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assignments for this Material */}
                    {selectedMaterial && (
                        <div className="cv-assignment-section">
                            <div className="cv-assignment-header">
                                <h3 className="cv-section-heading">
                                    <span style={{ marginRight: '8px' }}>📝</span>
                                    Assignments
                                    <span className="cv-count-badge">{materialAssignments.length}</span>
                                </h3>
                                <button
                                    onClick={() => navigate(`/staff/assignments/new?study_material_id=${selectedMaterial.id}&course_id=${courseId}`)}
                                    className="cv-add-btn"
                                >
                                    + Add Assignment
                                </button>
                            </div>
                            {materialAssignments.length === 0 ? (
                                <div className="cv-empty-assignments">
                                    <p>No assignments for this material yet.</p>
                                </div>
                            ) : (
                                <div className="cv-assignment-list">
                                    {materialAssignments.map(a => (
                                        <div key={a.id} className="cv-assignment-card">
                                            <div className="cv-assignment-card-header">
                                                <div>
                                                    <div className="cv-assignment-title">{a.title}</div>
                                                    <div className="cv-assignment-meta">
                                                        <span>📅 Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}</span>
                                                        <span style={{ marginLeft: '1rem' }}>🎯 {a.max_marks} marks</span>
                                                    </div>
                                                </div>
                                                <div className="cv-assignment-actions">
                                                    <button
                                                        onClick={() => navigate(`/staff/assignments/${a.id}/submissions`)}
                                                        className="cv-view-submissions-btn"
                                                    >
                                                        View Submissions
                                                    </button>
                                                </div>
                                            </div>
                                            {a.description && (
                                                <p className="cv-assignment-desc">{a.description}</p>
                                            )}
                                            {a.file_path && (
                                                <a href={`${API_ORIGIN}${a.file_path}`} target="_blank" rel="noopener noreferrer" className="cv-download-link">
                                                    📎 Download Question File
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quiz Questions for this Material */}
                    {selectedMaterial && (
                        <div className="cv-quiz-section">
                            <div className="cv-quiz-header">
                                <h3 className="cv-section-heading">
                                    <span style={{ marginRight: '8px' }}>❓</span>
                                    Quiz Questions
                                </h3>
                                <button
                                    onClick={() => navigate(`/staff/mcqs/new?study_material_id=${selectedMaterial.id}&course_id=${courseId}`)}
                                    className="cv-add-btn"
                                >
                                    + Add Quiz Question
                                </button>
                            </div>
                            <div className="cv-quiz-info">
                                <p className="cv-quiz-info-text">
                                    Create quiz questions for students to test their understanding of this material.
                                </p>
                                <button
                                    onClick={() => navigate(`/staff/mcqs?study_material_id=${selectedMaterial.id}`)}
                                    className="cv-view-questions-btn"
                                >
                                    View All Questions →
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                {/* Navigation Sidebar */}
                <aside className="cv-sidebar">
                    <div className="cv-sidebar-frame">
                        <div className="cv-sidebar-header">
                            <h4 className="cv-sidebar-title">Curriculum</h4>
                            <div className="cv-sidebar-stats">{materials.length} items</div>
                        </div>
                        <div className="cv-scrollable-list">
                            {materials.length === 0 ? (
                                <div className="cv-empty-sidebar">No materials found</div>
                            ) : materials.map(m => (
                                <div
                                    key={m.id}
                                    className={`cv-nav-item ${selectedMaterial?.id === m.id ? 'active' : ''} ${getTypeClass(m.file_type)}`}
                                    onClick={() => setSelectedMaterial(m)}
                                >
                                    <div className="cv-nav-icon">
                                        {getTypeIcon(m.file_type)}
                                    </div>
                                    <div className="cv-nav-text">
                                        <div className="cv-nav-label">
                                            {m.title}
                                        </div>
                                        <div className="cv-nav-sub">
                                            {m.file_type?.toUpperCase()}
                                            {m.children?.length > 0 && (
                                                <span className="cv-inline-count">• {m.children.length} attachments</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(m.id); }}
                                        className="cv-nav-delete"
                                        title="Delete"
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Material"
                message="Are you sure you want to delete this material? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default CourseVideos;
