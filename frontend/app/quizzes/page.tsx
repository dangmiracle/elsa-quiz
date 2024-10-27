// app/quizzes/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import QuizList from '../../components/QuizList';
import Leaderboard from '../../components/Leaderboard'; // Import the Leaderboard component
import api from '../../lib/api';
import withAuth from '../../components/withAuth'; // Import the HOC

interface Quiz {
    id: string;
    title: string;
    description: string;
}

function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    useEffect(() => {
        const fetchQuizzes = async () => {
            const response = await api.get('/quizzes');
            setQuizzes(response.data.data);
        };
        fetchQuizzes();
    }, []);

    return (
        <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quiz List Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-8">Available Quizzes</h2>
                <QuizList quizzes={quizzes} />
            </div>

            {/* Leaderboard Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <Leaderboard />
            </div>
        </div>
    );
}

// Wrap the component export with `withAuth`
export default withAuth(QuizzesPage);
