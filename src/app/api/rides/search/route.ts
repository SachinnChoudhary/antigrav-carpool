import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const from = searchParams.get("from") || "";
        const to = searchParams.get("to") || "";
        const date = searchParams.get("date") || "";
        const passengers = parseInt(searchParams.get("passengers") || "1");

        // Fetch all active rides
        const rides = await prisma.ride.findMany({
            where: {
                where: whereClause,
                include: {
                    driver: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImage: true,
                            rating: true,
                            verified: true
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            });

        // Filter rides based on route matching
        // Show rides that overlap with the search route (partial matching)
        const matchingRides = rides.filter((ride) => {
            const rideFrom = ride.from.toLowerCase();
            const rideTo = ride.to.toLowerCase();
            const searchFrom = from.toLowerCase();
            const searchTo = to.toLowerCase();

            // If no search criteria, show all
            if (!from && !to) return true;

            // Partial match logic - show if either origin or destination matches
            // Improved matching: Check if the main city (first part before comma) matches
            const getMainLocation = (loc: string) => loc.split(',')[0].trim().toLowerCase();

            const rideFromMain = getMainLocation(rideFrom);
            const rideToMain = getMainLocation(rideTo);
            const searchFromMain = getMainLocation(searchFrom);
            const searchToMain = getMainLocation(searchTo);

            const fromMatches = !from ||
                rideFrom.includes(searchFrom) ||
                searchFrom.includes(rideFrom) ||
                rideFromMain.includes(searchFromMain) ||
                searchFromMain.includes(rideFromMain);

            const toMatches = !to ||
                rideTo.includes(searchTo) ||
                searchTo.includes(rideTo) ||
                rideToMain.includes(searchToMain) ||
                searchToMain.includes(rideToMain);

            return fromMatches || toMatches;
        });

        // Format response
        const formattedRides = matchingRides.map((ride) => ({
            id: ride.id,
            driverName: ride.driver.name,
            driverPhoto: ride.driver.profileImage,
            rating: ride.driver.rating || 4.5,
            price: ride.price,
            from: ride.from,
            fromLat: ride.fromLat,
            fromLng: ride.fromLng,
            to: ride.to,
            toLat: ride.toLat,
            toLng: ride.toLng,
            time: ride.time,
            date: new Date(ride.date).toLocaleDateString(),
            duration: ride.duration ? `${Math.floor(ride.duration / 60)}h ${ride.duration % 60}m` : "N/A",
            distance: ride.distance ? `${ride.distance.toFixed(1)} km` : "N/A",
            seats: ride.seats,
            isVerified: ride.driver.verified,
            amenities: []
        }));

        return NextResponse.json({
            rides: formattedRides,
            total: formattedRides.length
        });

    } catch (error) {
        console.error("Search rides error:", error);
        return NextResponse.json(
            { error: "Failed to search rides" },
            { status: 500 }
        );
    }
}
