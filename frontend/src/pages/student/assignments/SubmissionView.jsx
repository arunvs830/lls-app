import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { assignmentApi, submissionApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/SubmissionView.css';

const SubmissionView = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const studentId = user?.id;

    useEffect(() => {
        loadData();
    }, [assignmentId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load assignment details
            const assignmentData = await assignmentApi.getOne(assignmentId);
            setAssignment(assignmentData);

            // Load submission for this student
            const submissionData = await submissionApi.getByAssignmentAndStudent(assignmentId, studentId);
            setSubmission(submissionData);
        } catch (err) {
            console.error('Error loading submission:', err);
            setError('Failed to load submission details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="submission-view-loading">
                <div className="submission-view-spinner"></div>
                <p>Loading submission...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="submission-view-error">
                <AlertCircle size={48} />
                <h2>{error}</h2>
                <button onClick={() => navigate('/student/assignments')} className="btn-primary">
                    Back to Assignments
                </button>
            </div>
        );
    }

    const evaluation = submission?.evaluation;
    const isGraded = evaluation && evaluation.marks_obtained !== null;

    return (
        <div className="submission-view-container">
            <header className="submission-view-header">
                <button onClick={() => navigate('/student/assignments')} className="submission-view-back-btn">
                    <ArrowLeft size={20} />
                    Back to Assignments
                </button>
                <h1>Submission Details</h1>
            </header>

            {/* Assignment Info */}
            <section className="submission-view-card">
                <h2><FileText size={20} /> Assignment</h2>
                <div className="submission-view-info-grid">
                    <div className="submission-view-info-item">
                        <span className="label">Title</span>
                        <span className="value">{assignment?.title || 'N/A'}</span>
                    </div>
                    <div className="submission-view-info-item">
                        <span className="label">Course</span>
                        <span className="value">{assignment?.course?.course_name || 'N/A'}</span>
                    </div>
                    <div className="submission-view-info-item">
                        <span className="label">Due Date</span>
                        <span className="value">{formatDate(assignment?.due_date)}</span>
                    </div>
                    <div className="submission-view-info-item">
                        <span className="label">Max Marks</span>
                        <span className="value">{assignment?.max_marks || 'N/A'}</span>
                    </div>
                </div>
                {assignment?.description && (
                    <div className="submission-view-description">
                        <span className="label">Description</span>
                        <p>{assignment.description}</p>
                    </div>
                )}
            </section>

            {/* Submission Info */}
            <section className="submission-view-card">
                <h2><Clock size={20} /> Your Submission</h2>
                {submission ? (
                    <div className="submission-view-info-grid">
                        <div className="submission-view-info-item">
                            <span className="label">Submitted On</span>
                            <span className="value">{formatDate(submission.submitted_at)}</span>
                        </div>
                        <div className="submission-view-info-item">
                            <span className="label">Status</span>
                            <span className={`value status-badge ${isGraded ? 'graded' : 'pending'}`}>
                                {isGraded ? 'Graded' : 'Pending Review'}
                            </span>
                        </div>
                        {submission.file_path && (
                            <div className="submission-view-info-item">
                                <span className="label">Submitted File</span>
                                <a href={submission.file_path} target="_blank" rel="noopener noreferrer" className="file-link">
                                    View File
                                </a>
                            </div>
                        )}
                        {submission.submission_text && (
                            <div className="submission-view-content">
                                <span className="label">Your Answer</span>
                                <div className="content-box">{submission.submission_text}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="submission-view-no-submission">
                        <AlertCircle size={24} />
                        <p>No submission found for this assignment.</p>
                    </div>
                )}
            </section>

            {/* Evaluation Info */}
            {isGraded && (
                <section className="submission-view-card evaluation-card">
                    <h2><CheckCircle size={20} /> Evaluation</h2>
                    <div className="submission-view-info-grid">
                        <div className="submission-view-info-item">
                            <span className="label">Marks Obtained</span>
                            <span className="value marks">{evaluation.marks_obtained} / {assignment?.max_marks || 'N/A'}</span>
                        </div>
                        <div className="submission-view-info-item">
                            <span className="label">Evaluated On</span>
                            <span className="value">{formatDate(evaluation.evaluated_at)}</span>
                        </div>
                    </div>
                    {evaluation.feedback && (
                        <div className="submission-view-feedback">
                            <span className="label">Feedback</span>
                            <div className="feedback-box">{evaluation.feedback}</div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default SubmissionView;
