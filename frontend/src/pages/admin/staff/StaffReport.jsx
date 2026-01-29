import { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, CheckCircle, Clock } from 'lucide-react';
import { adminApi } from '../../../services/api';
import '../../../styles/AdminStaffReport.css';

const StaffReport = () => {
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStaffReport();
    }, []);

    const loadStaffReport = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getStaffReport();
            setStaffData(data);
        } catch (err) {
            console.error('Error loading staff report:', err);
            setError('Failed to load staff report');
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totals = staffData.reduce((acc, staff) => ({
        totalCourses: acc.totalCourses + staff.courses_count,
        totalAssignments: acc.totalAssignments + staff.assignments_count,
        totalSubmissions: acc.totalSubmissions + staff.total_submissions,
        totalGraded: acc.totalGraded + staff.graded_submissions
    }), { totalCourses: 0, totalAssignments: 0, totalSubmissions: 0, totalGraded: 0 });

    if (loading) {
        return (
            <div className="admin-staff-report-loading">
                <div className="admin-staff-report-spinner"></div>
                <p>Loading staff report...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-staff-report-error">
                <p>{error}</p>
                <button onClick={loadStaffReport} className="btn-primary">Retry</button>
            </div>
        );
    }

    return (
        <div className="admin-staff-report-container">
            <header className="admin-staff-report-header">
                <h1><Users size={28} /> Staff Performance Report</h1>
                <p className="admin-staff-report-subtitle">Overview of staff courses and grading activity</p>
            </header>

            {/* Summary Cards */}
            <section className="admin-staff-report-summary">
                <div className="admin-staff-report-card purple">
                    <Users size={24} />
                    <div className="card-content">
                        <span className="card-value">{staffData.length}</span>
                        <span className="card-label">Total Staff</span>
                    </div>
                </div>
                <div className="admin-staff-report-card blue">
                    <BookOpen size={24} />
                    <div className="card-content">
                        <span className="card-value">{totals.totalCourses}</span>
                        <span className="card-label">Course Assignments</span>
                    </div>
                </div>
                <div className="admin-staff-report-card orange">
                    <FileText size={24} />
                    <div className="card-content">
                        <span className="card-value">{totals.totalSubmissions}</span>
                        <span className="card-label">Total Submissions</span>
                    </div>
                </div>
                <div className="admin-staff-report-card green">
                    <CheckCircle size={24} />
                    <div className="card-content">
                        <span className="card-value">{totals.totalGraded}/{totals.totalSubmissions}</span>
                        <span className="card-label">Graded</span>
                    </div>
                </div>
            </section>

            {/* Staff Table */}
            <section className="admin-staff-report-table-section">
                <h2>Staff Details</h2>
                <div className="admin-staff-report-table-wrapper">
                    <table className="admin-staff-report-table">
                        <thead>
                            <tr>
                                <th>Staff Code</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Courses</th>
                                <th>Assignments</th>
                                <th>Graded / Total</th>
                                <th>Pending</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffData.map(staff => (
                                <tr key={staff.id}>
                                    <td className="staff-code">{staff.staff_code}</td>
                                    <td className="staff-name">{staff.full_name}</td>
                                    <td className="staff-email">{staff.email}</td>
                                    <td>
                                        <span className="badge blue">{staff.courses_count}</span>
                                    </td>
                                    <td>{staff.assignments_count}</td>
                                    <td>
                                        <span className="graded-stat">
                                            <CheckCircle size={14} className="icon-green" />
                                            {staff.graded_submissions} / {staff.total_submissions}
                                        </span>
                                    </td>
                                    <td>
                                        {staff.pending_submissions > 0 ? (
                                            <span className="badge orange">{staff.pending_submissions}</span>
                                        ) : (
                                            <span className="badge green">0</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default StaffReport;
