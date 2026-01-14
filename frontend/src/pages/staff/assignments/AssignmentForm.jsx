import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { courseApi, assignmentApi, staffCourseApi } from '../../../services/api';

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
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        loadCourses();
        if (id) {
            setIsEdit(true);
            loadAssignment(id);
        }
    }, [id]);

    const loadCourses = async () => {
        try {
            const data = await courseApi.getAll();
            setCourses(data);
        } catch (error) {
            console.error('Error loading courses:', error);
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
            // Navigate back - if came from material, go back to course videos
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
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>{isEdit ? 'Edit Assignment' : 'Create Assignment'}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <InputField id="title" label="Assignment Title" placeholder="e.g. German A1 - Week 1 Assignment" value={formData.title} onChange={handleChange} required />

                <div className="input-field-wrapper">
                    <label className="input-label">Description / Instructions (Optional)</label>
                    <textarea
                        id="description"
                        className="input-element"
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide detailed instructions or the question text here..."
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}
                    ></textarea>
                </div>

                <div className="input-field-wrapper">
                    <label className="input-label">Upload Question File (PDF, DOCX, etc.)</label>
                    <input
                        type="file"
                        className="input-element"
                        onChange={handleFileChange}
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                    />
                </div>

                <div className="input-field-wrapper">
                    <label className="input-label">Course</label>
                    <select id="course_id" className="input-element" value={formData.course_id} onChange={handleChange} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }} required>
                        <option value="">Select Course...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <InputField id="due_date" type="datetime-local" label="Due Date" value={formData.due_date} onChange={handleChange} required />
                    <InputField id="max_marks" type="number" label="Max Marks" placeholder="100" value={formData.max_marks} onChange={handleChange} required />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update Assignment' : 'Create Assignment')}</Button>
                    <Button variant="secondary" onClick={() => navigate('/staff/assignments')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default AssignmentForm;
