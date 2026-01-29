import { useState, useEffect } from 'react';
import { studentDashboardApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/StudentResultList.css';

const ResultList = () => {
    const { user } = useAuth();
    const [resultsData, setResultsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const studentId = user?.id || 1;

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            const data = await studentDashboardApi.getCourseResults(studentId);
            setResultsData(data);
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="srl-loading-container">
                <div className="srl-loading-spinner"></div>
                <p className="srl-loading-text">Loading your results...</p>
            </div>
        );
    }

    const student = resultsData?.student;
    const courses = resultsData?.courses || [];

    const releasedCourses = courses.filter(c => c.final?.released);
    const avgFinalPct = releasedCourses.length > 0
        ? (releasedCourses.reduce((sum, c) => sum + (c.final?.percentage || 0), 0) / releasedCourses.length).toFixed(1)
        : 0;

    return (
        <div className="student-result-list-container">
            <header className="srl-header">
                <div>
                    <h1 className="srl-title">My Results</h1>
                    <p className="srl-subtitle">Academic performance overview</p>
                </div>
                <div className="srl-student-info">
                    <span className="srl-student-name">{student?.full_name}</span>
                    <span className="srl-student-code">{student?.student_code}</span>
                </div>
            </header>

            {/* Stats Summary */}
            <div className="srl-stats-row">
                <div className="srl-stat-card">
                    <span className="srl-stat-number">{releasedCourses.length}</span>
                    <span className="srl-stat-label">Final Results Released</span>
                </div>
                <div className="srl-stat-card">
                    <span className="srl-stat-number">{avgFinalPct}%</span>
                    <span className="srl-stat-label">Average Final %</span>
                </div>
                <div className="srl-stat-card">
                    <span className="srl-stat-number success">
                        {courses.filter(c => c.final?.released).length}
                    </span>
                    <span className="srl-stat-label">Courses Completed</span>
                </div>
            </div>

            {/* Results Table */}
            {courses.length === 0 ? (
                <div className="srl-empty-state">
                    <span className="srl-empty-icon">📊</span>
                    <h3 className="srl-empty-title">No results yet</h3>
                    <p className="srl-empty-text">Your courses and results will appear here once you are enrolled.</p>
                </div>
            ) : (
                <div className="srl-table-container">
                    <table className="srl-table">
                        <thead>
                            <tr>
                                <th className="srl-th">Course</th>
                                <th className="srl-th">Assignments</th>
                                <th className="srl-th">Quiz</th>
                                <th className="srl-th">Progress %</th>
                                <th className="srl-th">Final %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((row) => (
                                <tr key={row.course?.id} className="srl-tr">
                                    <td className="srl-td">
                                        <div className="srl-course-cell">
                                            <span className="srl-course-code">{row.course?.course_code}</span>
                                            <span className="srl-course-name">{row.course?.course_name}</span>
                                        </div>
                                    </td>
                                    <td className="srl-td">
                                        {row.assignments
                                            ? `${row.assignments.earned_marks ?? 0}/${row.assignments.total_marks ?? 0}`
                                            : '-'}
                                    </td>
                                    <td className="srl-td">
                                        {row.quiz
                                            ? `${row.quiz.earned_marks ?? 0}/${row.quiz.total_marks ?? 0}`
                                            : '-'}
                                    </td>
                                    <td className="srl-td">
                                        <span className="srl-total-marks">{row.progress?.percentage ?? 0}%</span>
                                    </td>
                                    <td className="srl-td">
                                        {row.final?.released ? (
                                            <span className="srl-grade-badge success">
                                                {row.final.percentage}%
                                            </span>
                                        ) : (
                                            <span className="srl-grade-badge locked">
                                                In Progress
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResultList;
