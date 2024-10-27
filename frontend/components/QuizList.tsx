// components/QuizList.tsx
import React from 'react';
import Link from 'next/link';

interface Quiz {
    id: string;
    title: string;
    description: string;
}

interface QuizListProps {
    quizzes: Quiz[];
}

const QuizList: React.FC<QuizListProps> = ({ quizzes }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
            <Link href={`/quizzes/${quiz.id}`} key={quiz.id}>
                <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer hover:bg-blue-50">
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">{quiz.title}</h3>
                    <p className="text-gray-600">{quiz.description}</p>
                </div>
            </Link>
        ))}
    </div>
);

export default QuizList;
