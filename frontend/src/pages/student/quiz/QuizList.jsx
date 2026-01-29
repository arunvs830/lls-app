import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentDashboardApi, mcqApi } from '../../../services/api';

import { useAuth } from '../../../context/AuthContext';
import '../../../styles/StudentQuizList.css';

const QuizList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const studentId = user?.id || 1;

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const coursesData = await studentDashboardApi.getCourses(studentId);

            // For each course, get quiz info
            const coursesWithQuiz = await Promise.all(
                coursesData.map(async (course) => {
                    try {
                        const quiz = await mcqApi.getCourseQuiz(course.id, studentId);
                        return {
                            ...course,
                            total_questions: quiz.total_questions,
                            attempted_count: quiz.attempted_count
                        };
                    } catch {
                        return { ...course, total_questions: 0, attempted_count: 0 };
                    }
                })
            );

            setCourses(coursesWithQuiz);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="sql-loading-container">
                <div className="sql-loading-spinner"></div>
                <p className="sql-loading-text">Loading quizzes...</p>
            </div>
        );
    }

    return (
        <div className="student-quiz-list-container">
            <header className="sql-header">
                <h1 className="sql-title">My Quizzes</h1>
                <p className="sql-subtitle">Test your knowledge with course quizzes</p>
            </header>

            {courses.length === 0 ? (
                <div className="sql-empty-state">
                    <span className="sql-empty-icon">📝</span>
                    <h3>No quizzes available</h3>
                    <p>Quizzes will appear here when your teachers create them.</p>
                </div>
            ) : (
                <div className="sql-course-grid">
                    {courses.map(course => (
                        <div key={course.id} className="sql-course-card">
                            <div className="sql-card-header">
                                <span className="sql-course-code">{course.course_code}</span>
                                {course.attempted_count === course.total_questions && course.total_questions > 0 && (
                                    <span className="sql-complete-badge">✓ Complete</span>
                                )}
                            </div>

                            <h3 className="sql-course-name">{course.course_name}</h3>

                            <div className="sql-quiz-stats">
                                <div className="sql-stat-item">
                                    <span className="sql-stat-number">{course.total_questions}</span>
                                    <span className="sql-stat-label">Questions</span>
                                </div>
                                <div className="sql-stat-item">
                                    <span className="sql-stat-number">{course.attempted_count}</span>
                                    <span className="sql-stat-label">Attempted</span>
                                </div>
                                <div className="sql-stat-item">
                                    <span className="sql-stat-number">
                                        {course.total_questions > 0
                                            ? Math.round((course.attempted_count / course.total_questions) * 100)
                                            : 0}%
                                    </span>
                                    <span className="sql-stat-label">Progress</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="sql-progress-bar">
                                <div
                                    className="sql-progress-fill"
                                    style={{
                                        width: `${course.total_questions > 0
                                            ? (course.attempted_count / course.total_questions) * 100
                                            : 0}%`
                                    }}
                                ></div>
                            </div>

                            <button
                                onClick={() => navigate(`/student/quiz/${course.id}`)}
                                className={course.total_questions === 0 ? 'sql-disabled-btn' : 'sql-start-btn'}
                                disabled={course.total_questions === 0}
                            >
                                {course.total_questions === 0
                                    ? 'No questions yet'
                                    : course.attempted_count === course.total_questions
                                        ? 'Review Quiz'
                                        : 'Start Quiz →'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizList;
