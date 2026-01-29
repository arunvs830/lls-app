import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mcqApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/MaterialQuizPlayer.css';

const MaterialQuizPlayer = () => {
    const { materialId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0, marks: 0 });
    const [loading, setLoading] = useState(true);

    const studentId = user?.id || 1;

    useEffect(() => {
        loadQuiz();
    }, [materialId]);

    const loadQuiz = async () => {
        try {
            const quizData = await mcqApi.getMaterialQuiz(materialId, studentId);
            setQuestions(quizData.questions || []);
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
            <div className="quiz-loading-container">
                <div className="quiz-loading-spinner"></div>
                <p className="quiz-loading-text">Loading quiz...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="quiz-player-container">
                <div className="quiz-empty-state">
                    <span className="quiz-empty-icon">📝</span>
                    <h3>No questions in this quiz</h3>
                    <button onClick={() => navigate(-1)} className="quiz-back-btn">
                        ← Back to Material
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const allCompleted = questions.every(q => q.attempted) || (feedback && isLastQuestion);

    return (
        <div className="quiz-player-container">
            {/* Header */}
            <header className="quiz-header">
                <button onClick={() => navigate(-1)} className="quiz-exit-btn">
                    ← Back to Material
                </button>
                <div className="quiz-score-display">
                    Score: <span className="quiz-score-value">{score.correct}/{score.total}</span>
                </div>
            </header>

            {/* Progress */}
            <div className="quiz-progress-section">
                <div className="quiz-progress-text">
                    Question {currentIndex + 1} of {questions.length}
                </div>
                <div className="quiz-progress-bar">
                    <div
                        className="quiz-progress-fill"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="quiz-question-card">
                {currentQuestion.attempted && (
                    <div className="quiz-attempted-badge">✓ Answered</div>
                )}

                <h2 className="quiz-question-text">{currentQuestion.question_text}</h2>

                <div className="quiz-options-list">
                    {['A', 'B', 'C', 'D'].map(opt => {
                        const optValue = currentQuestion[`option_${opt.toLowerCase()}`];
                        if (!optValue) return null;

                        const isSelected = selectedAnswer === opt;
                        const showResult = feedback && !feedback.error;
                        const isCorrect = feedback?.correct_answer === opt;
                        const isWrong = showResult && isSelected && !feedback.is_correct;

                        let itemClass = 'quiz-option-item';
                        if (isSelected && !showResult) itemClass += ' selected';
                        if (showResult && isCorrect) itemClass += ' correct';
                        if (isWrong) itemClass += ' wrong';

                        return (
                            <div
                                key={`${currentIndex}-${opt}`}
                                onClick={() => !feedback && !currentQuestion.attempted && setSelectedAnswer(opt)}
                                className={itemClass}
                            >
                                <span className="quiz-option-input-label">{opt}</span>
                                <span className="quiz-option-text">{optValue}</span>
                                {showResult && isCorrect && <span className="quiz-checkmark">✓</span>}
                                {isWrong && <span className="quiz-xmark">✗</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Feedback */}
                {feedback && !feedback.error && (
                    <div className={`quiz-feedback ${feedback.is_correct ? 'correct' : 'wrong'}`}>
                        {feedback.is_correct ? '🎉 Correct!' : '❌ Incorrect'}
                        {!feedback.is_correct && (
                            <span> The correct answer is {feedback.correct_answer}</span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="quiz-actions">
                    <button
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="quiz-nav-btn"
                    >
                        ← Previous
                    </button>

                    {!feedback && !currentQuestion.attempted ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!selectedAnswer}
                            className="quiz-submit-btn"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={allCompleted ? () => navigate('/student/quiz/results') : goToNext}
                            className="quiz-submit-btn"
                        >
                            {allCompleted ? 'View Results →' : 'Next Question →'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaterialQuizPlayer;
