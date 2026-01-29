import { useState, useEffect } from 'react';
import { BookOpen, Users, FileText, CheckCircle, GraduationCap, Layers, Filter } from 'lucide-react';
import { adminApi, academicYearApi, programApi, semesterApi } from '../../../services/api';
import '../../../styles/AdminCourseReport.css';

const CourseReport = () => {
    const [courseData, setCourseData] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFilterData();
    }, []);

    useEffect(() => {
        loadCourseReport();
    }, [selectedYear, selectedProgram, selectedSemester]);

    const loadFilterData = async () => {
        try {
            const [yearsData, programsData, semestersData] = await Promise.all([
                academicYearApi.getAll(),
                programApi.getAll(),
                semesterApi.getAll()
            ]);
            setAcademicYears(yearsData);
            setPrograms(programsData);
            setSemesters(semestersData);
        } catch (err) {
            console.error('Error loading filter data:', err);
        }
    };

    const loadCourseReport = async () => {
        try {
            setLoading(true);
            const filters = {
                academic_year_id: selectedYear || null,
                program_id: selectedProgram || null,
                semester_id: selectedSemester || null
            };
            const data = await adminApi.getCourseReport(filters);
            setCourseData(data);
        } catch (err) {
            console.error('Error loading course report:', err);
            setError('Failed to load course report');
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totals = courseData.reduce((acc, course) => ({
        totalEnrolled: acc.totalEnrolled + course.enrolled_students,
        totalMaterials: acc.totalMaterials + course.materials_count,
        totalAssignments: acc.totalAssignments + course.assignments_count,
        totalSubmissions: acc.totalSubmissions + course.total_submissions,
        totalGraded: acc.totalGraded + course.graded_submissions
    }), { totalEnrolled: 0, totalMaterials: 0, totalAssignments: 0, totalSubmissions: 0, totalGraded: 0 });

    if (loading) {
        return (
            <div className="admin-course-report-loading">
                <div className="admin-course-report-spinner"></div>
                <p>Loading course report...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-course-report-error">
                <p>{error}</p>
                <button onClick={loadCourseReport} className="btn-primary">Retry</button>
            </div>
        );
    }

    return (
        <div className="admin-course-report-container">
            <header className="admin-course-report-header">
                <div className="header-row">
                    <div>
                        <h1><BookOpen size={28} /> Course Report</h1>
                        <p className="admin-course-report-subtitle">Overview of courses, enrollments, and progress</p>
                    </div>
                </div>
                <div className="filters-row">
                    <div className="filter-group">
                        <label>Academic Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Years</option>
                            {academicYears.map(year => (
                                <option key={year.id} value={year.id}>{year.year_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Program</label>
                        <select
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Programs</option>
                            {programs.map(prog => (
                                <option key={prog.id} value={prog.id}>{prog.program_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Semester</label>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Semesters</option>
                            {semesters.map(sem => (
                                <option key={sem.id} value={sem.id}>{sem.semester_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <section className="admin-course-report-summary">
                <div className="admin-course-report-card purple">
                    <BookOpen size={24} />
                    <div className="card-content">
                        <span className="card-value">{courseData.length}</span>
                        <span className="card-label">Total Courses</span>
                    </div>
                </div>
                <div className="admin-course-report-card blue">
                    <GraduationCap size={24} />
                    <div className="card-content">
                        <span className="card-value">{totals.totalEnrolled}</span>
                        <span className="card-label">Total Enrolled</span>
                    </div>
                </div>
                <div className="admin-course-report-card teal">
                    <Layers size={24} />
                    <div className="card-content">
                        <span className="card-value">{totals.totalMaterials}</span>
                        <span className="card-label">Study Materials</span>
                    </div>
                </div>
                <div className="admin-course-report-card orange">
                    <FileText size={24} />
                    <div className="card-content">
                        <span className="card-value">{totals.totalAssignments}</span>
                        <span className="card-label">Assignments</span>
                    </div>
                </div>
                <div className="admin-course-report-card green">
                    <CheckCircle size={24} />
                    <div className="card-content">
                        <span className="card-value">{totals.totalGraded}/{totals.totalSubmissions}</span>
                        <span className="card-label">Graded</span>
                    </div>
                </div>
            </section>

            {/* Course Table */}
            <section className="admin-course-report-table-section">
                <h2>Course Details</h2>
                <div className="admin-course-report-table-wrapper">
                    <table className="admin-course-report-table">
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Course Name</th>
                                <th>Program</th>
                                <th>Semester</th>
                                <th>Enrolled</th>
                                <th>Staff Assigned</th>
                                <th>Materials</th>
                                <th>Assignments</th>
                                <th>Graded / Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseData.map(course => (
                                <tr key={course.id}>
                                    <td className="course-code">{course.course_code}</td>
                                    <td className="course-name">{course.course_name}</td>
                                    <td>{course.program}</td>
                                    <td>{course.semester}</td>
                                    <td>
                                        <span className="badge blue">{course.enrolled_students}</span>
                                    </td>
                                    <td className="staff-cell">
                                        {course.staff && course.staff.length > 0 ? (
                                            <div className="staff-list">
                                                {course.staff.map((s, idx) => (
                                                    <span key={idx} className="staff-tag">
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="no-staff">No staff assigned</span>
                                        )}
                                    </td>
                                    <td>{course.materials_count}</td>
                                    <td>{course.assignments_count}</td>
                                    <td>
                                        <span className="graded-stat">
                                            <CheckCircle size={14} className="icon-green" />
                                            {course.graded_submissions} / {course.total_submissions}
                                        </span>
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

export default CourseReport;
