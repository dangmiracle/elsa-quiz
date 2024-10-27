// components/QuizDetail.tsx
import React, { useState, useEffect } from 'react';
import api from '../lib/api';

interface Question {
    id: string;
    questionText: string;
    type: 'single' | 'multiple';
    score: number;
    difficulty: string;
    options: { id: string; optionText: string }[];
}

interface QuizDetailProps {
    quizId: string;
    questions: Question[];
    onAnswerSubmit: (score: number) => void;
    title: string;
    description: string;
}

const QuizDetail: React.FC<QuizDetailProps> = ({ quizId, questions = [], onAnswerSubmit, title, description }) => {
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string[] }>({});
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [highlightedAnswers, setHighlightedAnswers] = useState<{ [key: string]: { correctOptionIds: string[], userAnswers: string[] } }>({});

    // Fetch submission history on component mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get(`/quizzes/${quizId}/history`);
                const answerHistories = response.data.data.answerHistories;

                if (answerHistories && answerHistories.length > 0) {
                    const results = answerHistories.reduce((acc: any, record: any) => {
                        acc[record.questionId] = {
                            correctOptionIds: record.correctOptionIds,
                            userAnswers: record.userAnswers
                        };
                        return acc;
                    }, {});
                    setHighlightedAnswers(results);
                    setSelectedOptions(
                        answerHistories.reduce((acc: any, record: any) => {
                            acc[record.questionId] = record.optionIds;
                            return acc;
                        }, {})
                    );
                    setScore(response.data.data.score);
                    setSubmitted(true);
                    setIsSubmitDisabled(true);
                } else {
                    setIsSubmitDisabled(false);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
                setIsSubmitDisabled(false); // Allow submission if fetching history fails
            }
        };

        fetchHistory();
    }, [quizId]);

    const handleOptionChange = (questionId: string, optionId: string, type: 'single' | 'multiple') => {
        if (submitted) return;
        setSelectedOptions((prev) => {
            const currentSelections = prev[questionId] || [];
            if (type === 'single') {
                return { ...prev, [questionId]: [optionId] };
            } else {
                const updatedSelections = currentSelections.includes(optionId)
                    ? currentSelections.filter((id) => id !== optionId)
                    : [...currentSelections, optionId];
                return { ...prev, [questionId]: updatedSelections };
            }
        });
    };

    useEffect(() => {
        const allAnswered = questions.every(
            (question) => selectedOptions[question.id] && selectedOptions[question.id].length > 0
        );
        setIsSubmitDisabled(!allAnswered || submitted);
    }, [selectedOptions, questions, submitted]);

    const handleSubmitAll = async () => {
        const answers = Object.keys(selectedOptions).map(questionId => ({
            questionId,
            optionIds: selectedOptions[questionId] || []
        }));

        try {
            const response = await api.post(`/quizzes/${quizId}/answers`, answers);
            setScore(response.data.data.updatedScore);
            setSubmitted(true);

            const results = response.data.data.results.reduce((acc: any, result: any) => {
                acc[result.questionId] = {
                    correctOptionIds: result.correctOptionIds,
                    userAnswers: selectedOptions[result.questionId] || []
                };
                return acc;
            }, {});
            setHighlightedAnswers(results);
        } catch (error) {
            console.error("Error submitting answers:", error);
        }
    };

    if (!Array.isArray(questions) || questions.length === 0) {
        return <p>No questions available for this quiz.</p>;
    }

    return (
        <div className="flex flex-col items-center space-y-8 p-6">
            <p className="text-lg text-red-600 font-semibold mb-4">Your Score: {score}</p>

            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{title}</h1>
                <p className="text-lg text-gray-600">{description}</p>
            </div>

            <div className="w-full max-w-3xl space-y-6">
                {questions.map((question) => (
                    <div key={question.id} className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                        <h3 className="font-semibold text-xl text-gray-800 mb-2">{question.questionText}</h3>
                        <p className="text-sm text-gray-500 mb-4">Score: {question.score} • Difficulty: {question.difficulty}</p>
                        <div className="space-y-2">
                            {question.options.map((option) => {
                                const isSelected = selectedOptions[question.id]?.includes(option.id) || false;
                                const isCorrect = highlightedAnswers[question.id]?.correctOptionIds?.includes(option.id);
                                const isUserAnswer = highlightedAnswers[question.id]?.userAnswers?.includes(option.id);

                                let optionClass = "text-gray-700";
                                if (submitted) {
                                    if (isCorrect) optionClass = "text-green-600 font-semibold";
                                    else if (isUserAnswer && !isCorrect) optionClass = "text-red-600 font-semibold";
                                }

                                return (
                                    <label key={option.id} className={`flex items-center space-x-2 cursor-pointer ${optionClass}`}>
                                        <input
                                            type={question.type === 'single' ? 'radio' : 'checkbox'}
                                            name={question.id}
                                            value={option.id}
                                            checked={isSelected}
                                            onChange={() => handleOptionChange(question.id, option.id, question.type)}
                                            className="form-checkbox text-blue-600 focus:ring-0"
                                            disabled={submitted}
                                        />
                                        <span>{option.optionText}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {!submitted && (
                <button
                    onClick={handleSubmitAll}
                    disabled={isSubmitDisabled}
                    className={`mt-8 px-6 py-3 rounded-full font-semibold text-white ${
                        isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                    } focus:outline-none`}
                >
                    Submit All Answers
                </button>
            )}
        </div>
    );
};

export default QuizDetail;
