import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mcqApi, courseApi } from '../../../services/api';

const QuizPlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0, marks: 0 });
    const [loading, setLoading] = useState(true);

    const studentId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user') || '{}')?.id;

    useEffect(() => {
        loadQuiz();
    }, [courseId]);

    const loadQuiz = async () => {
        try {
            const [courseData, quizData] = await Promise.all([
                courseApi.getAll(),
                mcqApi.getCourseQuiz(courseId, studentId)
            ]);

            const currentCourse = courseData.find(c => c.id === parseInt(courseId));
            setCourse(currentCourse);

            // Filter out already attempted questions or show all for review
            setQuestions(quizData.questions);
        } catch (error) {
            console.error('Error loading quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer) return;

        const currentQuestion = questions[currentIndex];

        if (currentQuestion.attempted) {
            // Just navigatiing to next
            goToNext();
            return;
        }

        try {
            const result = await mcqApi.submitAnswer(currentQuestion.id, {
                student_id: studentId,
                selected_answer: selectedAnswer
            });

            setFeedback(result);
            setScore(prev => ({
                correct: prev.correct + (result.is_correct ? 1 : 0),
                total: prev.total + 1,
                marks: prev.marks + result.marks_earned
            }));

            // Mark as attempted
            setQuestions(prev => prev.map((q, i) =>
                i === currentIndex ? { ...q, attempted: true } : q
            ));
        } catch (error) {
            console.error('Error submitting answer:', error);
            if (error.message.includes('400')) {
                setFeedback({ error: 'Already attempted this question' });
            }
        }
    };

    const goToNext = () => {
        setFeedback(null);
        setSelectedAnswer('');
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goToPrev = () => {
        setFeedback(null);
        setSelectedAnswer('');
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading quiz...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📝</span>
                    <h3>No questions in this quiz</h3>
                    <button onClick={() => navigate('/student/quiz')} style={styles.backBtn}>
                        ← Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <button onClick={() => navigate('/student/quiz')} style={styles.exitBtn}>
                    ✕ Exit Quiz
                </button>
                <div style={styles.courseInfo}>
                    <span style={styles.courseName}>{course?.course_name}</span>
                </div>
                <div style={styles.scoreDisplay}>
                    Score: <span style={styles.scoreValue}>{score.correct}/{score.total}</span>
                </div>
            </header>

            {/* Progress */}
            <div style={styles.progressSection}>
                <div style={styles.progressText}>
                    Question {currentIndex + 1} of {questions.length}
                </div>
                <div style={styles.progressBar}>
                    <div style={{
                        ...styles.progressFill,
                        width: `${((currentIndex + 1) / questions.length) * 100}%`
                    }}></div>
                </div>
            </div>

            {/* Question Card */}
            <div style={styles.questionCard}>
                {currentQuestion.attempted && (
                    <div style={styles.attemptedBadge}>✓ Answered</div>
                )}

                <h2 style={styles.questionText}>{currentQuestion.question_text}</h2>

                <div style={styles.optionsList}>
                    {['A', 'B', 'C', 'D'].map(opt => {
                        const optValue = currentQuestion[`option_${opt.toLowerCase()}`];
                        if (!optValue) return null;

                        const isSelected = selectedAnswer === opt;
                        const showResult = feedback && !feedback.error;
                        const isCorrect = feedback?.correct_answer === opt;
                        const isWrong = showResult && isSelected && !feedback.is_correct;

                        // Explicit border and background for each state
                        let border = '2px solid #E3E5E8';
                        let background = '#F5F7FA';

                        if (isSelected && !showResult) {
                            border = '2px solid #8b5cf6';
                            background = 'rgba(139, 92, 246, 0.1)';
                        } else if (showResult && isCorrect) {
                            border = '2px solid #10b981';
                            background = 'rgba(16, 185, 129, 0.1)';
                        } else if (isWrong) {
                            border = '2px solid #ef4444';
                            background = 'rgba(239, 68, 68, 0.1)';
                        }

                        const isDisabled = feedback || currentQuestion.attempted;

                        return (
                            <button
                                key={`${currentIndex}-${opt}`}
                                type="button"
                                onClick={() => !isDisabled && setSelectedAnswer(opt)}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                                        e.preventDefault();
                                        setSelectedAnswer(opt);
                                    }
                                }}
                                disabled={isDisabled}
                                aria-pressed={isSelected}
                                aria-label={`Option ${opt}: ${optValue}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px 20px',
                                    background: background,
                                    border: border,
                                    borderRadius: '12px',
                                    color: '#21272A',
                                    cursor: isDisabled ? 'default' : 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    width: '100%',
                                    fontSize: 'inherit',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <span style={styles.optionLabel}>{opt}</span>
                                <span style={styles.optionText}>{optValue}</span>
                                {showResult && isCorrect && <span style={styles.checkmark}>✓</span>}
                                {isWrong && <span style={styles.xmark}>✗</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback */}
                {feedback && !feedback.error && (
                    <div style={feedback.is_correct ? styles.correctFeedback : styles.wrongFeedback}>
                        {feedback.is_correct ? '🎉 Correct!' : '❌ Incorrect'}
                        {!feedback.is_correct && (
                            <span> The correct answer is {feedback.correct_answer}</span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div style={styles.actions}>
                    <button
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        style={currentIndex === 0 ? styles.disabledBtn : styles.navBtn}
                    >
                        ← Previous
                    </button>

                    {!feedback && !currentQuestion.attempted ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!selectedAnswer}
                            style={!selectedAnswer ? styles.disabledBtn : styles.submitBtn}
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={isLastQuestion ? () => navigate('/student/quiz/results') : goToNext}
                            style={styles.submitBtn}
                        >
                            {isLastQuestion ? 'View Results →' : 'Next Question →'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
    },
    loadingSpinner: {
        width: '48px',
        height: '48px',
        border: '4px solid rgba(139, 92, 246, 0.2)',
        borderTop: '4px solid #8b5cf6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: { marginTop: '16px', color: '#5C6873' },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        color: '#5C6873',
    },
    emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '16px' },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    exitBtn: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#ef4444',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    courseInfo: {},
    courseName: { color: '#21272A', fontWeight: '600' },
    scoreDisplay: { color: '#5C6873' },
    scoreValue: { color: '#10b981', fontWeight: '700' },

    progressSection: { marginBottom: '24px' },
    progressText: { color: '#5C6873', marginBottom: '8px', fontSize: '0.9rem' },
    progressBar: {
        height: '8px',
        background: '#E3E5E8',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
        transition: 'width 0.3s ease',
    },

    questionCard: {
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid #E3E5E8',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    },
    attemptedBadge: {
        display: 'inline-block',
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        marginBottom: '16px',
    },
    questionText: {
        color: '#21272A',
        fontSize: '1.4rem',
        lineHeight: '1.5',
        marginBottom: '24px',
    },
    optionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px',
    },
    optionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        background: '#F5F7FA',
        border: '2px solid #E3E5E8',
        borderRadius: '12px',
        color: '#21272A',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        outline: 'none',
        boxShadow: 'none',
    },
    selectedOption: {
        borderColor: '#8b5cf6',
        background: 'rgba(139, 92, 246, 0.1)',
    },
    correctOption: {
        borderColor: '#10b981',
        background: 'rgba(16, 185, 129, 0.1)',
    },
    wrongOption: {
        borderColor: '#ef4444',
        background: 'rgba(239, 68, 68, 0.1)',
    },
    optionLabel: {
        background: '#E3E5E8',
        padding: '6px 12px',
        borderRadius: '6px',
        fontWeight: '700',
        color: '#21272A',
    },
    optionText: { flex: 1 },
    checkmark: { color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' },
    xmark: { color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem' },

    correctFeedback: {
        padding: '16px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        color: '#10b981',
        marginBottom: '24px',
        textAlign: 'center',
        fontWeight: '600',
    },
    wrongFeedback: {
        padding: '16px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        color: '#ef4444',
        marginBottom: '24px',
        textAlign: 'center',
    },

    actions: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px',
    },
    navBtn: {
        background: '#F5F7FA',
        border: '1px solid #E3E5E8',
        color: '#21272A',
        padding: '14px 24px',
        borderRadius: '10px',
        cursor: 'pointer',
    },
    submitBtn: {
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        border: 'none',
        color: 'white',
        padding: '14px 32px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    disabledBtn: {
        background: '#F5F7FA',
        border: '1px solid #E3E5E8',
        color: '#8F96A1',
        padding: '14px 24px',
        borderRadius: '10px',
        cursor: 'not-allowed',
    },
    backBtn: {
        marginTop: '16px',
        background: 'rgba(139, 92, 246, 0.2)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        color: '#7c3aed',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
    },
};

export default QuizPlayer;
