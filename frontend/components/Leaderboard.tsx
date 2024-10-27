import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { initiateSocketConnection, disconnectSocket, subscribeToEvent, unsubscribeFromEvent } from '../lib/websocket';

interface LeaderboardData {
    userId: string;
    username: string;
    score: number;
}

interface LeaderboardProps {
    quizId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ quizId }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>([]);

    useEffect(() => {
        // Fetch initial leaderboard data from the backend
        const fetchLeaderboardData = async () => {
            try {
                const response = await api.get(`/leaderboards/global`);
                setLeaderboard(response.data.data); // Assume API returns leaderboard in data.data
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
        };

        fetchLeaderboardData();
        initiateSocketConnection();

        // Subscribe to leaderboard updates
        const handleLeaderboardUpdate = (data: any[]) => {
            console.log('Received leaderboard update:', data);
            const formattedData = Array.isArray(data) ? data : JSON.parse(data);
            setLeaderboard(formattedData);
        };

        subscribeToEvent('leaderBoardUpdated', handleLeaderboardUpdate);

        // Cleanup on component unmount
        return () => {
            unsubscribeFromEvent('leaderBoardUpdated');
            disconnectSocket();
        };
    }, [quizId]);

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Leaderboard</h2>
            <ul className="space-y-2">
                {leaderboard.map((entry, index) => (
                    <li
                        key={entry.userId}
                        className="flex justify-between items-center p-2 bg-gray-100 rounded-lg"
                    >
                        <span className="text-gray-700 font-semibold">{index + 1}. {entry.username}</span>
                        <span className="text-blue-600 font-bold">{entry.score}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;
