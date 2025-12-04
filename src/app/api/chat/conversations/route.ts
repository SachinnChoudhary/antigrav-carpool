import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
    try {
        // 1. Authentication
        let token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            token = request.cookies.get('token')?.value;
        }

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUserId = decoded.userId;

        // 2. Fetch Bookings (Conversations)
        // A conversation exists for every booking where the user is either the passenger or the driver
        const bookings = await prisma.booking.findMany({
            where: {
                OR: [
                    { passengerId: currentUserId },
                    { ride: { driverId: currentUserId } }
                ]
            },
            include: {
                passenger: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                    }
                },
                ride: {
                    include: {
                        driver: {
                            select: {
                                id: true,
                                name: true,
                                profileImage: true,
                            }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                receiverId: currentUserId,
                                read: false
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        // 3. Format Response
        const conversations = bookings.map(booking => {
            const isDriver = booking.ride.driver.id === currentUserId;
            const otherUser = isDriver ? booking.passenger : booking.ride.driver;
            const lastMessage = booking.messages[0];

            return {
                id: booking.id, // Conversation ID is the Booking ID
                otherUser: {
                    id: otherUser.id,
                    name: otherUser.name,
                    profileImage: otherUser.profileImage,
                    role: isDriver ? 'passenger' : 'driver'
                },
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    senderId: lastMessage.senderId
                } : null,
                unreadCount: booking._count.messages,
                ride: {
                    from: booking.ride.from,
                    to: booking.ride.to,
                    date: booking.ride.date,
                    status: booking.ride.status
                },
                status: booking.status
            };
        });

        // Sort by last message time if available, otherwise by booking update time
        conversations.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        return NextResponse.json({ conversations });

    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
