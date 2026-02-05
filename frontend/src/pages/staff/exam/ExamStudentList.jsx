import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/Table.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ExamStudentList = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [courseId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching data for course:', courseId);

            // Load course info
            const courseData = await courseApi.getAll();
            const foundCourse = courseData.find(c => c.id === parseInt(courseId));
            setCourse(foundCourse);

            // Load students with exam data
            const url = `${API_BASE}/api/exams/course/${courseId}/students`;
            console.log('Fetching students from:', url);

            const response = await fetch(url);

            if (!response.ok) {
                const text = await response.text();
                console.error('API Error Response:', text);
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Students data received:', data);

            if (Array.isArray(data)) {
                setStudents(data);
            } else {
                console.error('Data is not an array:', data);
                setError('Received invalid data format from server');
            }
        } catch (error) {
            console.error('Error loading students:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#6B7280' }}>Loading students...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ color: '#EF4444', marginBottom: '0.5rem' }}>Error Loading Data</h3>
                <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>{error}</p>
                <button onClick={loadData} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="page-header">
                <div>
                    <h2 style={{ marginBottom: '0.25rem' }}>
                        {course?.course_name || 'Course'} - Exam Management
                    </h2>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>
                        Upload CCA1 and CCA2 answer papers and assign marks
                    </p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/staff/exam')}
                    style={{ padding: '0.5rem 1rem' }}
                >
                    ← Back to Courses
                </button>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Student Code</th>
                        <th>Name</th>
                        <th>CCA1 Marks</th>
                        <th>CCA2 Marks</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="empty-row">
                                No students enrolled in this course
                            </td>
                        </tr>
                    ) : students.map((student) => (
                        <tr key={student.id}>
                            <td>{student.student_code}</td>
                            <td>{student.full_name}</td>
                            <td>
                                {student.exam?.cca1_marks !== null && student.exam?.cca1_marks !== undefined ? (
                                    <span style={{
                                        background: '#DEF7EC',
                                        color: '#03543F',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem'
                                    }}>
                                        {student.exam.cca1_marks}
                                    </span>
                                ) : (
                                    <span style={{ color: '#9CA3AF' }}>Not graded</span>
                                )}
                            </td>
                            <td>
                                {student.exam?.cca2_marks !== null && student.exam?.cca2_marks !== undefined ? (
                                    <span style={{
                                        background: '#DEF7EC',
                                        color: '#03543F',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem'
                                    }}>
                                        {student.exam.cca2_marks}
                                    </span>
                                ) : (
                                    <span style={{ color: '#9CA3AF' }}>Not graded</span>
                                )}
                            </td>
                            <td>
                                <button
                                    className="action-btn edit"
                                    onClick={() => navigate(`/staff/exam/${courseId}/student/${student.id}`)}
                                >
                                    Manage Exam
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExamStudentList;
