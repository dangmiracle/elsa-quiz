// app/quizzes/[quizId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QuizDetail from '../../../components/QuizDetail';
import Leaderboard from '../../../components/Leaderboard';
import api from '../../../lib/api';
import withAuth from '../../../components/withAuth'; // Import withAuth
import createWebSocket from '../../../lib/websocket';

interface Question {
    id: string;
    questionText: string;
    score:number;
    title: string;
    difficulty: string;
    options: { id: string; optionText: string }[];
}

function QuizDetailPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [title, setTitle] = useState('');
    const [score, setScore] = useState('');
    const [description, setDescription] = useState('');
    const { quizId } = useParams();

    useEffect(() => {
        if (!quizId) return;

        const fetchQuizData = async () => {
            const response = await api.get(`/quizzes/${quizId}`);
            const quizData = response.data.data;
            setQuestions(quizData.questions.map((item: any) => item.question));
            setTitle(quizData.title);
            setDescription(quizData.description);
        };

        fetchQuizData();
    }, [quizId]);

    const handleAnswerSubmit = (newScore: number) => {
        setScore(newScore);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="grid grid-cols-3 gap-4 p-6 w-full item-center">
                {/* Quiz Questions */}
                <div className="col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800">{title}</h2>
                    <p className="text-lg text-gray-600 mb-4">{description}</p>
                    <QuizDetail
                        quizId={quizId as string}
                        questions={questions}
                        onAnswerSubmit={handleAnswerSubmit}
                    />
                </div>
            </div>
        </div>

    );
}

// Wrap with `withAuth`
export default withAuth(QuizDetailPage);
