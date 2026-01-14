import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { courseApi, programApi, semesterApi } from '../../../services/api';
import '../../../styles/Table.css';

const CourseList = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await courseApi.delete(id);
                loadData();
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    if (loading) return <div className="card"><p>Loading...</p></div>;

    return (
        <div className="card">
            <div className="page-header">
                <h2>Language Courses</h2>
                <div style={{ width: '200px' }}>
                    <Button onClick={() => navigate('/admin/courses/new')}>Add Course</Button>
                </div>
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
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No courses found</td></tr>
                    ) : courses.map((course) => (
                        <tr key={course.id}>
                            <td>{course.course_code}</td>
                            <td>{course.course_name}</td>
                            <td>{getProgramName(course.program_id)}</td>
                            <td>{getSemesterName(course.semester_id)}</td>
                            <td>
                                <button className="btn-secondary action-btn" onClick={() => handleDelete(course.id)} style={{ color: '#ef4444' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CourseList;
