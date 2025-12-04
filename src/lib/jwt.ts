import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface JWTPayload {
    userId: string;
    email: string;
    role?: string;
    iat?: number;
    exp?: number;
}

export async function createToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 days
        .sign(secret);
}

// Alias for createToken
export const signToken = createToken;

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return {
            userId: payload.userId as string,
            email: payload.email as string,
            role: payload.role as string | undefined,
            iat: payload.iat,
            exp: payload.exp,
        };
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

export async function refreshToken(token: string): Promise<string | null> {
    const payload = await verifyToken(token);

    if (!payload) {
        return null;
    }

    // Create new token with same payload
    return await createToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
    });
}
