"use client";

import { useEffect, useState, useRef } from "react";
import { getMemberColor } from "@/lib/colors";

interface RouletteDisplayProps {
    members: string[];
    currentMember: string;
    onComplete: () => Promise<void>;
    loading: boolean;
    nextPerson: string;
    dutyCount: number;
}

export default function RouletteDisplay({ members, currentMember, onComplete, loading, nextPerson, dutyCount }: RouletteDisplayProps) {
    const [displayMember, setDisplayMember] = useState(currentMember);
    const [isSpinning, setIsSpinning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isSpinning) {
            setDisplayMember(currentMember);
        }
    }, [currentMember, isSpinning]);

    const handleNextClick = async () => {
        if (loading || isSpinning || members.length === 0) return;

        // Start spinning
        setIsSpinning(true);
        let spinCount = 0;

        // Rapidly change names
        intervalRef.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * members.length);
            setDisplayMember(members[randomIndex]);
            spinCount++;
        }, 50); // Change every 50ms

        // Trigger the actual API call
        await onComplete();

        // Stop spinning after a delay (or when API finishes, but ensure minimum spin time)
        // We'll let it spin for at least 1.5 seconds total
        setTimeout(() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsSpinning(false);
        }, 1500);
    };

    const color = getMemberColor(displayMember || "");

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-12 pb-32">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl p-12 flex flex-col items-center text-center border-4 border-gray-100 dark:border-zinc-800 relative overflow-hidden">
                {/* Decorative Ring/Wheel elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>

                <p className="text-gray-500 dark:text-zinc-400 mb-8 text-2xl font-bold tracking-widest uppercase">My Duty</p>

                {/* Roulette Window */}
                <div className="relative w-full h-48 mb-8 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 rounded-3xl inner-shadow border border-gray-200 dark:border-zinc-700 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/80 via-transparent to-white/80 dark:from-zinc-900/80 dark:to-zinc-900/80 z-10"></div>

                    <div className={`transition-all duration-100 transform ${isSpinning ? "scale-110 blur-[1px]" : "scale-100"}`}>
                        <div className={`text-7xl font-black tracking-wide drop-shadow-sm ${displayMember ? color.text : "text-gray-400"} ${displayMember ? color.darkText : ""}`}>
                            {displayMember || "---"}
                        </div>
                    </div>
                </div>

                {/* Duty Count Display */}
                <div className="mb-10 inline-block px-6 py-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-500 dark:text-gray-400 font-bold text-sm border border-gray-200 dark:border-zinc-700">
                    これまでの担当回数: {dutyCount} 回
                </div>

                <div className="flex flex-col gap-4 items-center w-full z-20">
                    <button
                        onClick={handleNextClick}
                        disabled={loading || isSpinning || !currentMember}
                        className={`w-full py-6 px-10 rounded-full text-2xl font-bold text-white shadow-xl transition-all transform active:scale-95 ${loading || isSpinning
                                ? "bg-gray-400 cursor-not-allowed scale-95"
                                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 hover:shadow-2xl ring-4 ring-blue-100 dark:ring-blue-900"
                            }`}
                    >
                        {isSpinning ? "抽選中..." : (loading ? "送信中..." : "完了して次へ")}
                    </button>
                    {!isSpinning && (
                        <p className="text-xl text-gray-400 dark:text-gray-500 mt-4 font-medium">
                            次は <span className="font-bold text-gray-600 dark:text-gray-300">{nextPerson}</span> さんです
                        </p>
                    )}
                </div>
            </div>

            <style jsx>{`
                .inner-shadow {
                    box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
                }
            `}</style>
        </div>
    );
}
