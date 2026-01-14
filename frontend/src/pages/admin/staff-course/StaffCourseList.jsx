import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { staffCourseApi, staffApi, courseApi } from '../../../services/api';
import '../../../styles/Table.css';

const StaffCourseList = () => {
    const navigate = useNavigate();
    const [allocations, setAllocations] = useState([]);
    const [staff, setStaff] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [allocData, staffData, courseData] = await Promise.all([
                staffCourseApi.getAll(),
                staffApi.getAll(),
                courseApi.getAll()
            ]);
            setAllocations(allocData);
            setStaff(staffData);
            setCourses(courseData);
        } catch (error) {
            console.error('Error loading:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStaffName = (id) => staff.find(s => s.id === id)?.full_name || 'N/A';
    const getCourseName = (id) => courses.find(c => c.id === id)?.course_name || 'N/A';

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await staffCourseApi.delete(id);
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
                <h2>Staff Allocations</h2>
                <div style={{ width: '200px' }}>
                    <Button onClick={() => navigate('/admin/staff-allocation/new')}>Assign Course</Button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Staff Name</th>
                        <th>Course</th>
                        <th>Assigned Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {allocations.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>No allocations found</td></tr>
                    ) : allocations.map((alloc) => (
                        <tr key={alloc.id}>
                            <td>{getStaffName(alloc.staff_id)}</td>
                            <td>{getCourseName(alloc.course_id)}</td>
                            <td>{alloc.assigned_date}</td>
                            <td>
                                <button className="btn-secondary action-btn" onClick={() => handleDelete(alloc.id)} style={{ color: '#ef4444' }}>Unassign</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StaffCourseList;
