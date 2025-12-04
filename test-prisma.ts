import { prisma } from './src/lib/prisma';

async function testConnection() {
    try {
        console.log('Testing Prisma connection...');

        // Test database connection
        await prisma.$connect();
        console.log('✓ Connected to database');

        // Test query
        const userCount = await prisma.user.count();
        console.log(`✓ Found ${userCount} users in database`);

        await prisma.$disconnect();
        console.log('✓ Disconnected from database');

        process.exit(0);
    } catch (error) {
        console.error('✗ Error:', error);
        process.exit(1);
    }
}

testConnection();
