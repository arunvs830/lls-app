import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mcqApi } from '../../../services/api';
import '../../../styles/QuizResults.css';

const QuizResults = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    const studentId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            const data = await mcqApi.getStudentResults(studentId);
            setResults(data);
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGradeClass = (percentage) => {
        if (percentage >= 80) return 'excellent';
        if (percentage >= 60) return 'good';
        if (percentage >= 40) return 'average';
        return 'poor';
    };

    if (loading) {
        return (
            <div className="qr-loading-container">
                <div className="qr-loading-spinner"></div>
                <p className="qr-loading-text">Loading results...</p>
            </div>
        );
    }

    const overallPercentage = results?.total_attempts > 0
        ? Math.round((results.total_correct / results.total_attempts) * 100)
        : 0;

    const overallGrade = getGradeClass(overallPercentage);

    return (
        <div className="quiz-results-container">
            <header className="qr-header">
                <h1 className="qr-title">Quiz Results</h1>
                <p className="qr-subtitle">Your quiz performance overview</p>
            </header>

            {/* Overall Stats */}
            <div className="qr-overall-card">
                <div className="qr-main-score">
                    <div className={`qr-score-circle grade-${overallGrade}`}>
                        <span className={`qr-score-percentage grade-${overallGrade}`}>
                            {overallPercentage}%
                        </span>
                        <span className="qr-score-label">Overall</span>
                    </div>
                </div>
                <div className="qr-stats-row">
                    <div className="qr-stat-box">
                        <span className="qr-stat-value">{results?.total_attempts || 0}</span>
                        <span className="qr-stat-label">Questions Attempted</span>
                    </div>
                    <div className="qr-stat-box">
                        <span className="qr-stat-value qr-value-green">{results?.total_correct || 0}</span>
                        <span className="qr-stat-label">Correct Answers</span>
                    </div>
                    <div className="qr-stat-box">
                        <span className="qr-stat-value qr-value-red">
                            {(results?.total_attempts || 0) - (results?.total_correct || 0)}
                        </span>
                        <span className="qr-stat-label">Incorrect</span>
                    </div>
                </div>
            </div>

            {/* Course-wise Results */}
            <h2 className="qr-section-title">Results by Course</h2>

            {(!results?.course_results || results.course_results.length === 0) ? (
                <div className="qr-empty-state">
                    <span className="qr-empty-icon">📊</span>
                    <p>No quiz attempts yet. Take some quizzes to see your results!</p>
                    <button onClick={() => navigate('/student/quiz')} className="qr-action-btn">
                        Browse Quizzes →
                    </button>
                </div>
            ) : (
                <div className="qr-course-list">
                    {results.course_results.map(course => (
                        <div key={course.course_id} className="qr-course-card">
                            <div className="qr-course-header">
                                <div>
                                    <span className="qr-course-code">{course.course_code}</span>
                                    <h3 className="qr-course-name">{course.course_name}</h3>
                                </div>
                                <div className={`qr-percent-badge grade-bg-${getGradeClass(course.percentage)}`}>
                                    {course.percentage}%
                                </div>
                            </div>

                            <div className="qr-course-stats">
                                <div className="qr-stat-item">
                                    <span className="qr-stat-item-value">{course.total_attempted}</span>
                                    <span className="qr-stat-item-label">Attempted</span>
                                </div>
                                <div className="qr-stat-item">
                                    <span className="qr-stat-item-value qr-value-green">{course.correct_count}</span>
                                    <span className="qr-stat-item-label">Correct</span>
                                </div>
                                <div className="qr-stat-item">
                                    <span className="qr-stat-item-value">{course.earned_marks}/{course.total_marks}</span>
                                    <span className="qr-stat-item-label">Marks</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="qr-progress-bar">
                                <div
                                    className={`qr-progress-fill grade-fill-${getGradeClass(course.percentage)}`}
                                    style={{
                                        width: `${course.percentage}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Action */}
            <div className="qr-actions-row">
                <button onClick={() => navigate('/student/quiz')} className="qr-primary-btn">
                    Take More Quizzes
                </button>
                <button onClick={() => navigate('/student')} className="qr-secondary-btn">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default QuizResults;
