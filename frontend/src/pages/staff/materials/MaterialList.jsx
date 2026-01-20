import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { studyMaterialApi, courseApi, staffCourseApi } from '../../../services/api';
import '../../../styles/Table.css';

const MaterialList = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [staffCourses, setStaffCourses] = useState([]);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [materialData, courseData, scData] = await Promise.all([
                studyMaterialApi.getAll(),
                courseApi.getAll(),
                staffCourseApi.getAll()
            ]);
            // Filter to only show parent materials (those without parent_id)
            const parentMaterials = materialData.filter(m => !m.parent_id);
            setMaterials(parentMaterials);
            setCourses(courseData);
            setStaffCourses(scData);
        } catch (error) {
            console.error('Error loading materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCourseName = (staffCourseId) => {
        const sc = staffCourses.find(s => s.id === staffCourseId);
        if (sc) {
            const course = courses.find(c => c.id === sc.course_id);
            return course?.course_name || 'N/A';
        }
        return 'N/A';
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'youtube': return '🔗';
            case 'video': return '📹';
            case 'pdf': return '📄';
            case 'ppt': return '📊';
            default: return '📁';
        }
    };

    const toggleExpand = (id) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this material and all its sub-materials?')) {
            try {
                await studyMaterialApi.delete(id);
                loadData();
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    const renderMaterial = (mat, isChild = false) => (
        <tr key={mat.id} style={{ background: isChild ? '#F9FAFB' : 'transparent' }}>
            <td style={{ paddingLeft: isChild ? '2.5rem' : '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!isChild && mat.children && mat.children.length > 0 && (
                        <button
                            onClick={() => toggleExpand(mat.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#8b5cf6',
                                fontSize: '0.8rem'
                            }}
                        >
                            {expandedIds.has(mat.id) ? '▼' : '▶'}
                        </button>
                    )}
                    {isChild && <span style={{ color: '#9CA3AF', marginRight: '0.25rem' }}>└</span>}
                    <span>{getTypeIcon(mat.file_type)}</span>
                    <span style={{ color: '#111827', fontWeight: 500 }}>{mat.title}</span>
                    {!isChild && mat.children && mat.children.length > 0 && (
                        <span style={{
                            fontSize: '0.7rem',
                            background: '#F3F4F6',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '10px',
                            color: '#6B7280',
                            border: '1px solid #E5E7EB'
                        }}>
                            +{mat.children.length}
                        </span>
                    )}
                </div>
            </td>
            <td style={{ color: '#374151' }}>{!isChild ? getCourseName(mat.staff_course_id) : ''}</td>
            <td>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    background: '#F3F4F6',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    color: '#374151',
                    border: '1px solid #E5E7EB'
                }}>
                    {mat.file_type?.toUpperCase() || 'FILE'}
                </span>
            </td>
            <td style={{ color: '#6B7280' }}>{mat.upload_date ? new Date(mat.upload_date).toLocaleDateString() : 'N/A'}</td>
            <td>
                {mat.file_path && (
                    <a href={mat.file_path} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', marginRight: '0.75rem', textDecoration: 'none', fontWeight: 500 }}>
                        View
                    </a>
                )}
                {!isChild && (
                    <button
                        onClick={() => navigate(`/staff/materials/new?parent=${mat.id}`)}
                        style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', marginRight: '0.75rem', fontWeight: 500 }}
                    >
                        + Sub
                    </button>
                )}
                <button
                    onClick={() => handleDelete(mat.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 500 }}
                >
                    Delete
                </button>
            </td>
        </tr>
    );

    if (loading) return <div className="card"><p>Loading...</p></div>;

    return (
        <div className="card">
            <div className="page-header">
                <h2>Study Materials</h2>
                <div style={{ width: '200px' }}>
                    <Button onClick={() => navigate('/staff/materials/new')}>Upload Material</Button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Course</th>
                        <th>Type</th>
                        <th>Upload Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {materials.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No materials uploaded yet</td></tr>
                    ) : materials.map((mat) => (
                        <React.Fragment key={mat.id}>
                            {renderMaterial(mat)}
                            {expandedIds.has(mat.id) && mat.children && mat.children.map(child => renderMaterial(child, true))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MaterialList;
