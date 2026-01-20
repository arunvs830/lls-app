import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { courseApi, assignmentApi, staffCourseApi, studyMaterialApi } from '../../../services/api';

const AssignmentForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // For edit mode
    const [searchParams] = useSearchParams();
    const initialCourseId = searchParams.get('course_id');
    const initialMaterialId = searchParams.get('study_material_id');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course_id: initialCourseId || '',
        study_material_id: initialMaterialId || '',
        due_date: '',
        max_marks: '100'
    });
    const [file, setFile] = useState(null);
    const [courses, setCourses] = useState([]); // Filtered my courses
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const staffId = 1; // TODO: Get from auth context

    useEffect(() => {
        loadInitialData();
        if (id) {
            setIsEdit(true);
            loadAssignment(id);
        }
    }, [id]);

    useEffect(() => {
        if (formData.course_id) {
            loadMaterials(formData.course_id);
        } else {
            setMaterials([]);
        }
    }, [formData.course_id]);

    const loadInitialData = async () => {
        try {
            const [allCourses, allocations] = await Promise.all([
                courseApi.getAll(),
                staffCourseApi.getAll()
            ]);

            // Filter courses assigned to this staff
            const myAllocations = allocations.filter(a => a.staff_id === staffId);
            const myCourseIds = myAllocations.map(a => a.course_id);
            const myCoursesList = allCourses.filter(c => myCourseIds.includes(c.id));

            setCourses(myCoursesList);

            // If initial course logic, load materials immediately
            if (initialCourseId) {
                loadMaterials(initialCourseId);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const loadMaterials = async (courseId) => {
        try {
            const data = await studyMaterialApi.getByCourse(courseId);
            // Flatten or just show top level? Let's show all selectable materials
            // Ideally we show parent materials or flatten the tree if assignments can be on sub-material
            // For simplicity, showing top-level and letting user search/pick might be better, 
            // but let's just fetch all and flatten for the dropdown if needed. 
            // The API getByCourse returns a list.
            setMaterials(data);
        } catch (error) {
            console.error('Error loading materials:', error);
        }
    };

    const loadAssignment = async (assignmentId) => {
        try {
            const data = await assignmentApi.getOne(assignmentId);
            setFormData({
                title: data.title,
                description: data.description || '',
                course_id: data.course_id,
                study_material_id: data.study_material_id || '',
                due_date: data.due_date ? data.due_date.substring(0, 16) : '',
                max_marks: data.max_marks
            });
            // Materials will load via useEffect when course_id is set
        } catch (error) {
            console.error('Error loading assignment:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('course_id', formData.course_id);
        if (formData.study_material_id) {
            data.append('study_material_id', formData.study_material_id);
        }
        data.append('due_date', formData.due_date);
        data.append('max_marks', formData.max_marks);
        if (file) {
            data.append('file', file);
        }

        try {
            if (isEdit) {
                await assignmentApi.update(id, data);
                alert('Assignment updated successfully!');
            } else {
                await assignmentApi.create(data);
                alert('Assignment created successfully!');
            }
            if (initialMaterialId && initialCourseId) {
                navigate(`/staff/course/${initialCourseId}/videos`);
            } else {
                navigate('/staff/assignments');
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            alert('Failed to save assignment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#1F2937', fontSize: '1.5rem', fontWeight: 'bold' }}>{isEdit ? 'Edit Assignment' : 'Create Assignment'}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <InputField id="title" label="Assignment Title" placeholder="e.g. German A1 - Week 1 Assignment" value={formData.title} onChange={handleChange} required />

                <div className="input-field-wrapper">
                    <label className="input-label" style={{ color: '#374151', fontWeight: 500 }}>Description / Instructions (Optional)</label>
                    <textarea
                        id="description"
                        className="input-element"
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide detailed instructions or the question text here..."
                        style={{ resize: 'vertical' }}
                    ></textarea>
                </div>

                <div className="input-field-wrapper">
                    <label className="input-label" style={{ color: '#374151', fontWeight: 500 }}>Upload Question File (PDF, DOCX, etc.)</label>
                    <div style={{
                        border: '2px dashed #D1D5DB',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        background: file ? '#ECFDF5' : '#F9FAFB',
                        borderColor: file ? '#10B981' : '#D1D5DB'
                    }}>
                        {file ? (
                            <>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                                <p style={{ color: '#10B981', fontWeight: 500 }}>{file.name}</p>
                                <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button type="button" onClick={() => setFile(null)} style={{ marginTop: '0.5rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                            </>
                        ) : (
                            <>
                                <p style={{ color: '#6B7280', marginBottom: '1rem' }}>Drag & drop or click to upload</p>
                                <input type="file" id="fileUpload" onChange={handleFileChange} style={{ display: 'none' }} />
                                <label htmlFor="fileUpload" style={{
                                    padding: '0.5rem 1rem',
                                    background: '#F3F4F6',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '6px',
                                    color: '#4B5563',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}>Choose File</label>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-field-wrapper">
                        <label className="input-label" style={{ color: '#374151', fontWeight: 500 }}>Course</label>
                        <select
                            id="course_id"
                            className="input-element"
                            value={formData.course_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Course...</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.course_name} ({c.program_code})</option>)}
                        </select>
                    </div>

                    <div className="input-field-wrapper">
                        <label className="input-label" style={{ color: '#374151', fontWeight: 500 }}>Study Material (Optional)</label>
                        <select
                            id="study_material_id"
                            className="input-element"
                            value={formData.study_material_id}
                            onChange={handleChange}
                            disabled={!formData.course_id}
                        >
                            <option value="">-- No linked material --</option>
                            {materials.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.file_type === 'youtube' ? '🎬' : m.file_type === 'pdf' ? '📄' : '📁'} {m.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <InputField id="due_date" type="datetime-local" label="Due Date" value={formData.due_date} onChange={handleChange} required />
                    <InputField id="max_marks" type="number" label="Max Marks" placeholder="100" value={formData.max_marks} onChange={handleChange} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update Assignment' : 'Create Assignment')}</Button>
                    <Button variant="secondary" onClick={() => {
                        if (initialMaterialId && initialCourseId) {
                            navigate(`/staff/course/${initialCourseId}/videos`);
                        } else {
                            navigate('/staff/assignments');
                        }
                    }}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default AssignmentForm;
