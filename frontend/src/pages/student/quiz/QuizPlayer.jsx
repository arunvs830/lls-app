import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mcqApi, courseApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/QuizPlayer.css';

const QuizPlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0, marks: 0 });
    const [loading, setLoading] = useState(true);

    const studentId = user?.id;

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

    // Helper to get option button class
    const getOptionClass = (opt) => {
        const isSelected = selectedAnswer === opt;
        const showResult = feedback && !feedback.error;
        const isCorrect = feedback?.correct_answer === opt;
        const isWrong = showResult && isSelected && !feedback.is_correct;

        let classes = 'quiz-player-option-btn';
        if (isSelected && !showResult) classes += ' selected';
        if (showResult && isCorrect) classes += ' correct';
        if (isWrong) classes += ' wrong';
        return classes;
    };

    if (loading) {
        return (
            <div className="quiz-player-loading">
                <div className="quiz-player-spinner"></div>
                <p className="quiz-player-loading-text">Loading quiz...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="quiz-player-container">
                <div className="quiz-player-empty-state">
                    <span className="quiz-player-empty-icon">📝</span>
                    <h3>No questions in this quiz</h3>
                    <button onClick={() => navigate('/student/quiz')} className="quiz-player-back-btn">
                        ← Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const isDisabled = feedback || currentQuestion.attempted;
    const showResult = feedback && !feedback.error;
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="quiz-player-container">
            {/* Header */}
            <header className="quiz-player-header">
                <button onClick={() => navigate('/student/quiz')} className="quiz-player-exit-btn">
                    ✕ Exit Quiz
                </button>
                <div>
                    <span className="quiz-player-course-name">{course?.course_name}</span>
                </div>
                <div className="quiz-player-score-display">
                    Score: <span className="quiz-player-score-value">{score.correct}/{score.total}</span>
                </div>
            </header>

            {/* Progress */}
            <div className="quiz-player-progress-section">
                <div className="quiz-player-progress-text">
                    Question {currentIndex + 1} of {questions.length}
                </div>
                <div className="quiz-player-progress-bar">
                    <div
                        className="quiz-player-progress-fill"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="quiz-player-question-card">
                {currentQuestion.attempted && (
                    <div className="quiz-player-attempted-badge">✓ Answered</div>
                )}

                <h2 className="quiz-player-question-text">{currentQuestion.question_text}</h2>

                <div className="quiz-player-options-list">
                    {['A', 'B', 'C', 'D'].map(opt => {
                        const optValue = currentQuestion[`option_${opt.toLowerCase()}`];
                        if (!optValue) return null;

                        const isCorrect = feedback?.correct_answer === opt;
                        const isSelected = selectedAnswer === opt;
                        const isWrong = showResult && isSelected && !feedback.is_correct;

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
                                className={getOptionClass(opt)}
                            >
                                <span className="quiz-player-option-label">{opt}</span>
                                <span className="quiz-player-option-text">{optValue}</span>
                                {showResult && isCorrect && <span className="quiz-player-checkmark">✓</span>}
                                {isWrong && <span className="quiz-player-xmark">✗</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback */}
                {feedback && !feedback.error && (
                    <div className={`quiz-player-feedback ${feedback.is_correct ? 'correct' : 'wrong'}`}>
                        {feedback.is_correct ? '🎉 Correct!' : '❌ Incorrect'}
                        {!feedback.is_correct && (
                            <span> The correct answer is {feedback.correct_answer}</span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="quiz-player-actions">
                    <button
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="quiz-player-nav-btn"
                    >
                        ← Previous
                    </button>

                    {!feedback && !currentQuestion.attempted ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!selectedAnswer}
                            className="quiz-player-submit-btn"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={isLastQuestion ? () => navigate('/student/quiz/results') : goToNext}
                            className="quiz-player-submit-btn"
                        >
                            {isLastQuestion ? 'View Results →' : 'Next Question →'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizPlayer;
