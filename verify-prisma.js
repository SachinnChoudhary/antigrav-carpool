const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Just check if we can construct the query object without error
        // We don't need to actually execute it against a real ID if we just want to check client validation,
        // but running it is better.
        const ride = await prisma.ride.findFirst({
            include: {
                vehicle: true
            }
        });
        console.log("Successfully queried with include: { vehicle: true }");
    } catch (e) {
        console.error("Error querying with include: { vehicle: true }");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
