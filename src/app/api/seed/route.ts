import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // 1. Get or create a driver
        let driver = await prisma.user.findFirst({
            where: { role: "driver" }
        });

        if (!driver) {
            // Try to find any user
            driver = await prisma.user.findFirst();

            if (!driver) {
                // Create a dummy driver
                driver = await prisma.user.create({
                    data: {
                        name: "Test Driver",
                        email: "driver@test.com",
                        role: "driver",
                        verified: true,
                        rating: 4.8
                    }
                });
            }
        }

        const driverId = driver.id;

        // 2. Define 10 realistic rides
        const ridesData = [
            {
                from: "Delhi, India",
                fromLat: 28.6139,
                fromLng: 77.2090,
                to: "Mumbai, Maharashtra, India",
                toLat: 19.0760,
                toLng: 72.8777,
                distance: 1400,
                duration: 1440, // 24 hours
                price: 4000,
                seats: 3,
                time: "06:00 AM"
            },
            {
                from: "Mumbai, Maharashtra, India",
                fromLat: 19.0760,
                fromLng: 72.8777,
                to: "Pune, Maharashtra, India",
                toLat: 18.5204,
                toLng: 73.8567,
                distance: 150,
                duration: 180, // 3 hours
                price: 500,
                seats: 2,
                time: "08:00 AM"
            },
            {
                from: "Bangalore, Karnataka, India",
                fromLat: 12.9716,
                fromLng: 77.5946,
                to: "Chennai, Tamil Nadu, India",
                toLat: 13.0827,
                toLng: 80.2707,
                distance: 350,
                duration: 360, // 6 hours
                price: 1200,
                seats: 3,
                time: "07:00 AM"
            },
            {
                from: "Delhi, India",
                fromLat: 28.6139,
                fromLng: 77.2090,
                to: "Chandigarh, India",
                toLat: 30.7333,
                toLng: 76.7794,
                distance: 250,
                duration: 240, // 4 hours
                price: 800,
                seats: 4,
                time: "09:00 AM"
            },
            {
                from: "Delhi, India",
                fromLat: 28.6139,
                fromLng: 77.2090,
                to: "Jaipur, Rajasthan, India",
                toLat: 26.9124,
                toLng: 75.7873,
                distance: 280,
                duration: 300, // 5 hours
                price: 900,
                seats: 3,
                time: "10:00 AM"
            },
            {
                from: "Hyderabad, Telangana, India",
                fromLat: 17.3850,
                fromLng: 78.4867,
                to: "Bangalore, Karnataka, India",
                toLat: 12.9716,
                toLng: 77.5946,
                distance: 570,
                duration: 600, // 10 hours
                price: 1800,
                seats: 2,
                time: "05:00 AM"
            },
            {
                from: "Chennai, Tamil Nadu, India",
                fromLat: 13.0827,
                fromLng: 80.2707,
                to: "Pondicherry, Puducherry, India",
                toLat: 11.9416,
                toLng: 79.8083,
                distance: 150,
                duration: 210, // 3.5 hours
                price: 500,
                seats: 3,
                time: "11:00 AM"
            },
            {
                from: "Mumbai, Maharashtra, India",
                fromLat: 19.0760,
                fromLng: 72.8777,
                to: "Goa, India",
                toLat: 15.2993,
                toLng: 74.1240,
                distance: 590,
                duration: 660, // 11 hours
                price: 2000,
                seats: 4,
                time: "10:00 PM"
            },
            {
                from: "Kolkata, West Bengal, India",
                fromLat: 22.5726,
                fromLng: 88.3639,
                to: "Digha, West Bengal, India",
                toLat: 21.6266,
                toLng: 87.5074,
                distance: 180,
                duration: 240, // 4 hours
                price: 600,
                seats: 3,
                time: "06:00 AM"
            },
            {
                from: "Ahmedabad, Gujarat, India",
                fromLat: 23.0225,
                fromLng: 72.5714,
                to: "Surat, Gujarat, India",
                toLat: 21.1702,
                toLng: 72.8311,
                distance: 260,
                duration: 270, // 4.5 hours
                price: 800,
                seats: 3,
                time: "08:00 AM"
            }
        ];

        // 3. Insert rides
        const createdRides = [];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        for (const ride of ridesData) {
            const newRide = await prisma.ride.create({
                data: {
                    driverId: driverId,
                    from: ride.from,
                    fromLat: ride.fromLat,
                    fromLng: ride.fromLng,
                    to: ride.to,
                    toLat: ride.toLat,
                    toLng: ride.toLng,
                    date: tomorrow,
                    time: ride.time,
                    seats: ride.seats,
                    price: ride.price,
                    distance: ride.distance,
                    duration: ride.duration,
                    status: "active",
                    amenities: "AC, Music, Charger",
                    flexibleDates: true,
                    flexibleDays: 1,
                    allowPooling: true
                }
            });
            createdRides.push(newRide);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${createdRides.length} rides`,
            rides: createdRides
        });

    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json(
            { error: "Failed to seed database", details: String(error) },
            { status: 500 }
        );
    }
}
