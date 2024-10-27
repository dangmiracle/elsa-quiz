// components/Leaderboard.tsx
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import withAuth from '../components/withAuth';


interface LeaderboardEntry {
    userId: string;
    username: string;
    score: number;
}

interface LeaderboardProps {
    quizId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ quizId }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const response = await api.get(`/leaderboards/${quizId}`);
            console.log(response)

            setLeaderboard(response.data);
        };

        fetchLeaderboard();
    }, [quizId]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Leaderboard</h2>
            <ul className="space-y-4">
                {leaderboard.map((entry, index) => (
                    <li key={entry.userId} className="flex justify-between p-2 bg-gray-100 rounded-md">
                        <span className="font-semibold">{index + 1}. {entry.username}</span>
                        <span className="text-gray-600">Score: {entry.totalScore}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default withAuth(Leaderboard);
