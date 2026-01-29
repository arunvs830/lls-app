import React, { useState, useEffect } from 'react';
import { reportApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, TrendingUp, AlertCircle, Award } from 'lucide-react';

const ReportDashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        course_id: '',
    });

    useEffect(() => {
        loadData();
    }, [filters.course_id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const staffId = user?.id || localStorage.getItem('userId');

            // Load courses only once
            if (courses.length === 0) {
                // We extract courses from the report data itself to ensure relevant filters
            }

            const data = await reportApi.getStaffReports(staffId, filters);
            setReports(data);

            // Extract unique courses from data for filter if not yet loaded
            if (courses.length === 0 && data.length > 0) {
                const uniqueCourses = [];
                const map = new Map();
                for (const item of data) {
                    if (!map.has(item.course_id)) {
                        map.set(item.course_id, true);
                        uniqueCourses.push({ id: item.course_id, name: item.course_name, code: item.course_code });
                    }
                }
                setCourses(uniqueCourses);
            }

        } catch (error) {
            console.error("Failed to load reports", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Summary Metrics
    const summary = {
        totalStudents: reports.length,
        avgCompletion: reports.length ? Math.round(reports.reduce((acc, curr) => acc + curr.percent_completed, 0) / reports.length) : 0,
        totalMissed: reports.reduce((acc, curr) => acc + curr.missed_deadlines, 0),
        avgMarks: reports.length ? Math.round(reports.reduce((acc, curr) => acc + curr.percent_marks, 0) / reports.length) : 0
    };

    return (
        <div className="page-container" style={{ padding: '20px' }}>
            <div className="page-header" style={{ marginBottom: '20px' }}>
                <h1>Student Progress Reports</h1>
            </div>

            {/* Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#e0f2fe', p: '10px', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Avg Completion</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>{summary.avgCompletion}%</div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#fee2e2', p: '10px', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Missed Deadlines</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>{summary.totalMissed}</div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#dcfce7', p: '10px', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                        <Award size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Avg Marks</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>{summary.avgMarks}%</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '12px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748b' }}>Filter by Course</label>
                    <select
                        value={filters.course_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, course_id: e.target.value }))}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', minWidth: '200px' }}
                    >
                        <option value="">All Courses</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                        <Loader2 className="spin" size={32} color="#64748b" />
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Student</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Course</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Progress</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Missed Deadlines</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Marks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No data found.</td>
                                </tr>
                            ) : (
                                reports.map((row, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{row.student_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{row.student_code}</div>
                                        </td>
                                        <td style={{ padding: '15px', color: '#334155' }}>{row.course_code}</td>
                                        <td style={{ padding: '15px', width: '25%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ flex: 1, background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${row.percent_completed}%`, background: '#3b82f6', height: '100%' }}></div>
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6' }}>{row.percent_completed}%</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{row.percent_left}% Left</div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            {row.missed_deadlines > 0 ? (
                                                <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    {row.missed_deadlines} Missed
                                                </span>
                                            ) : (
                                                <span style={{ color: '#16a34a', fontSize: '0.85rem' }}>On Track</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.percent_marks}%</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{row.marks_obtained} / {row.max_marks}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ReportDashboard;
