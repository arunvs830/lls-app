import { API_ORIGIN } from '../../../services/api';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentDashboardApi, assignmentApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/CourseMaterials.css';

const CourseMaterials = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [courseData, setCourseData] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const studentId = user?.id;

    useEffect(() => {
        loadMaterials();
    }, [courseId]);

    useEffect(() => {
        if (selectedMaterial) {
            loadAssignments(selectedMaterial.id);
        } else {
            setAssignments([]);
        }
    }, [selectedMaterial]);

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

    const loadAssignments = async (materialId) => {
        try {
            // Depending on API, getByMaterial might be right.
            const data = await assignmentApi.getByMaterial(materialId);
            setAssignments(data);
        } catch (error) {
            console.error('Error loading assignments:', error);
            setAssignments([]);
        }
    };

    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_ORIGIN}${path}`;
    };

    const getVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        return match ? match[1] : null;
    };

    if (loading) {
        return (
            <div className="cm-loading">
                <div className="cm-loading-spinner"></div>
                <p className="cm-loading-text">Loading course materials...</p>
            </div>
        );
    }

    const course = courseData?.course;
    const materials = courseData?.materials || [];

    return (
        <div className="course-materials-container">
            {/* Breadcrumb */}
            <div className="cm-breadcrumb">
                <button onClick={() => navigate('/student/courses')} className="cm-breadcrumb-link">
                    ← My Courses
                </button>
                <span className="cm-breadcrumb-separator">/</span>
                <span className="cm-breadcrumb-current">{course?.course_name}</span>
            </div>

            <div className="responsive-grid-sidebar">
                {/* Main Content */}
                <main className="cm-main-content">
                    {selectedMaterial ? (
                        <>
                            {/* Player */}
                            <div className="cm-player-container">
                                <div className="cm-aspect-ratio-box">
                                    {selectedMaterial.file_type === 'youtube' && getVideoId(selectedMaterial.file_path) ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${getVideoId(selectedMaterial.file_path)}?modestbranding=1&rel=0`}
                                            className="cm-iframe"
                                            allowFullScreen
                                            title={selectedMaterial.title}
                                        />
                                    ) : selectedMaterial.file_type === 'pdf' ? (
                                        <iframe
                                            src={getFileUrl(selectedMaterial.file_path)}
                                            className="cm-iframe"
                                            title={selectedMaterial.title}
                                        />
                                    ) : selectedMaterial.file_type === 'ppt' ? (
                                        <div className="cm-ppt-preview">
                                            {selectedMaterial.thumbnail_path ? (
                                                <img
                                                    src={getFileUrl(selectedMaterial.thumbnail_path)}
                                                    alt="Slide Preview"
                                                    className="cm-slide-image"
                                                />
                                            ) : (
                                                <div className="cm-ppt-placeholder">
                                                    <span className="cm-ppt-icon">📊</span>
                                                    <p>PowerPoint Presentation</p>
                                                </div>
                                            )}
                                            <a
                                                href={getFileUrl(selectedMaterial.file_path)}
                                                download
                                                className="cm-download-btn"
                                            >
                                                📥 Download & Open
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="cm-placeholder">
                                            <span className="cm-placeholder-icon">📄</span>
                                            <p>Select a material to view</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Material Info */}
                            <div className="cm-material-info">
                                <h2 className="cm-material-title">{selectedMaterial.title}</h2>
                                <p className="cm-material-desc">{selectedMaterial.description}</p>

                                {/* Activities Section (Quizzes & Assignments) */}
                                {(selectedMaterial.mcq_count > 0 || assignments.length > 0) && (
                                    <div className="cm-activity-section">
                                        <h4 className="cm-section-title">📝 Tasks & Activities</h4>
                                        <div className="cm-activity-list">
                                            {/* Quiz Item */}
                                            {selectedMaterial.mcq_count > 0 && (
                                                <div className="cm-activity-item">
                                                    <div style={{ flex: 1 }}>
                                                        <div className="cm-activity-title">Topic Quiz</div>
                                                        <div className="cm-activity-meta">
                                                            {selectedMaterial.mcq_count} Questions • Test your knowledge
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/student/quiz/material/${selectedMaterial.id}`)}
                                                        className="cm-action-btn"
                                                    >
                                                        Take Quiz
                                                    </button>
                                                </div>
                                            )}

                                            {/* Assignment Items */}
                                            {assignments.map(a => (
                                                <div key={a.id} className="cm-activity-item">
                                                    <div style={{ flex: 1 }}>
                                                        <div className="cm-activity-title">{a.title}</div>
                                                        <div className="cm-activity-meta">
                                                            Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'} • {a.max_marks} Marks
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/student/assignments/submit/${a.id}`)}
                                                        className="cm-action-btn"
                                                    >
                                                        View Assignment
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sub-materials */}
                                {selectedMaterial.children?.length > 0 && (
                                    <div className="cm-children-section">
                                        <h4 className="cm-section-title">📎 Related Materials</h4>
                                        <div className="cm-children-list">
                                            {selectedMaterial.children.map(child => (
                                                <a
                                                    key={child.id}
                                                    href={getFileUrl(child.file_path)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="cm-child-item"
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
                        <div className="cm-empty-state">
                            <span className="cm-empty-icon">📚</span>
                            <p>No materials available for this course yet.</p>
                        </div>
                    )}
                </main>

                {/* Sidebar - Material List */}
                <aside className="cm-sidebar">
                    <h3 className="cm-sidebar-title">Course Materials</h3>
                    <div className="cm-material-list">
                        {materials.map(material => (
                            <div
                                key={material.id}
                                role="button"
                                tabIndex={0}
                                aria-selected={selectedMaterial?.id === material.id}
                                className={`cm-material-item ${selectedMaterial?.id === material.id ? 'active' : ''}`}
                                onClick={() => setSelectedMaterial(material)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedMaterial(material);
                                    }
                                }}
                            >
                                <span className="cm-material-icon">{getTypeIcon(material.file_type)}</span>
                                <div className="cm-material-meta">
                                    <span className="cm-material-name">{material.title}</span>
                                    <span className="cm-material-type">{material.file_type?.toUpperCase()}</span>
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

export default CourseMaterials;
