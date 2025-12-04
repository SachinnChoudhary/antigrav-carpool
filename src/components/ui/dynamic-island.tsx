"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

export function DynamicIsland() {
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Mock state: Active ride
    const activeRide = {
        status: "Arriving in 5 min",
        driver: "Rajesh",
        car: "Honda City",
        plate: "DL 3C 1234"
    };

    return (
        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-[60] flex justify-center">
            <motion.div
                layout
                initial={false}
                animate={{
                    width: isExpanded ? 320 : 120,
                    height: isExpanded ? 160 : 36,
                    borderRadius: isExpanded ? 32 : 18,
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-black text-white overflow-hidden shadow-2xl cursor-pointer relative"
            >
                <AnimatePresence mode="wait">
                    {!isExpanded ? (
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-between px-3 h-full w-full"
                        >
                            <div className="flex items-center space-x-2">
                                <Car className="h-4 w-4 text-green-400 fill-current" />
                            </div>
                            <span className="text-[10px] font-medium text-green-400">5 min</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-6 flex flex-col justify-between h-full w-full"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                                        <Car className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">Arriving Soon</h3>
                                        <p className="text-xs text-gray-400">{activeRide.car} • {activeRide.plate}</p>
                                    </div>
                                </div>
                                <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold">
                                    On Time
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <div className="flex -space-x-2">
                                    <div className="h-8 w-8 rounded-full bg-gray-700 border-2 border-black" />
                                    <div className="h-8 w-8 rounded-full bg-gray-600 border-2 border-black flex items-center justify-center text-[10px]">
                                        +2
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                    <Navigation className="h-3 w-3" />
                                    <span>1.2 km away</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
