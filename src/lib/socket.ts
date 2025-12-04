import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
            path: '/api/socket',
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket?.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Chat events
export const joinRoom = (bookingId: string) => {
    socket?.emit('join-room', bookingId);
};

export const leaveRoom = (bookingId: string) => {
    socket?.emit('leave-room', bookingId);
};

export const sendMessage = (data: {
    bookingId: string;
    senderId: string;
    receiverId: string;
    content: string;
}) => {
    socket?.emit('send-message', data);
};

export const onMessageReceived = (callback: (message: any) => void) => {
    socket?.on('message-received', callback);
};

export const onTyping = (callback: (data: { userId: string; isTyping: boolean }) => void) => {
    socket?.on('typing', callback);
};

export const emitTyping = (bookingId: string, userId: string, isTyping: boolean) => {
    socket?.emit('typing', { bookingId, userId, isTyping });
};
