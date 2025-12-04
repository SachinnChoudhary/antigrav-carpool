import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { prisma } from '@/lib/prisma';

export const config = {
    api: {
        bodyParser: false,
    },
};

let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
    if (!io) {
        // @ts-ignore
        const httpServer: HTTPServer = req.socket.server;

        io = new SocketIOServer(httpServer, {
            path: '/api/socket',
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
            },
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Join a booking room
            socket.on('join-room', (bookingId: string) => {
                socket.join(bookingId);
                console.log(`Socket ${socket.id} joined room ${bookingId}`);
            });

            // Leave a booking room
            socket.on('leave-room', (bookingId: string) => {
                socket.leave(bookingId);
                console.log(`Socket ${socket.id} left room ${bookingId}`);
            });

            // Handle new message
            socket.on('send-message', async (data: {
                bookingId: string;
                senderId: string;
                receiverId: string;
                content: string;
            }) => {
                try {
                    // Save message to database
                    const message = await prisma.message.create({
                        data: {
                            bookingId: data.bookingId,
                            senderId: data.senderId,
                            receiverId: data.receiverId,
                            content: data.content,
                        },
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true,
                                    profileImage: true,
                                },
                            },
                        },
                    });

                    // Broadcast to room
                    io?.to(data.bookingId).emit('message-received', message);
                } catch (error) {
                    console.error('Error saving message:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            // Handle typing indicator
            socket.on('typing', (data: { bookingId: string; userId: string; isTyping: boolean }) => {
                socket.to(data.bookingId).emit('typing', {
                    userId: data.userId,
                    isTyping: data.isTyping,
                });
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    return new Response('Socket.IO server initialized', { status: 200 });
}
