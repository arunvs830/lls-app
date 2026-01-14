import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi, studyMaterialApi, assignmentApi } from '../../../services/api';
import Button from '../../../components/Button';

const CourseVideos = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [materialAssignments, setMaterialAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id) => {
        if (confirm('Delete this material?')) {
            try {
                await studyMaterialApi.delete(id);
                loadData();
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    const getTypeIcon = (type) => ({ youtube: '🎬', pdf: '📄', ppt: '📊', video: '📹' }[type] || '📁');
    const getTypeColor = (type) => ({ youtube: '#FF0000', pdf: '#00A3FF', ppt: '#FF9900' }[type] || '#A855F7');

    const getVideoId = (url) => {
        if (!url) return null;
        if (url.includes('watch?v=')) return url.split('watch?v=')[1].split('&')[0];
        if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
        return null;
    };

    // Helper to get full URL for file downloads
    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        // If it starts with /api, prepend backend URL
        if (filePath.startsWith('/api')) {
            return `http://localhost:5001${filePath}`;
        }
        // If it's already a full URL (http/https), return as is
        if (filePath.startsWith('http')) {
            return filePath;
        }
        // Otherwise, it's probably an old relative path - return null to avoid navigation issues
        return null;
    };

    if (loading) return <div style={styles.loading}>Loading experience...</div>;

    return (
        <div style={styles.pageWrapper}>
            {/* Elegant Header */}
            <header style={styles.header}>
                <div style={styles.headerTitleArea}>
                    <button onClick={() => navigate('/staff/my-courses')} style={styles.backLink}>
                        <span style={{ marginRight: '6px' }}>←</span> My Courses
                    </button>
                    <h1 style={styles.pageTitle}>{course?.course_name || 'Course Content'}</h1>
                </div>
                <div style={styles.headerActions}>
                    <button
                        onClick={() => navigate(`/staff/course/${courseId}/videos/new`)}
                        style={styles.addMaterialBtn}
                    >
                        + Add New Material
                    </button>
                </div>
            </header>

            <div style={styles.contentGrid}>
                {/* Primary Content Column */}
                <main style={styles.mainContent}>
                    {/* Player Card */}
                    <div style={styles.playerContainer}>
                        <div style={styles.aspectRatioBox}>
                            {selectedMaterial?.file_type === 'youtube' && getVideoId(selectedMaterial.file_path) ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${getVideoId(selectedMaterial.file_path)}?modestbranding=1&rel=0`}
                                    style={styles.iframe}
                                    allowFullScreen
                                    title={selectedMaterial.title}
                                />
                            ) : selectedMaterial?.file_type === 'pdf' && getFileUrl(selectedMaterial.file_path) ? (
                                // Embedded PDF Viewer
                                <iframe
                                    src={getFileUrl(selectedMaterial.file_path)}
                                    style={styles.iframe}
                                    title={selectedMaterial.title}
                                />
                            ) : selectedMaterial?.file_type === 'ppt' && getFileUrl(selectedMaterial.file_path) ? (
                                // Enhanced PPT Preview with actual thumbnail or slide mockup
                                <div style={styles.pptPreviewContainer}>
                                    <div style={styles.slideFrame}>
                                        <div style={styles.slideMockup}>
                                            <div style={styles.slideHeader}>
                                                <div style={styles.slideHeaderBar}>
                                                    <span style={styles.slideWindowDot}></span>
                                                    <span style={{ ...styles.slideWindowDot, background: '#FBBF24' }}></span>
                                                    <span style={{ ...styles.slideWindowDot, background: '#34D399' }}></span>
                                                </div>
                                            </div>
                                            <div style={styles.slideContent}>
                                                {selectedMaterial.thumbnail_path ? (
                                                    <img
                                                        src={getFileUrl(selectedMaterial.thumbnail_path)}
                                                        alt="PPT Preview"
                                                        style={styles.slideImage}
                                                    />
                                                ) : (
                                                    <div style={styles.slideMockupContent}>
                                                        <div style={styles.slideIcon}>📊</div>
                                                        <h3 style={styles.slideTitleMock}>{selectedMaterial.title}</h3>
                                                        <p style={styles.slideSubMock}>PowerPoint Presentation</p>
                                                        <div style={styles.slideBars}>
                                                            <div style={{ ...styles.slideBar, width: '80%' }}></div>
                                                            <div style={{ ...styles.slideBar, width: '60%' }}></div>
                                                            <div style={{ ...styles.slideBar, width: '70%' }}></div>
                                                        </div>
                                                        <p style={styles.noPreviewText}>No preview available</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.pptActions}>
                                        <a
                                            href={getFileUrl(selectedMaterial.file_path)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={styles.pptDownloadBtn}
                                        >
                                            📥 Download & Open
                                        </a>
                                    </div>
                                </div>
                            ) : selectedMaterial ? (
                                <div style={styles.nonVideoPlaceholder}>
                                    <div style={{ ...styles.largeIcon, color: getTypeColor(selectedMaterial.file_type) }}>
                                        {getTypeIcon(selectedMaterial.file_type)}
                                    </div>
                                    <h3 style={styles.placeholderTitle}>{selectedMaterial.title}</h3>
                                    {getFileUrl(selectedMaterial.file_path) && (
                                        <a href={getFileUrl(selectedMaterial.file_path)} target="_blank" rel="noopener noreferrer"
                                            style={{ ...styles.primaryBtn, background: getTypeColor(selectedMaterial.file_type) }}>
                                            View {selectedMaterial.file_type?.toUpperCase()}
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div style={styles.emptyPlayerPlaceholder}>
                                    <p>Select a material to begin learning</p>
                                </div>
                            )}
                        </div>

                        {/* Info Section beneath player */}
                        {selectedMaterial && (
                            <div style={styles.selectionInfo}>
                                <div style={styles.infoTopRow}>
                                    <span style={{
                                        ...styles.statusTag,
                                        backgroundColor: `${getTypeColor(selectedMaterial.file_type)}15`,
                                        color: getTypeColor(selectedMaterial.file_type),
                                        borderColor: `${getTypeColor(selectedMaterial.file_type)}30`
                                    }}>
                                        {selectedMaterial.file_type?.toUpperCase()}
                                    </span>
                                    <span style={styles.uploadTime}>
                                        Uploaded on {selectedMaterial.upload_date ? new Date(selectedMaterial.upload_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date'}
                                    </span>
                                </div>
                                <h2 style={styles.selectedTitle}>{selectedMaterial.title}</h2>
                                {selectedMaterial.description && (
                                    <p style={styles.selectedDesc}>{selectedMaterial.description}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sub-materials / Related Column */}
                    {selectedMaterial?.children?.length > 0 && (
                        <div style={styles.relatedSection}>
                            <h3 style={styles.sectionHeading}>
                                <span style={{ marginRight: '8px', opacity: 0.8 }}>📎</span>
                                Attachments & Related
                                <span style={styles.countBadge}>{selectedMaterial.children.length}</span>
                            </h3>
                            <div style={styles.relatedList}>
                                {selectedMaterial.children.map(child => (
                                    <div key={child.id} style={styles.attachmentCard}>
                                        <div style={styles.attachmentCore}>
                                            <div style={{ ...styles.attachmentIcon, backgroundColor: `${getTypeColor(child.file_type)}12` }}>
                                                {getTypeIcon(child.file_type)}
                                            </div>
                                            <div style={styles.attachmentMeta}>
                                                <div style={styles.attachmentName}>{child.title}</div>
                                                <div style={{ ...styles.attachmentType, color: getTypeColor(child.file_type) }}>
                                                    {child.file_type?.toUpperCase()} DOCUMENT
                                                </div>
                                            </div>
                                            {getFileUrl(child.file_path) && (
                                                <a href={getFileUrl(child.file_path)} target="_blank" rel="noopener noreferrer"
                                                    style={{ ...styles.actionBtn, borderColor: `${getTypeColor(child.file_type)}40`, color: getTypeColor(child.file_type) }}>
                                                    Open File
                                                </a>
                                            )}
                                        </div>
                                        {child.description && (
                                            <div style={styles.attachmentBody}>
                                                <p style={styles.attachmentDesc}>{child.description}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assignments for this Material */}
                    {selectedMaterial && (
                        <div style={styles.assignmentSection}>
                            <div style={styles.assignmentHeader}>
                                <h3 style={styles.sectionHeading}>
                                    <span style={{ marginRight: '8px' }}>📝</span>
                                    Assignments
                                    <span style={styles.countBadge}>{materialAssignments.length}</span>
                                </h3>
                                <button
                                    onClick={() => navigate(`/staff/assignments/new?study_material_id=${selectedMaterial.id}&course_id=${courseId}`)}
                                    style={styles.addAssignmentBtn}
                                >
                                    + Add Assignment
                                </button>
                            </div>
                            {materialAssignments.length === 0 ? (
                                <div style={styles.emptyAssignments}>
                                    <p>No assignments for this material yet.</p>
                                </div>
                            ) : (
                                <div style={styles.assignmentList}>
                                    {materialAssignments.map(a => (
                                        <div key={a.id} style={styles.assignmentCard}>
                                            <div style={styles.assignmentCardHeader}>
                                                <div>
                                                    <div style={styles.assignmentTitle}>{a.title}</div>
                                                    <div style={styles.assignmentMeta}>
                                                        <span>📅 Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}</span>
                                                        <span style={{ marginLeft: '1rem' }}>🎯 {a.max_marks} marks</span>
                                                    </div>
                                                </div>
                                                <div style={styles.assignmentActions}>
                                                    <button
                                                        onClick={() => navigate(`/staff/assignments/${a.id}/submissions`)}
                                                        style={styles.viewSubmissionsBtn}
                                                    >
                                                        View Submissions
                                                    </button>
                                                </div>
                                            </div>
                                            {a.description && (
                                                <p style={styles.assignmentDesc}>{a.description}</p>
                                            )}
                                            {a.file_path && (
                                                <a href={`http://localhost:5001${a.file_path}`} target="_blank" rel="noopener noreferrer" style={styles.downloadLink}>
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
                        <div style={styles.quizSection}>
                            <div style={styles.quizHeader}>
                                <h3 style={styles.sectionHeading}>
                                    <span style={{ marginRight: '8px' }}>❓</span>
                                    Quiz Questions
                                </h3>
                                <button
                                    onClick={() => navigate(`/staff/mcqs/new?study_material_id=${selectedMaterial.id}&course_id=${courseId}`)}
                                    style={styles.addQuizBtn}
                                >
                                    + Add Quiz Question
                                </button>
                            </div>
                            <div style={styles.quizInfo}>
                                <p style={styles.quizInfoText}>
                                    Create quiz questions for students to test their understanding of this material.
                                </p>
                                <button
                                    onClick={() => navigate(`/staff/mcqs?study_material_id=${selectedMaterial.id}`)}
                                    style={styles.viewQuestionsBtn}
                                >
                                    View All Questions →
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                {/* Navigation Sidebar */}
                <aside style={styles.sidebar}>
                    <div style={styles.sidebarFrame}>
                        <div style={styles.sidebarHeader}>
                            <h4 style={styles.sidebarTitle}>Curriculum</h4>
                            <div style={styles.sidebarStats}>{materials.length} items</div>
                        </div>
                        <div style={styles.scrollableList}>
                            {materials.length === 0 ? (
                                <div style={styles.emptySidebar}>No materials found</div>
                            ) : materials.map(m => (
                                <div
                                    key={m.id}
                                    style={{
                                        ...styles.navItem,
                                        ...(selectedMaterial?.id === m.id ? styles.navItemActive : {})
                                    }}
                                    onClick={() => setSelectedMaterial(m)}
                                >
                                    <div style={{
                                        ...styles.navIcon,
                                        backgroundColor: selectedMaterial?.id === m.id ? 'rgba(255,255,255,0.1)' : `${getTypeColor(m.file_type)}15`,
                                        color: selectedMaterial?.id === m.id ? 'white' : getTypeColor(m.file_type)
                                    }}>
                                        {getTypeIcon(m.file_type)}
                                    </div>
                                    <div style={styles.navText}>
                                        <div style={{ ...styles.navLabel, color: selectedMaterial?.id === m.id ? 'white' : 'rgba(255,255,255,0.85)' }}>
                                            {m.title}
                                        </div>
                                        <div style={styles.navSub}>
                                            {m.file_type?.toUpperCase()}
                                            {m.children?.length > 0 && (
                                                <span style={styles.inlineCount}>• {m.children.length} attachments</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                                        style={styles.navDelete}
                                        title="Delete"
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '24px',
        minHeight: '100vh',
    },
    loading: {
        height: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '1.1rem',
        letterSpacing: '0.05em'
    },

    // Header
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '32px',
    },
    headerTitleArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    backLink: {
        background: 'none',
        border: 'none',
        color: 'rgba(168, 85, 247, 0.8)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        padding: 0,
        textAlign: 'left',
        transition: 'color 0.2s',
        alignSelf: 'flex-start'
    },
    pageTitle: {
        color: '#FFFFFF',
        fontSize: '2rem',
        margin: 0,
        fontWeight: '700',
        letterSpacing: '-0.02em'
    },
    headerActions: {
        display: 'flex',
        alignItems: 'center'
    },
    addMaterialBtn: {
        backgroundColor: '#6366F1',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ':hover': {
            backgroundColor: '#4F46E5',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
        }
    },

    // Main Layout
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '32px',
        alignItems: 'start'
    },

    // Left Content
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
    },

    // Player Card
    playerContainer: {
        backgroundColor: 'rgba(17, 17, 27, 0.7)',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
    },
    aspectRatioBox: {
        position: 'relative',
        paddingTop: '56.25%', // 16:9
        backgroundColor: '#000',
    },
    iframe: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
    },
    nonVideoPlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1e2f 0%, #11111b 100%)',
    },
    largeIcon: {
        fontSize: '5rem',
        marginBottom: '20px',
        filter: 'drop-shadow(0 0 20px currentColor)'
    },
    placeholderTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: 'white',
        marginBottom: '32px'
    },
    primaryBtn: {
        padding: '14px 32px',
        borderRadius: '12px',
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'transform 0.2s',
        textAlign: 'center'
    },
    emptyPlayerPlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: '1.1rem'
    },

    // Info Area
    selectionInfo: {
        padding: '32px',
    },
    infoTopRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px'
    },
    statusTag: {
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        border: '1px solid currentColor'
    },
    uploadTime: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.85rem',
        fontWeight: '500'
    },
    selectedTitle: {
        color: '#FFFFFF',
        fontSize: '1.75rem',
        fontWeight: '700',
        margin: '0 0 16px 0',
        letterSpacing: '-0.01em'
    },
    selectedDesc: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '1.05rem',
        lineHeight: '1.7',
        margin: 0,
        maxWidth: '800px'
    },

    // Related Materials Section
    relatedSection: {
        marginTop: '8px'
    },
    sectionHeading: {
        color: '#FFFFFF',
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
    },
    countBadge: {
        marginLeft: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'rgba(255,255,255,0.7)',
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '500'
    },
    relatedList: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '16px'
    },
    attachmentCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '20px',
        padding: '20px',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }
    },
    attachmentCore: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    attachmentIcon: {
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.75rem',
        flexShrink: 0
    },
    attachmentMeta: {
        flex: 1
    },
    attachmentName: {
        color: 'white',
        fontWeight: '600',
        fontSize: '1.1rem',
        marginBottom: '4px'
    },
    attachmentType: {
        fontSize: '0.75rem',
        fontWeight: '700',
        letterSpacing: '0.04em'
    },
    actionBtn: {
        padding: '8px 20px',
        borderRadius: '10px',
        border: '1px solid',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: '600',
        transition: 'all 0.2s'
    },
    attachmentBody: {
        marginTop: '16px',
        paddingLeft: '76px', // Align with metadata
    },
    attachmentDesc: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '0.95rem',
        lineHeight: '1.6',
        margin: 0
    },

    // Sidebar Navigation
    sidebar: {
        position: 'sticky',
        top: '24px',
        height: 'calc(100vh - 48px)',
    },
    sidebarFrame: {
        backgroundColor: 'rgba(30, 30, 46, 0.6)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    },
    sidebarHeader: {
        padding: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.02)'
    },
    sidebarTitle: {
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: '600',
        margin: 0
    },
    sidebarStats: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.8rem',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    scrollableList: {
        padding: '12px',
        overflowY: 'auto',
        flex: 1
    },
    emptySidebar: {
        padding: '40px 20px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.2)',
        fontSize: '0.9rem'
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 16px',
        borderRadius: '16px',
        cursor: 'pointer',
        marginBottom: '6px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        group: true // conceptual
    },
    navItemActive: {
        backgroundColor: '#6366F1',
        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25)',
    },
    navIcon: {
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        flexShrink: 0,
        transition: 'all 0.2s'
    },
    navText: {
        flex: 1,
        minWidth: 0
    },
    navLabel: {
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    navSub: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.75rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    inlineCount: {
        color: 'rgba(168, 85, 247, 0.8)'
    },
    navDelete: {
        background: 'none',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.2)',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '0 4px',
        opacity: 0,
        transition: 'opacity 0.2s, color 0.2s',
        ':hover': {
            color: '#FF4444'
        }
    },

    // Assignment Section Styles
    assignmentSection: {
        marginTop: '2rem',
    },
    assignmentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    addAssignmentBtn: {
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    emptyAssignments: {
        padding: '2rem',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: '1px dashed rgba(255,255,255,0.1)',
    },
    assignmentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    assignmentCard: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '14px',
        padding: '1.25rem',
    },
    assignmentCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    assignmentTitle: {
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
    },
    assignmentMeta: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.85rem',
    },
    assignmentActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    viewSubmissionsBtn: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        color: '#a855f7',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: '500',
        cursor: 'pointer',
    },
    assignmentDesc: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.9rem',
        lineHeight: '1.6',
        marginTop: '0.75rem',
        marginBottom: '0',
    },
    downloadLink: {
        display: 'inline-block',
        marginTop: '0.75rem',
        color: '#10b981',
        fontSize: '0.85rem',
        textDecoration: 'none',
    },

    // Quiz Section Styles
    quizSection: {
        marginTop: '2rem',
    },
    quizHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    addQuizBtn: {
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    quizInfo: {
        padding: '1.5rem',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quizInfoText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.9rem',
        margin: 0,
    },
    viewQuestionsBtn: {
        background: 'transparent',
        color: '#a855f7',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '500',
        cursor: 'pointer',
    },

    pptPreview: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: 'linear-gradient(145deg, rgba(255, 153, 0, 0.05), rgba(255, 153, 0, 0.02))',
        borderRadius: '16px',
        padding: '2rem',
    },
    pptIcon: {
        fontSize: '5rem',
        marginBottom: '1rem',
        filter: 'drop-shadow(0 0 30px rgba(255, 153, 0, 0.3))',
    },
    pptTitle: {
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        textAlign: 'center',
    },
    pptSubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.95rem',
        marginBottom: '1.5rem',
    },
    pptActions: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    pptDownloadBtn: {
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #FF9900, #FF6600)',
        color: 'white',
        borderRadius: '10px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.95rem',
        transition: 'all 0.2s',
        boxShadow: '0 4px 15px rgba(255, 153, 0, 0.3)',
    },
    pptViewBtn: {
        padding: '12px 24px',
        background: 'rgba(255, 153, 0, 0.15)',
        color: '#FF9900',
        border: '1px solid rgba(255, 153, 0, 0.3)',
        borderRadius: '10px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.95rem',
        transition: 'all 0.2s',
    },

    // Enhanced Slide Mockup Styles
    pptPreviewContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.95)',
        padding: '24px',
    },
    slideFrame: {
        width: '100%',
        height: 'calc(100% - 60px)', // Leave room for download button
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    slideMockup: {
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    slideHeader: {
        background: 'rgba(255,255,255,0.05)',
        padding: '8px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    slideHeaderBar: {
        display: 'flex',
        gap: '6px',
    },
    slideWindowDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#EF4444',
    },
    slideContent: {
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#0a0a0a',
    },
    slideMockupContent: {
        padding: '3rem',
        textAlign: 'center',
    },
    slideIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
        filter: 'drop-shadow(0 0 20px rgba(255,153,0,0.4))',
    },
    slideTitleMock: {
        color: 'white',
        fontSize: '1.4rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
    },
    slideSubMock: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.9rem',
        marginBottom: '1.5rem',
    },
    slideBars: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        marginTop: '1rem',
    },
    slideBar: {
        height: '8px',
        background: 'linear-gradient(90deg, rgba(255,153,0,0.3), rgba(255,102,0,0.2))',
        borderRadius: '4px',
    },
    slideImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
    },
    pptActions: {
        marginTop: '16px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    },
    pptDownloadBtn: {
        background: 'linear-gradient(135deg, #FF9900, #FF6600)',
        padding: '10px 24px',
        borderRadius: '10px',
        color: 'white',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.9rem',
        boxShadow: '0 10px 20px rgba(255, 102, 0, 0.2)',
    }
};

// Add hover styles via standard CSS if needed, but keeping it inline for now
// Just need to handle the delete button visibility
const GlobalStyles = () => (
    <style>{`
        .nav-item-hover:hover .delete-btn { opacity: 1; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
    `}</style>
);

const CourseVideosWithStyles = () => (
    <>
        <GlobalStyles />
        <CourseVideos />
    </>
);

export default CourseVideosWithStyles;
