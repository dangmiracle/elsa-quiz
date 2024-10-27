"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Cookies from 'js-cookie';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the default form submission
        try {
            const response = await api.post('/auth/login', { username });
            Cookies.set('token', response.data.data.token);
            Cookies.set('username', username);
            router.push('/quizzes');
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm text-center">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button
                        type="submit" // Set type to "submit" for form submission
                        className="w-full p-3 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition-colors"
                    >
                        Go
                    </button>
                </form>
            </div>
        </div>
    );
}
