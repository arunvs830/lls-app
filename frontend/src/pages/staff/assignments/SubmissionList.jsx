import { API_ORIGIN } from '../../../services/api';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { submissionApi, assignmentApi, staffCourseApi, courseApi } from '../../../services/api';
import '../../../styles/Table.css';

const SubmissionList = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(null); // id of submission being evaluated
    const [saving, setSaving] = useState(false); // prevent multiple submissions
    const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });

    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    // If we are in dashboard mode (no assignmentId), default to 'course' scope to show filtered logic correctly
    const [scope, setScope] = useState(assignmentId ? 'assignment' : 'course');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'evaluated', 'pending'

    const staffId = Number(localStorage.getItem('userId') || 1);

    useEffect(() => {
        loadData();
    }, [assignmentId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // If we have an assignmentId, fetch it. Otherwise just courses.
            const promises = [
                staffCourseApi.getAll(),
                courseApi.getAll()
            ];
            if (assignmentId) {
                promises.unshift(assignmentApi.getOne(assignmentId));
            }

            const results = await Promise.all(promises);
            const assignmentData = assignmentId ? results[0] : null;
            const allocations = assignmentId ? results[1] : results[0];
            const allCourses = assignmentId ? results[2] : results[1];

            // Courses this staff is assigned to
            const myCourseIds = allocations
                .filter(a => Number(a.staff_id) === staffId)
                .map(a => Number(a.course_id));

            const visibleCourses = myCourseIds.length > 0
                ? allCourses.filter(c => myCourseIds.includes(Number(c.id)))
                : allCourses;

            setCourses(visibleCourses);
            setAssignment(assignmentData);

            // Default course selection to the assignment's course
            const assignmentCourseId = assignmentData?.course_id;
            if (!selectedCourseId && assignmentCourseId) {
                setSelectedCourseId(String(assignmentCourseId));
            }

            // Determine data fetching strategy
            // If explicit assignmentId, start with 'assignment' scope mostly, but logic below handles it

            // If dashboard mode (no assignmentId), force course scope or all staff submissions
            let currentScope = scope;
            if (!assignmentId && currentScope === 'assignment') {
                // Fallback if component mounted in dashboard mode with default 'assignment' state 
                // but we really want to see all or course-filtered
                currentScope = 'course';
                setScope('course');
            }

            if (currentScope === 'assignment' && assignmentId) {
                const submissionData = await submissionApi.getAll(assignmentId);
                setSubmissions(submissionData);
            } else {
                // Course scope or All (if course selected or not)
                const courseId = Number(selectedCourseId || assignmentCourseId || 0); // 0 means all
                const submissionData = courseId
                    ? await submissionApi.getForStaffCourse(staffId, courseId)
                    : await submissionApi.getForStaff(staffId);
                setSubmissions(submissionData);
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Reload submissions when scope/course changes
    useEffect(() => {
        if (!assignmentId) return;
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scope, selectedCourseId]);

    const handleEvaluate = (sub) => {
        setEvaluating(sub.id);
        setGradeForm({
            marks: sub.evaluation?.marks_obtained || '',
            feedback: sub.evaluation?.feedback || ''
        });
    };

    const submitEvaluation = async (submissionId) => {
        if (saving) return; // Prevent multiple clicks
        setSaving(true);
        try {
            await submissionApi.evaluate(submissionId, {
                staff_id: staffId,
                marks_obtained: gradeForm.marks,
                feedback: gradeForm.feedback
            });
            alert('Evaluation saved!');
            setEvaluating(null);
            loadData();
        } catch (error) {
            console.error('Error saving evaluation:', error);
            alert('Failed to save evaluation.');
        } finally {
            setSaving(false);
        }
    };

    const getFilteredSubmissions = () => {
        if (statusFilter === 'all') return submissions;
        return submissions.filter(s => {
            if (statusFilter === 'evaluated') return s.status === 'evaluated';
            if (statusFilter === 'pending') return s.status !== 'evaluated';
            return true;
        });
    };

    if (loading) return <div className="card"><p>Loading submissions...</p></div>;

    const displayedSubmissions = getFilteredSubmissions();

    return (
        <div className="card">
            <div className="page-header" style={{ display: 'block' }}>
                {assignmentId && (
                    <button onClick={() => navigate('/staff/assignments')} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '0.5rem' }}>
                        ← Back to Assignments
                    </button>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>{assignment ? `Submissions: ${assignment.title}` : 'All Submissions'}</h2>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total: {displayedSubmissions.length}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {assignmentId && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>Scope</label>
                            <select
                                value={scope}
                                onChange={(e) => setScope(e.target.value)}
                                style={{ background: 'white', border: '1px solid #e5e7eb', color: '#1f2937', padding: '8px 10px', borderRadius: '8px' }}
                            >
                                <option value="assignment">This assignment</option>
                                <option value="course">All assignments in course</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>Course</label>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            disabled={scope !== 'course'}
                            style={{ background: 'white', border: '1px solid #e5e7eb', color: '#1f2937', padding: '8px 10px', borderRadius: '8px', minWidth: '260px', opacity: scope === 'course' ? 1 : 0.6 }}
                        >
                            <option value="">All my courses</option>
                            {courses.map(c => (
                                <option key={c.id} value={String(c.id)}>{c.course_code} - {c.course_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ background: 'white', border: '1px solid #e5e7eb', color: '#1f2937', padding: '8px 10px', borderRadius: '8px' }}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending Grading</option>
                            <option value="evaluated">Graded</option>
                        </select>
                    </div>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        {(scope === 'course' || !assignmentId) && <th>Assignment</th>}
                        <th>Submitted At</th>
                        <th>Work</th>
                        <th>Status</th>
                        <th>Marks</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedSubmissions.length === 0 ? (
                        <tr><td colSpan={(scope === 'course' || !assignmentId) ? 7 : 6} style={{ textAlign: 'center' }}>No submissions found</td></tr>
                    ) : displayedSubmissions.map((s) => (
                        <tr key={s.id}>
                            <td>
                                {s.student?.full_name || `Student #${s.student_id}`}
                                {s.student?.student_code ? (
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{s.student.student_code}</div>
                                ) : null}
                            </td>
                            {(scope === 'course' || !assignmentId) && (
                                <td>{s.assignment?.title || '-'}</td>
                            )}
                            <td>{new Date(s.submitted_at).toLocaleString()}</td>
                            <td>
                                <div>
                                    {s.submission_text && (
                                        <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontStyle: 'italic', opacity: 0.8 }}>
                                            "{s.submission_text.substring(0, 50)}..."
                                        </div>
                                    )}
                                    {s.file_path && (
                                        <a href={`${API_ORIGIN}${s.file_path}`} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontWeight: 500 }}>
                                            📄 View Attachment
                                        </a>
                                    )}
                                </div>
                            </td>
                            <td>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    backgroundColor: s.status === 'evaluated' ? '#10b98120' : '#3b82f620',
                                    color: s.status === 'evaluated' ? '#10b981' : '#3b82f6'
                                }}>
                                    {s.status === 'evaluated' ? 'Graded' : 'Pending'}
                                </span>
                            </td>
                            <td>
                                {s.evaluation ? (
                                    <span style={{ fontWeight: 600 }}>
                                        {s.evaluation.marks_obtained}
                                        {scope === 'assignment' && assignment?.max_marks ? ` / ${assignment.max_marks}` : ''}
                                    </span>
                                ) : '--'}
                            </td>
                            <td>
                                {evaluating === s.id ? (
                                    <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                        <input
                                            type="number"
                                            placeholder="Marks"
                                            value={gradeForm.marks}
                                            onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })}
                                            style={{ width: '100%', marginBottom: '0.5rem', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px' }}
                                        />
                                        <textarea
                                            placeholder="Feedback"
                                            value={gradeForm.feedback}
                                            onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                            style={{ width: '100%', marginBottom: '0.5rem', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px', height: '60px' }}
                                        ></textarea>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button size="small" onClick={() => submitEvaluation(s.id)} disabled={saving}>
                                                {saving ? 'Saving...' : 'Save'}
                                            </Button>
                                            <button onClick={() => setEvaluating(null)} className="btn-secondary" style={{ padding: '4px 8px' }} disabled={saving}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button size="small" onClick={() => handleEvaluate(s)}>
                                        {s.status === 'evaluated' ? 'Re-grade' : 'Grade'}
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubmissionList;
