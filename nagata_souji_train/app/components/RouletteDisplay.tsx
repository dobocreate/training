"use client";

import { useEffect, useState, useRef } from "react";
import { getMemberColor, isHex, getCustomColor } from "@/lib/colors";

interface RouletteDisplayProps {
    members: string[];
    currentMember: string;
    profiles: Record<string, { color: string; affiliation: string }>;
    onComplete: () => Promise<void>;
}

export default function RouletteDisplay({ members, currentMember, profiles, onComplete }: RouletteDisplayProps) {
    const [rotation, setRotation] = useState(0);
    const prevIndexRef = useRef(0);
    const angleStep = 360 / Math.max(members.length, 1);

    // Long spin animation logic
    useEffect(() => {
        const index = members.indexOf(currentMember);
        if (index !== -1) {
            // Calculate forward distance
            let dist = index - prevIndexRef.current;
            if (dist <= 0) dist += members.length;

            // Add extra spins (randomize slightly? or fixed?)
            // User: "like actual roulette" -> fixed or random number of spins?
            // "Spin many times". Fixed is fine for visual consistency.
            const extraSpins = 10;
            const totalSteps = dist + (members.length * extraSpins);

            setRotation(prev => prev - (totalSteps * angleStep));
            prevIndexRef.current = index;
        }
    }, [currentMember, members, angleStep]);



    return (
        <div className="w-full h-full flex flex-col items-center justify-start relative pt-0 gap-0">
            {/* Center Hub with Label & Indicator Needle */}
            <div className="absolute top-40 left-1/2 -translate-x-1/2 z-[80] pointer-events-none flex flex-col items-center">
                {/* Large Center Hub with "今週の掃除当番" Label */}
                <div className="relative w-64 h-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl rounded-full z-[90] border-[6px] border-blue-600 dark:border-blue-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-center -mt-64">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-wider">今週の</span>
                        <span className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-wider">掃除当番</span>
                    </div>
                </div>

                {/* The Indicator Needle (Growing from the hub) */}
                <div
                    className="w-16 h-32 bg-gradient-to-b from-red-600 via-red-500 to-red-700 shadow-[0_20px_50px_rgba(239,68,68,0.8)] z-[85]"
                    style={{
                        clipPath: "polygon(15% 0%, 85% 0%, 100% 20%, 50% 100%, 0% 20%)",
                        marginTop: "-20px"
                    }}
                />
            </div>

            {/* The "Circle of Fans" Container - Pivot at the VERY TOP of screen (framing out top half) */}
            <div
                className="relative w-[800px] h-[800px] flex items-center justify-center transition-transform duration-[8000ms] ease-out z-10"
                style={{
                    transform: `scale(1.4) rotate(${rotation}deg)`,
                    marginTop: "-400px" // Shifted down by 160px (from -560px)
                }}
            >

                {members.map((member, i) => {
                    const isCurrent = member === currentMember;
                    const itemRotation = i * angleStep;
                    const profile = profiles[member];
                    let color;
                    if (profile && profile.color && isHex(profile.color)) {
                        color = getCustomColor(profile.color);
                    } else {
                        color = getMemberColor(member);
                    }

                    return (
                        <div
                            key={`${member}-${i}`}
                            className="absolute top-1/2 left-1/2 origin-top transition-transform duration-[1500ms] ease-out will-change-transform"
                            style={{
                                transform: `translate(-50%, 0) rotate(${itemRotation}deg)`,
                                zIndex: isCurrent ? 40 : 10,
                                width: "500px",
                                height: "620px",
                            }}
                        >
                            {/* Individual Fan Piece - Wider sector with BLACK BORDER */}
                            <div
                                className={`w-full h-full flex flex-col items-center text-center transition-all duration-[1500ms] ease-out will-change-transform ${isCurrent ? "saturate-150 opacity-100" : "opacity-40"
                                    }`}
                                style={{
                                    backgroundColor: isCurrent ? "white" : "rgba(255,255,255,0.75)",
                                    clipPath: `polygon(
                                        50% 0%, 
                                        10% 95%, 
                                        25% 99%, 
                                        50% 100%, 
                                        75% 99%, 
                                        90% 95%
                                    )`,
                                    borderBottom: isCurrent ? `20px solid ${isHex(color.bg) ? color.bg : color.text.replace("text-", "")}` : `4px solid ${isHex(color.bg) ? color.bg : color.text.replace("text-", "")}`,
                                    filter: `drop-shadow(2px 0 0 black) drop-shadow(-2px 0 0 black) drop-shadow(0 2px 0 black) drop-shadow(0 -2px 0 black)`,
                                    boxShadow: isCurrent ? "0 60px 120px -30px rgba(0, 0, 0, 0.7)" : "none",
                                    transform: isCurrent ? "scale(1.05)" : "scale(1.0)"
                                }}
                            >
                                <div
                                    className={`font-black tracking-tighter transition-transform duration-[1500ms] ease-out will-change-transform ${color.text} ${color.darkText}`}
                                    style={{
                                        transform: `rotate(${-itemRotation - rotation}deg) scale(${isCurrent ? 1.0 : 0.6})`,
                                        transformOrigin: "center center",
                                        marginTop: "240px",
                                        whiteSpace: "nowrap",
                                        color: isHex(color.bg) ? (color.text === "text-white" ? "#fff" : "#111") : undefined,
                                        fontSize: `${Math.min(58, 240 / Math.max(member.length, 1))}px`,
                                        lineHeight: "1.1",
                                        backfaceVisibility: "hidden"
                                    }}
                                >
                                    {member}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.98); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
