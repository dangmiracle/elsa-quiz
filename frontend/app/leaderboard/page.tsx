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
                const response = await api.get("/leaderboards/global");
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
            setLeaderboard(data);
        };
        subscribeToEvent('leaderBoardUpdated', handleLeaderboardUpdate);

    }, [quizId]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Leaderboard</h2>
            <ul>
                {leaderboard.map((entry) => (
                    <li key={entry.userId} className="text-gray-700 font-semibold">
                        {entry.username}: {entry.score}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;