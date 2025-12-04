import { SearchForm } from "@/components/home/SearchForm";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/glass-card";
import { MapPin, Star, Sparkles, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function Home() {
  const recentRides = await prisma.ride.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
    take: 2,
    include: {
      driver: {
        select: {
          rating: true
        }
      }
    }
  });

  return (
    <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30">
      <Header />

      <div className="px-6 pt-6 pb-2">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Where to?
        </h1>
        <p className="text-muted-foreground">
          Find the perfect ride for your journey.
        </p>
      </div>

      <div className="px-4 py-4">
        <SearchForm />
      </div>

      <div className="mt-2">
        <CategoryFilter />
      </div>

      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
            Smart Suggestions
          </h2>
        </div>
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
          <GlassCard className="min-w-[200px] p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">AI Pick</span>
              <Zap className="h-4 w-4 text-purple-500" />
            </div>
            <h3 className="font-semibold text-sm">Office Commute</h3>
            <p className="text-xs text-muted-foreground mb-2">Based on your routine</p>
            <Button size="sm" className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700">Book Now</Button>
          </GlassCard>
          <GlassCard className="min-w-[200px] p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Trending</span>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <h3 className="font-semibold text-sm">Weekend Getaway</h3>
            <p className="text-xs text-muted-foreground mb-2">Jaipur is popular now</p>
            <Button size="sm" className="w-full h-8 text-xs bg-orange-600 hover:bg-orange-700">Explore</Button>
          </GlassCard>
        </div>
      </div>

      <div className="px-6 mt-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Rides</h2>
          <Link href="/search" className="text-primary text-sm font-medium hover:underline">View All</Link>
        </div>

        <div className="flex flex-col gap-4">
          {recentRides.length > 0 ? (
            recentRides.map((ride) => (
              <Link key={ride.id} href={`/ride/${ride.id}`} className="block">
                <GlassCard className="flex items-center p-4 hover:bg-white/40 transition-colors cursor-pointer group">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{ride.from} to {ride.to}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {format(new Date(ride.date), 'MMM d')} • {ride.time}
                    </p>
                  </div>
                  <div className="text-right pl-2">
                    <span className="block font-bold text-primary">₹{ride.price}</span>
                    <div className="flex items-center justify-end text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {ride.driver.rating.toFixed(1)}
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl">
              <p>No recent rides found.</p>
              <Link href="/publish" className="text-primary text-sm hover:underline mt-2 inline-block">
                Publish a ride
              </Link>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
