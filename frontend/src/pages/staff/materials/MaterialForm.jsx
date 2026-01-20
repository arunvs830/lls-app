import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { courseApi, studyMaterialApi, staffCourseApi } from '../../../services/api';

const MaterialForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const parentId = searchParams.get('parent');

    const [myCourses, setMyCourses] = useState([]);
    const [parentMaterial, setParentMaterial] = useState(null);
    const [materialType, setMaterialType] = useState('youtube');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file_path: '',
        file_type: 'youtube',
        course_id: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const staffId = 1;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [courseData, allocations] = await Promise.all([
                courseApi.getAll(),
                staffCourseApi.getAll()
            ]);
            const myAllocations = allocations.filter(a => a.staff_id === staffId);
            const myCourseIds = myAllocations.map(a => a.course_id);
            setMyCourses(courseData.filter(c => myCourseIds.includes(c.id)));

            // If adding sub-material, load parent info
            if (parentId) {
                const parent = await studyMaterialApi.getOne(parentId);
                setParentMaterial(parent);
            }
        } catch (error) {
            console.error('Error loading:', error);
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
            setFormData({ ...formData, file_path: file.name });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let data;
            if (selectedFile && materialType !== 'youtube') {
                data = new FormData();
                data.append('title', formData.title);
                data.append('description', formData.description);
                data.append('file_type', formData.file_type);
                data.append('file', selectedFile);
            } else {
                data = {
                    title: formData.title,
                    description: formData.description,
                    file_path: formData.file_path,
                    file_type: formData.file_type
                };
            }

            if (parentId) {
                // Adding sub-material
                await studyMaterialApi.addChild(parentId, data);
            } else {
                // Adding new material
                if (!formData.course_id) {
                    alert('Please select a course');
                    setLoading(false);
                    return;
                }
                await studyMaterialApi.addToCourse(formData.course_id, data);
            }
            navigate('/staff/materials');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to upload material');
        } finally {
            setLoading(false);
        }
    };

    const typeButtons = [
        { id: 'youtube', label: '🔗 YouTube Link', color: '#ef4444' },
        { id: 'video', label: '📹 Video File', color: '#8b5cf6' },
        { id: 'pdf', label: '📄 PDF File', color: '#3b82f6' },
        { id: 'ppt', label: '📊 PowerPoint', color: '#f59e0b' },
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
            <h2 style={{ color: '#1F2937', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                {parentId ? 'Add Sub-Material' : 'Upload Study Material'}
            </h2>

            {parentMaterial && (
                <div style={{
                    background: '#F3F4F6',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '1px solid #E5E7EB'
                }}>
                    <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>Adding under: </span>
                    <span style={{ color: '#8b5cf6', fontWeight: 500 }}>{parentMaterial.title}</span>
                </div>
            )}

            {/* Material Type Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#374151', display: 'block', marginBottom: '0.75rem', fontWeight: 500 }}>
                    Material Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {typeButtons.map(btn => (
                        <button
                            key={btn.id}
                            type="button"
                            onClick={() => handleTypeChange(btn.id)}
                            style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                border: materialType === btn.id ? `2px solid ${btn.color}` : '1px solid #E5E7EB',
                                background: materialType === btn.id ? `${btn.color}15` : '#fff',
                                color: materialType === btn.id ? btn.color : '#6B7280',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                height: '100px'
                            }}
                        >
                            <div style={{ fontSize: '1.5rem' }}>{btn.label.split(' ')[0]}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{btn.label.split(' ').slice(1).join(' ')}</div>
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Course Selector - only show if not adding sub-material */}
                {!parentId && (
                    <div className="input-field-wrapper">
                        <label className="input-label">Course</label>
                        <select
                            id="course_id"
                            className="input-element"
                            value={formData.course_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Course...</option>
                            {myCourses.map(c => <option key={c.id} value={c.id}>{c.course_name} ({c.program_code})</option>)}
                        </select>
                    </div>
                )}

                <InputField
                    id="title"
                    label="Title"
                    placeholder={parentId ? 'e.g. Additional Notes' : 'e.g. Lesson 1'}
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <div className="input-field-wrapper">
                    <label className="input-label">Description</label>
                    <textarea
                        id="description"
                        className="input-element"
                        placeholder="Describe what students will learn..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        style={{ resize: 'vertical' }}
                    />
                </div>

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

                {(materialType === 'video' || materialType === 'pdf' || materialType === 'ppt') && (
                    <div className="input-field-wrapper">
                        <label className="input-label">{getFileTypeLabel()} File</label>
                        <div style={{
                            border: '2px dashed #D1D5DB',
                            borderRadius: '12px',
                            padding: '2rem',
                            textAlign: 'center',
                            background: selectedFile ? '#ECFDF5' : '#F9FAFB',
                            borderColor: selectedFile ? '#10B981' : '#D1D5DB'
                        }}>
                            {selectedFile ? (
                                <>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                                    <p style={{ color: '#10B981', fontWeight: 500 }}>{selectedFile.name}</p>
                                    <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedFile(null); setFormData({ ...formData, file_path: '' }); }}
                                        style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#EF4444', cursor: 'pointer' }}
                                    >
                                        Remove
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                        {materialType === 'video' ? '📹' : materialType === 'pdf' ? '📄' : '📊'}
                                    </div>
                                    <p style={{ color: '#6B7280', marginBottom: '1rem' }}>Drag & drop or click to upload</p>
                                    <input type="file" accept={getAcceptType()} onChange={handleFileChange} style={{ display: 'none' }} id="fileInput" required />
                                    <label htmlFor="fileInput" style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'inline-block' }}>
                                        Choose File
                                    </label>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Uploading...' : parentId ? 'Add Sub-Material' : 'Upload Material'}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/staff/materials')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default MaterialForm;
