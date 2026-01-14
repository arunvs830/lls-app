import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { courseApi, studyMaterialApi } from '../../../services/api';
import '../../../styles/VideoLearning.css';

const AddVideoForm = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [materialType, setMaterialType] = useState('youtube');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file_path: '',
        file_type: 'youtube'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        try {
            const courses = await courseApi.getAll();
            const found = courses.find(c => c.id === parseInt(courseId));
            setCourse(found);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleTypeChange = (type) => {
        setMaterialType(type);
        setFormData({ ...formData, file_type: type, file_path: '' });
        setSelectedFile(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // For now, store filename - in production would upload to server
            setFormData({ ...formData, file_path: file.name });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let data;
            // For file uploads, use FormData
            if (selectedFile && materialType !== 'youtube') {
                data = new FormData();
                data.append('title', formData.title);
                data.append('description', formData.description);
                data.append('file_type', formData.file_type);
                data.append('file', selectedFile);
            } else {
                // For YouTube links, use JSON
                data = formData;
            }

            await studyMaterialApi.addToCourse(courseId, data);
            navigate(`/staff/course/${courseId}/videos`);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Failed to add material. Make sure a staff member is assigned to this course.');
        } finally {
            setLoading(false);
        }
    };

    const typeButtons = [
        { id: 'youtube', label: '🔗 YouTube Link', color: '#ef4444' },
        { id: 'video', label: '📹 Video File', color: '#8b5cf6' },
        { id: 'pdf', label: '📄 PDF File', color: '#3b82f6' },
        { id: 'ppt', label: '📊 PowerPoint File', color: '#f59e0b' },
    ];

    const getAcceptType = () => {
        switch (materialType) {
            case 'video': return 'video/*';
            case 'pdf': return '.pdf';
            case 'ppt': return '.ppt,.pptx';
            default: return '*';
        }
    };

    const getFileTypeLabel = () => {
        switch (materialType) {
            case 'video': return 'Video';
            case 'pdf': return 'PDF';
            case 'ppt': return 'PowerPoint';
            default: return 'File';
        }
    };

    return (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button onClick={() => navigate(`/staff/course/${courseId}/videos`)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem' }}>
                ← Back to {course?.course_name || 'Course'}
            </button>

            <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Add Study Material</h2>

            {/* Material Type Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '0.75rem', fontWeight: 500 }}>
                    Material Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {typeButtons.map(btn => (
                        <button
                            key={btn.id}
                            type="button"
                            onClick={() => handleTypeChange(btn.id)}
                            style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                border: materialType === btn.id ? `2px solid ${btn.color}` : '2px solid rgba(255,255,255,0.1)',
                                background: materialType === btn.id ? `${btn.color}15` : 'rgba(255,255,255,0.03)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{btn.label.split(' ')[0]}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{btn.label.split(' ').slice(1).join(' ')}</div>
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <InputField
                    id="title"
                    label="Title"
                    placeholder={
                        materialType === 'youtube' ? 'e.g. German Alphabet - Introduction Video' :
                            materialType === 'video' ? 'e.g. Lesson 1 - Greetings' :
                                materialType === 'pdf' ? 'e.g. Course Syllabus' :
                                    'e.g. Week 1 Slides'
                    }
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <div className="input-field-wrapper">
                    <label className="input-label">Description</label>
                    <textarea
                        id="description"
                        className="input-element"
                        placeholder="Describe what students will learn from this material..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* YouTube Link Input */}
                {materialType === 'youtube' && (
                    <InputField
                        id="file_path"
                        label="YouTube Video URL"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={formData.file_path}
                        onChange={handleChange}
                        required
                    />
                )}

                {/* File Upload for Video, PDF, PPT */}
                {(materialType === 'video' || materialType === 'pdf' || materialType === 'ppt') && (
                    <div className="input-field-wrapper">
                        <label className="input-label">{getFileTypeLabel()} File</label>
                        <div style={{
                            border: '2px dashed rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            padding: '2rem',
                            textAlign: 'center',
                            background: selectedFile ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                            borderColor: selectedFile ? '#10b981' : 'rgba(255,255,255,0.2)'
                        }}>
                            {selectedFile ? (
                                <>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
                                    <p style={{ color: '#10b981', fontWeight: 500, marginBottom: '0.5rem' }}>
                                        {selectedFile.name}
                                    </p>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setFormData({ ...formData, file_path: '' });
                                        }}
                                        style={{
                                            marginTop: '0.75rem',
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        Remove
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                                        {materialType === 'video' ? '📹' : materialType === 'pdf' ? '📄' : '📊'}
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                        Drag & drop your {getFileTypeLabel()} file here
                                    </p>
                                    <input
                                        type="file"
                                        accept={getAcceptType()}
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        id="fileInput"
                                        required
                                    />
                                    <label
                                        htmlFor="fileInput"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            display: 'inline-block'
                                        }}
                                    >
                                        Choose File
                                    </label>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Material'}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(`/staff/course/${courseId}/videos`)}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddVideoForm;
