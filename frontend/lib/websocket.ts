// lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const initiateSocketConnection = () => {
    socket = io(process.env.NEXT_PUBLIC_WS_URL as string, {
        transports: ['websocket'],
        withCredentials: true,
    });

    socket.on('connect', () => {
        console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
    });
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        console.log('Socket disconnected');
    }
};

export const subscribeToEvent = (eventName: string, callback: (data: any) => void) => {
    if (!socket) return;
    socket.on(eventName, callback);
};

export const unsubscribeFromEvent = (eventName: string) => {
    if (!socket) return;
    socket.off(eventName);
};

export const emitEvent = (eventName: string, data: any) => {
    if (!socket) return;
    socket.emit(eventName, data);
};
