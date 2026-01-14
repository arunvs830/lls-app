import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentDashboardApi } from '../../../services/api';

const CourseMaterials = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [loading, setLoading] = useState(true);

    const studentId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadMaterials();
    }, [courseId]);

    const loadMaterials = async () => {
        try {
            const data = await studentDashboardApi.getCourseMaterials(studentId, courseId);
            setCourseData(data);
            if (data.materials?.length > 0) {
                setSelectedMaterial(data.materials[0]);
            }
        } catch (error) {
            console.error('Error loading materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:5001${path}`;
    };

    const getVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        return match ? match[1] : null;
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading course materials...</p>
            </div>
        );
    }

    const course = courseData?.course;
    const materials = courseData?.materials || [];

    return (
        <div style={styles.container}>
            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
                <button onClick={() => navigate('/student/courses')} style={styles.breadcrumbLink}>
                    ← My Courses
                </button>
                <span style={styles.breadcrumbSeparator}>/</span>
                <span style={styles.breadcrumbCurrent}>{course?.course_name}</span>
            </div>

            <div style={styles.contentGrid}>
                {/* Main Content */}
                <main style={styles.mainContent}>
                    {selectedMaterial ? (
                        <>
                            {/* Player */}
                            <div style={styles.playerContainer}>
                                <div style={styles.aspectRatioBox}>
                                    {selectedMaterial.file_type === 'youtube' && getVideoId(selectedMaterial.file_path) ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${getVideoId(selectedMaterial.file_path)}?modestbranding=1&rel=0`}
                                            style={styles.iframe}
                                            allowFullScreen
                                            title={selectedMaterial.title}
                                        />
                                    ) : selectedMaterial.file_type === 'pdf' ? (
                                        <iframe
                                            src={getFileUrl(selectedMaterial.file_path)}
                                            style={styles.iframe}
                                            title={selectedMaterial.title}
                                        />
                                    ) : selectedMaterial.file_type === 'ppt' ? (
                                        <div style={styles.pptPreview}>
                                            {selectedMaterial.thumbnail_path ? (
                                                <img
                                                    src={getFileUrl(selectedMaterial.thumbnail_path)}
                                                    alt="Slide Preview"
                                                    style={styles.slideImage}
                                                />
                                            ) : (
                                                <div style={styles.pptPlaceholder}>
                                                    <span style={styles.pptIcon}>📊</span>
                                                    <p>PowerPoint Presentation</p>
                                                </div>
                                            )}
                                            <a
                                                href={getFileUrl(selectedMaterial.file_path)}
                                                download
                                                style={styles.downloadBtn}
                                            >
                                                📥 Download & Open
                                            </a>
                                        </div>
                                    ) : (
                                        <div style={styles.placeholder}>
                                            <span style={styles.placeholderIcon}>📄</span>
                                            <p>Select a material to view</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Material Info */}
                            <div style={styles.materialInfo}>
                                <h2 style={styles.materialTitle}>{selectedMaterial.title}</h2>
                                <p style={styles.materialDesc}>{selectedMaterial.description}</p>

                                {/* Take Quiz Button - Show if material has MCQs */}
                                {selectedMaterial.mcq_count > 0 && (
                                    <div style={styles.quizSection}>
                                        <button
                                            onClick={() => navigate(`/student/quiz/material/${selectedMaterial.id}`)}
                                            style={styles.quizBtn}
                                        >
                                            📝 Take Quiz ({selectedMaterial.mcq_count} questions)
                                        </button>
                                    </div>
                                )}

                                {/* Sub-materials */}
                                {selectedMaterial.children?.length > 0 && (
                                    <div style={styles.childrenSection}>
                                        <h4 style={styles.childrenTitle}>📎 Related Materials</h4>
                                        <div style={styles.childrenList}>
                                            {selectedMaterial.children.map(child => (
                                                <a
                                                    key={child.id}
                                                    href={getFileUrl(child.file_path)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={styles.childItem}
                                                >
                                                    <span>{getTypeIcon(child.file_type)}</span>
                                                    <span>{child.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={styles.emptyState}>
                            <span style={styles.emptyIcon}>📚</span>
                            <p>No materials available for this course yet.</p>
                        </div>
                    )}
                </main>

                {/* Sidebar - Material List */}
                <aside style={styles.sidebar}>
                    <h3 style={styles.sidebarTitle}>Course Materials</h3>
                    <div style={styles.materialList}>
                        {materials.map(material => (
                            <div
                                key={material.id}
                                style={{
                                    ...styles.materialItem,
                                    ...(selectedMaterial?.id === material.id ? styles.materialItemActive : {})
                                }}
                                onClick={() => setSelectedMaterial(material)}
                            >
                                <span style={styles.materialIcon}>{getTypeIcon(material.file_type)}</span>
                                <div style={styles.materialMeta}>
                                    <span style={styles.materialName}>{material.title}</span>
                                    <span style={styles.materialType}>{material.file_type?.toUpperCase()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const getTypeIcon = (type) => {
    switch (type) {
        case 'youtube': return '🎬';
        case 'pdf': return '📄';
        case 'ppt': return '📊';
        case 'video': return '🎥';
        default: return '📁';
    }
};

const styles = {
    container: { padding: '24px' },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
    },
    loadingSpinner: {
        width: '48px',
        height: '48px',
        border: '4px solid rgba(139, 92, 246, 0.2)',
        borderTop: '4px solid #8b5cf6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: { marginTop: '16px', color: 'rgba(255,255,255,0.6)' },

    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
    },
    breadcrumbLink: {
        background: 'none',
        border: 'none',
        color: '#8b5cf6',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    breadcrumbSeparator: { color: 'rgba(255,255,255,0.3)' },
    breadcrumbCurrent: { color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' },

    contentGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '24px',
    },
    mainContent: {},
    playerContainer: {
        background: '#000',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '20px',
    },
    aspectRatioBox: {
        position: 'relative',
        paddingTop: '56.25%',
    },
    iframe: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
    },
    pptPreview: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
    },
    slideImage: {
        maxWidth: '90%',
        maxHeight: '80%',
        objectFit: 'contain',
    },
    pptPlaceholder: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
    },
    pptIcon: { fontSize: '4rem', display: 'block', marginBottom: '12px' },
    downloadBtn: {
        marginTop: '20px',
        background: 'linear-gradient(135deg, #FF9900, #FF6600)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '10px',
        textDecoration: 'none',
        fontWeight: '600',
    },
    placeholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.3)',
    },
    placeholderIcon: { fontSize: '4rem', marginBottom: '12px' },

    materialInfo: {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.06)',
    },
    materialTitle: { color: 'white', margin: '0 0 12px 0', fontSize: '1.5rem' },
    materialDesc: { color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' },
    quizSection: {
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    quizBtn: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        border: 'none',
        color: 'white',
        padding: '14px 24px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    childrenSection: { marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' },
    childrenTitle: { color: 'white', margin: '0 0 12px 0' },
    childrenList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    childItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        color: 'white',
        textDecoration: 'none',
    },

    sidebar: {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        height: 'fit-content',
    },
    sidebarTitle: { color: 'white', margin: '0 0 16px 0', fontSize: '1.1rem' },
    materialList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    materialItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid transparent',
    },
    materialItemActive: {
        background: 'rgba(139, 92, 246, 0.15)',
        borderColor: 'rgba(139, 92, 246, 0.4)',
    },
    materialIcon: { fontSize: '1.5rem' },
    materialMeta: { display: 'flex', flexDirection: 'column' },
    materialName: { color: 'white', fontSize: '0.95rem', fontWeight: '500' },
    materialType: { color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '2px' },

    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        color: 'rgba(255,255,255,0.4)',
    },
    emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '12px' },
};

export default CourseMaterials;
