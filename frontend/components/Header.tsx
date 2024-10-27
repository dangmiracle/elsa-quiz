// components/Header.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { initiateSocketConnection, subscribeToEvent, disconnectSocket, unsubscribeFromEvent } from '../lib/websocket';
import { HomeIcon } from '@heroicons/react/24/solid';
import api from '../lib/api';

const Header: React.FC = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [totalScore, setTotalScore] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        // Retrieve username and initial score from cookies
        const storedUsername = Cookies.get('username');
        if (storedUsername) {
            setUsername(storedUsername as string);
            fetchTotalScore(storedUsername); // Fetch score on load if username is present
        }

        // Initialize socket connection
        initiateSocketConnection();

        // Subscribe to the `userScoreUpdated` event
        const handleUserScoreUpdate = (data: { username: string; userId:string, score: number }) => {
            console.log('Received userScoreUpdated event:', data);
            var formatedData = JSON.parse(data);
            // Update totalScore if the event's username matches the current user
            if (formatedData.username === Cookies.get('username')) {
                setTotalScore(parseInt(formatedData.score) + totalScore);
            }
        };

        subscribeToEvent('userScoreUpdated', handleUserScoreUpdate);

        // Cleanup on component unmount
        return () => {
            unsubscribeFromEvent('userScoreUpdated');
            disconnectSocket();
        };
    }, [username]);

    const fetchTotalScore = async (username: string) => {
        try {
            const response = await api.get('/users/total-score');
            console.log("Total Score API response:", response); // Debugging log
            setTotalScore(response.data.score);
        } catch (error) {
            console.error('Error fetching total score:', error);
        }
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('username');
        setUsername(null);
        setTotalScore(0);
        router.replace('/login'); // Redirect to login page
    };

    const handleHomeClick = () => {
        router.push('/quizzes');
    };

    return (
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <HomeIcon
                    className="h-6 w-6 cursor-pointer hover:text-gray-300 transition-colors"
                    onClick={handleHomeClick}
                />
                <h1 className="text-2xl font-bold">Quiz App</h1>
                <span className="font-semibold">Total Score: {totalScore}</span>
            </div>
            <div className="flex items-center gap-4">
                {username && (
                    <span>
                        Welcome, {username}!
                    </span>
                )}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
