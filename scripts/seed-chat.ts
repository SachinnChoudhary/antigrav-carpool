import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedChat() {
    console.log('Seeding chat message...');

    // 1. Get or Create Admin User
    let admin = await prisma.user.findFirst({
        where: { email: 'admin@example.com' }
    });

    if (!admin) {
        console.log('Creating admin user...');
        admin = await prisma.user.create({
            data: {
                name: 'System Admin',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
                profileImage: 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff'
            }
        });
    }

    // 2. Get Target User (The one likely logged in, or just the first non-admin)
    // We'll try to find 'test@example.com' first, or just the first user.
    let targetUser = await prisma.user.findFirst({
        where: {
            email: 'test@example.com',
            NOT: { id: admin.id }
        }
    });

    if (!targetUser) {
        targetUser = await prisma.user.findFirst({
            where: { NOT: { id: admin.id } }
        });
    }

    if (!targetUser) {
        console.log('Creating target user...');
        targetUser = await prisma.user.create({
            data: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'passenger'
            }
        });
    }

    console.log(`Sending message from ${admin.name} to ${targetUser.name}...`);

    // 3. Create a Ride (Admin is Driver) to establish context
    const ride = await prisma.ride.create({
        data: {
            driverId: admin.id,
            from: 'Antigravity HQ',
            to: 'User Location',
            date: new Date(),
            time: '10:00 AM',
            seats: 4,
            price: 0,
            status: 'active'
        }
    });

    // 4. Create a Booking (Target User is Passenger)
    const booking = await prisma.booking.create({
        data: {
            rideId: ride.id,
            passengerId: targetUser.id,
            seats: 1,
            status: 'confirmed'
        }
    });

    // 5. Create Message
    const message = await prisma.message.create({
        data: {
            bookingId: booking.id,
            senderId: admin.id,
            receiverId: targetUser.id,
            content: 'Hello! This is a test message from the admin to verify your inbox.',
            read: false
        }
    });

    console.log('Message seeded successfully!');
    console.log('Conversation ID (Booking ID):', booking.id);
}

seedChat()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
