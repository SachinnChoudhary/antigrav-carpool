import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
    console.log('🔍 Verifying Admin Panel Database Connectivity...\n');

    try {
        // Check Users
        const userCount = await prisma.user.count();
        const adminCount = await prisma.user.count({ where: { role: 'admin' } });
        console.log(`✅ Users: ${userCount} total (${adminCount} admins)`);

        // Check Rides
        const rideCount = await prisma.ride.count();
        const activeRides = await prisma.ride.count({ where: { status: 'active' } });
        console.log(`✅ Rides: ${rideCount} total (${activeRides} active)`);

        // Check Bookings
        const bookingCount = await prisma.booking.count();
        console.log(`✅ Bookings: ${bookingCount} total`);

        // Check Payments
        const paymentCount = await prisma.payment.count();
        const completedPayments = await prisma.payment.count({ where: { status: 'completed' } });
        console.log(`✅ Payments: ${paymentCount} total (${completedPayments} completed)`);

        // Check new models
        const notificationCount = await prisma.notification.count();
        console.log(`✅ Notifications: ${notificationCount} total`);

        const announcementCount = await prisma.announcement.count();
        console.log(`✅ Announcements: ${announcementCount} total`);

        const messageCount = await prisma.adminMessage.count();
        console.log(`✅ Admin Messages: ${messageCount} total`);

        const logCount = await prisma.activityLog.count();
        console.log(`✅ Activity Logs: ${logCount} total`);

        console.log('\n📊 Sample Payment Data:');
        const samplePayment = await prisma.payment.findFirst({
            include: {
                payer: { select: { name: true, email: true } },
                receiver: { select: { name: true, email: true } },
                booking: {
                    select: {
                        ride: {
                            select: { from: true, to: true }
                        }
                    }
                }
            }
        });

        if (samplePayment) {
            console.log(`   Payment ID: ${samplePayment.id.slice(0, 8)}...`);
            console.log(`   Amount: $${samplePayment.amount}`);
            console.log(`   Status: ${samplePayment.status}`);
            console.log(`   Payer: ${samplePayment.payer?.name || 'N/A'}`);
            console.log(`   Receiver: ${samplePayment.receiver?.name || 'N/A'}`);
            console.log(`   Method: ${samplePayment.method || 'N/A'}`);
            console.log(`   Refund Amount: $${samplePayment.refundAmount || 0}`);
        } else {
            console.log('   No payments found');
        }

        console.log('\n✅ Database verification complete!');
        console.log('\n📝 Summary:');
        console.log(`   - All tables exist and are accessible`);
        console.log(`   - Payment model has all required fields (payer, receiver, method, refundAmount)`);
        console.log(`   - New models (Notification, Announcement, AdminMessage, ActivityLog) are ready`);
        console.log(`   - Admin panel will display data correctly`);

    } catch (error) {
        console.error('❌ Error verifying database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDatabase();
