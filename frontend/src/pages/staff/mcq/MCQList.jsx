import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mcqApi, courseApi } from '../../../services/api';

const MCQList = () => {
    const navigate = useNavigate();
    const [mcqs, setMcqs] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(true);

    const staffId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadMCQs();
    }, [selectedCourse]);

    const loadData = async () => {
        try {
            const coursesData = await courseApi.getAll();
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    const loadMCQs = async () => {
        setLoading(true);
        try {
            const filters = { staff_id: staffId };
            if (selectedCourse) filters.course_id = selectedCourse;
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
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Quiz Questions</h1>
                    <p style={styles.subtitle}>{mcqs.length} questions created</p>
                </div>
                <button onClick={() => navigate('/staff/mcqs/new')} style={styles.addBtn}>
                    + Add Question
                </button>
            </header>

            {/* Filter */}
            <div style={styles.filterBar}>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    style={styles.select}
                >
                    <option value="">All Courses</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.course_name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div style={styles.loading}>Loading questions...</div>
            ) : mcqs.length === 0 ? (
                <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>❓</span>
                    <h3>No questions yet</h3>
                    <p>Create your first quiz question to get started!</p>
                    <button onClick={() => navigate('/staff/mcqs/new')} style={styles.addBtnSecondary}>
                        Create Question
                    </button>
                </div>
            ) : (
                <div style={styles.questionList}>
                    {mcqs.map((mcq, index) => (
                        <div key={mcq.id} style={styles.questionCard}>
                            <div style={styles.questionHeader}>
                                <span style={styles.questionNumber}>Q{index + 1}</span>
                                <span style={styles.courseBadge}>{mcq.course_name}</span>
                                <span style={styles.marks}>{mcq.marks} marks</span>
                            </div>
                            <p style={styles.questionText}>{mcq.question_text}</p>
                            <div style={styles.optionsGrid}>
                                {['A', 'B', 'C', 'D'].map(opt => {
                                    const optValue = mcq[`option_${opt.toLowerCase()}`];
                                    if (!optValue) return null;
                                    const isCorrect = mcq.correct_answer === opt;
                                    return (
                                        <div
                                            key={opt}
                                            style={{
                                                ...styles.option,
                                                ...(isCorrect ? styles.correctOption : {})
                                            }}
                                        >
                                            <span style={styles.optionLabel}>{opt}</span>
                                            <span>{optValue}</span>
                                            {isCorrect && <span style={styles.checkmark}>✓</span>}
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={styles.actions}>
                                <button
                                    onClick={() => navigate(`/staff/mcqs/edit/${mcq.id}`)}
                                    style={styles.editBtn}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(mcq.id)}
                                    style={styles.deleteBtn}
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

const styles = {
    container: { padding: '24px' },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    title: { color: '#1F2937', fontSize: '2rem', fontWeight: '700', margin: 0 },
    subtitle: { color: '#6B7280', marginTop: '8px' },
    addBtn: {
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        border: 'none',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    filterBar: {
        marginBottom: '24px',
    },
    select: {
        background: 'white',
        border: '1px solid #E5E7EB',
        color: '#374151',
        padding: '12px 16px',
        borderRadius: '10px',
        minWidth: '200px',
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#6B7280',
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        background: '#F9FAFB',
        borderRadius: '20px',
        color: '#6B7280',
    },
    emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '16px' },
    addBtnSecondary: {
        marginTop: '16px',
        background: '#F3F4F6',
        border: '1px solid #E5E7EB',
        color: '#8b5cf6',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    questionList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    questionCard: {
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    questionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
    },
    questionNumber: {
        background: '#F3F4F6',
        color: '#8b5cf6',
        padding: '4px 10px',
        borderRadius: '6px',
        fontWeight: '700',
        fontSize: '0.85rem',
    },
    courseBadge: {
        background: '#EFF6FF',
        color: '#3b82f6',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.8rem',
    },
    marks: {
        color: '#6B7280',
        fontSize: '0.85rem',
        marginLeft: 'auto',
    },
    questionText: {
        color: '#1F2937',
        fontSize: '1.1rem',
        lineHeight: '1.5',
        marginBottom: '16px',
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '16px',
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        background: '#F9FAFB',
        borderRadius: '8px',
        color: '#4B5563',
        fontSize: '0.9rem',
        border: '1px solid #F3F4F6'
    },
    correctOption: {
        background: '#ECFDF5',
        border: '1px solid #10B981',
        color: '#065F46'
    },
    optionLabel: {
        background: '#E5E7EB',
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: '600',
        color: '#374151'
    },
    checkmark: {
        marginLeft: 'auto',
        color: '#10b981',
        fontWeight: 'bold',
    },
    actions: {
        display: 'flex',
        gap: '10px',
        paddingTop: '16px',
        borderTop: '1px solid #E5E7EB',
    },
    editBtn: {
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        color: '#3b82f6',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    deleteBtn: {
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        color: '#ef4444',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
    },
};

export default MCQList;
