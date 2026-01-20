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
    const [scope, setScope] = useState('assignment'); // 'assignment' | 'course'

    const staffId = Number(localStorage.getItem('userId') || 1);

    useEffect(() => {
        loadData();
    }, [assignmentId]);

    const loadData = async () => {
        try {
            setLoading(true);

            const [assignmentData, allocations, allCourses] = await Promise.all([
                assignmentApi.getOne(assignmentId),
                staffCourseApi.getAll(),
                courseApi.getAll()
            ]);

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

            // Default scope: show this assignment's submissions
            if (scope === 'assignment') {
                const submissionData = await submissionApi.getAll(assignmentId);
                setSubmissions(submissionData);
            } else {
                const courseId = Number(selectedCourseId || assignmentCourseId);
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

    if (loading) return <div className="card"><p>Loading submissions...</p></div>;

    return (
        <div className="card">
            <div className="page-header" style={{ display: 'block' }}>
                <button onClick={() => navigate('/staff/assignments')} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '0.5rem' }}>
                    ← Back to Assignments
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Submissions: {assignment?.title}</h2>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total: {submissions.length}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>Scope</label>
                        <select
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 10px', borderRadius: '8px' }}
                        >
                            <option value="assignment">This assignment</option>
                            <option value="course">All assignments in course</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>Course</label>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            disabled={scope !== 'course'}
                            style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 10px', borderRadius: '8px', minWidth: '260px', opacity: scope === 'course' ? 1 : 0.6 }}
                        >
                            <option value="">All my courses</option>
                            {courses.map(c => (
                                <option key={c.id} value={String(c.id)}>{c.course_code} - {c.course_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        {scope === 'course' && <th>Assignment</th>}
                        <th>Submitted At</th>
                        <th>Work</th>
                        <th>Status</th>
                        <th>Marks</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.length === 0 ? (
                        <tr><td colSpan={scope === 'course' ? 7 : 6} style={{ textAlign: 'center' }}>No submissions received yet</td></tr>
                    ) : submissions.map((s) => (
                        <tr key={s.id}>
                            <td>
                                {s.student?.full_name || `Student #${s.student_id}`}
                                {s.student?.student_code ? (
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{s.student.student_code}</div>
                                ) : null}
                            </td>
                            {scope === 'course' && (
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
