import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { courseApi, programApi, semesterApi } from '../../../services/api';
import '../../../styles/Table.css';

const CourseList = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [courseData, programData, semesterData] = await Promise.all([
                courseApi.getAll(),
                programApi.getAll(),
                semesterApi.getAll()
            ]);
            setCourses(courseData);
            setPrograms(programData);
            setSemesters(semesterData);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProgramName = (id) => programs.find(p => p.id === id)?.program_name || 'N/A';
    const getSemesterName = (id) => semesters.find(s => s.id === id)?.semester_name || 'N/A';

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await courseApi.delete(deleteId);
            loadData();
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading courses...</p>
        </div>
    );

    return (
        <div className="card">
            <div className="page-header">
                <h2>Language Courses</h2>
                <Button className="btn-lg-width" onClick={() => navigate('/admin/courses/new')}>Add Course</Button>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Course Name</th>
                        <th>Program</th>
                        <th>Semester</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.length === 0 ? (
                        <tr><td colSpan="5" className="empty-row">No courses found</td></tr>
                    ) : courses.map((course) => (
                        <tr key={course.id}>
                            <td>{course.course_code}</td>
                            <td>{course.course_name}</td>
                            <td>{getProgramName(course.program_id)}</td>
                            <td>{getSemesterName(course.semester_id)}</td>
                            <td>
                                <button
                                    className="action-btn edit"
                                    onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="action-btn danger"
                                    onClick={() => handleDeleteClick(course.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={showConfirm}
                title="Delete Course"
                message="Are you sure you want to delete this course? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setShowConfirm(false)}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default CourseList;
