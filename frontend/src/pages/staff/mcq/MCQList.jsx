import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mcqApi, courseApi, staffCourseApi } from '../../../services/api';
import '../../../styles/MCQList.css';

const MCQList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const staffId = user?.id;
    const [mcqs, setMcqs] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (staffId) {
            loadData();
        }
    }, [staffId]);

    useEffect(() => {
        if (selectedCourse) {
            loadStudyMaterials(selectedCourse);
            setSelectedMaterial(''); // Reset material when course changes
        } else {
            setStudyMaterials([]);
            setSelectedMaterial('');
        }
    }, [selectedCourse]);

    useEffect(() => {
        if (staffId) {
            loadMCQs();
        }
    }, [selectedCourse, selectedMaterial, staffId]);

    const loadData = async () => {
        try {
            const [allocations, allCourses] = await Promise.all([
                staffCourseApi.getByStaff(staffId),
                courseApi.getAll()
            ]);

            const staffCourseIds = new Set(allocations.map(a => a.course_id));
            const myCourses = allCourses.filter(c => staffCourseIds.has(c.id));
            setCourses(myCourses);
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    const loadStudyMaterials = async (courseId) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/materials`);
            const data = await response.json();
            setStudyMaterials(data);
        } catch (error) {
            console.error('Error loading study materials:', error);
        }
    };

    const loadMCQs = async () => {
        setLoading(true);
        try {
            const filters = { staff_id: staffId };
            if (selectedCourse) filters.course_id = selectedCourse;
            if (selectedMaterial) filters.study_material_id = selectedMaterial;

            const data = await mcqApi.getAll(filters);
            setMcqs(data);
        } catch (error) {
            console.error('Error loading MCQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            await mcqApi.delete(id);
            loadMCQs();
        } catch (error) {
            console.error('Error deleting MCQ:', error);
        }
    };



    return (
        <div className="mcq-list-container">
            <header className="mcq-list-header">
                <div>
                    <h1 className="mcq-list-title">Quiz Questions</h1>
                    <p className="mcq-list-subtitle">{mcqs.length} questions created</p>
                </div>
                <div className="mcq-list-actions">
                    <button onClick={() => navigate('/staff/mcqs/new')} className="mcq-list-add-btn">
                        + Add Question
                    </button>
                </div>
            </header>

            {/* Filter */}
            <div className="mcq-list-filter-bar">
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="mcq-list-select"
                >
                    <option value="">All Courses</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.course_name}</option>
                    ))}
                </select>

                {selectedCourse && (
                    <select
                        value={selectedMaterial}
                        onChange={(e) => setSelectedMaterial(e.target.value)}
                        className="mcq-list-select"
                        style={{ marginLeft: '10px' }}
                    >
                        <option value="">All Materials</option>
                        {studyMaterials.map(m => (
                            <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                    </select>
                )}
            </div>

            {loading ? (
                <div className="mcq-list-loading">Loading questions...</div>
            ) : mcqs.length === 0 ? (
                <div className="mcq-list-empty-state">
                    <span className="mcq-list-empty-icon">❓</span>
                    <h3>No questions yet</h3>
                    <p>Create your first quiz question to get started!</p>
                    <button onClick={() => navigate('/staff/mcqs/new')} className="mcq-list-add-btn-secondary">
                        Create Question
                    </button>
                </div>
            ) : (
                <div className="mcq-question-list">
                    {mcqs.map((mcq, index) => (
                        <div key={mcq.id} className="mcq-question-card">
                            <div className="mcq-question-header">
                                <span className="mcq-question-number">Q{index + 1}</span>
                                <span className="mcq-course-badge">{mcq.course_name}</span>
                                <span className="mcq-marks">{mcq.marks} marks</span>
                            </div>
                            <p className="mcq-question-text">{mcq.question_text}</p>
                            <div className="mcq-options-grid">
                                {['A', 'B', 'C', 'D'].map(opt => {
                                    const optValue = mcq[`option_${opt.toLowerCase()}`];
                                    if (!optValue) return null;
                                    const isCorrect = mcq.correct_answer === opt;
                                    return (
                                        <div
                                            key={opt}
                                            className={`mcq-option ${isCorrect ? 'correct' : ''}`}
                                        >
                                            <span className="mcq-option-label">{opt}</span>
                                            <span>{optValue}</span>
                                            {isCorrect && <span className="mcq-checkmark">✓</span>}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mcq-actions">
                                <button
                                    onClick={() => navigate(`/staff/mcqs/edit/${mcq.id}`)}
                                    className="mcq-edit-btn"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(mcq.id)}
                                    className="mcq-delete-btn"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MCQList;
