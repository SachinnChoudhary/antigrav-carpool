import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

async function createToken(payload: any): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);
}

async function verifyApi() {
    console.log('Verifying API...');

    // Generate a token for a test user (ID doesn't need to exist in DB for the token to be valid signature-wise, 
    // but the API checks if user exists for role? No, verifyToken just decodes. 
    // Wait, the API might check user existence if I added that logic. 
    // Looking at the code: `const ticket = await prisma.supportTicket.create({ data: { userId: decoded.userId ... } })`
    // Prisma will fail if userId doesn't exist because of foreign key constraint!
    // So I need a valid user ID.
    // I'll use the one from the previous run or a hardcoded one if I know it.
    // Better: I'll assume the seed or previous script created a user.
    // I'll try to fetch a user first? No, I can't use prisma client here easily if I want to avoid the "stale client" issue 
    // (though running a script starts a NEW prisma client, so it should be fine).
    // Actually, the previous script `verify-support-ticket.ts` created a user.
    // I'll use Prisma to get a user, then use fetch to call API.

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found in DB to test with.');
        process.exit(1);
    }

    const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role
    });

    // Test 1: Authorization Header
    console.log('Test 1: Authorization Header');
    const responseAuth = await fetch('http://localhost:3000/api/support/tickets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            subject: 'API Auth Header Test',
            message: 'Testing API with Authorization header',
            category: 'technical',
            priority: 'low'
        })
    });

    if (responseAuth.status === 201) {
        console.log('Success: Authorization Header worked');
    } else {
        console.error(`Failed: Authorization Header returned ${responseAuth.status}`);
    }

    // Test 2: Cookie
    console.log('Test 2: Cookie');
    const responseCookie = await fetch('http://localhost:3000/api/support/tickets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `token=${token}`
        },
        body: JSON.stringify({
            subject: 'API Cookie Test',
            message: 'Testing API with Cookie',
            category: 'technical',
            priority: 'low'
        })
    });

    if (responseCookie.status === 201) {
        console.log('Success: Cookie worked');
    } else {
        console.error(`Failed: Cookie returned ${responseCookie.status}`);
        const text = await responseCookie.text();
        console.error(text);
        process.exit(1);
    }

    await prisma.$disconnect();
}

verifyApi().catch(console.error);
