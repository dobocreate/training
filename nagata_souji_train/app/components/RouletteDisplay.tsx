"use client";

import { useEffect, useState } from "react";
import { getMemberColor, isHex, getCustomColor } from "@/lib/colors";

interface RouletteDisplayProps {
    members: string[];
    currentMember: string;
    profiles: Record<string, { color: string; affiliation: string }>;
    onComplete: () => Promise<void>;
}

export default function RouletteDisplay({ members, currentMember, profiles, onComplete }: RouletteDisplayProps) {
    const [rotation, setRotation] = useState(0);
    const angleStep = 360 / Math.max(members.length, 1);

    // 担当者を下に回転させる
    useEffect(() => {
        const index = members.indexOf(currentMember);
        if (index !== -1) {
            setRotation(-(index * angleStep));
        }
    }, [currentMember, members, angleStep]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-start relative pt-0 gap-0">

            {/* 中心ハブと矢印 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[80] pointer-events-none flex flex-col items-center">
                {/* 中心ハブ */}
                <div className="relative w-64 h-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl rounded-full z-[90] border-[6px] border-blue-600 dark:border-blue-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-center -mt-64">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-wider">今週の</span>
                        <span className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-wider">掃除当番</span>
                    </div>
                </div>

                {/* 矢印 */}
                <div
                    className="w-16 h-32 bg-gradient-to-b from-red-600 via-red-500 to-red-700 shadow-[0_20px_50px_rgba(239,68,68,0.8)] z-[85]"
                    style={{
                        clipPath: "polygon(15% 0%, 85% 0%, 100% 20%, 50% 100%, 0% 20%)",
                        marginTop: "-20px"
                    }}
                />
            </div>

            {/* ルーレット本体 */}
            <div
                className="relative w-[800px] h-[800px] flex items-center justify-center transition-transform duration-[1500ms] ease-out z-10 overflow-hidden rounded-full"
                style={{
                    transform: `scale(1.4) rotate(${rotation}deg)`,
                    marginTop: "-560px"
                }}
            >
                {members.map((member, i) => {
                    const isCurrent = member === currentMember;
                    const itemRotation = i * angleStep;
                    const profile = profiles[member];
                    const color = profile && profile.color && isHex(profile.color) ? getCustomColor(profile.color) : getMemberColor(member);
                    const borderColor = isCurrent ? (isHex(color.bg) ? color.bg : "#000") : "rgba(0,0,0,0.3)"; // 担当者以外は半透明黒

                    return (
                        <div
                            key={`${member}-${i}`}
                            className="absolute top-1/2 left-1/2 origin-top transition-all duration-700 ease-out"
                            style={{
                                transform: `translate(-50%, 0) rotate(${itemRotation}deg)`,
                                zIndex: isCurrent ? 40 : 10,
                                width: "500px",
                                height: "620px"
                            }}
                        >
                            {/* 扇形 */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* 縁取り */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundColor: borderColor,
                                        clipPath: `polygon(
                      50% 0%,
                      10% 95%,
                      25% 99%,
                      50% 100%,
                      75% 99%,
                      90% 95%
                    )`,
                                        transform: "scale(1.05)",
                                        transition: "transform 0.5s ease"
                                    }}
                                />

                                {/* 本体 */}
                                <div
                                    className={`relative w-full h-full flex flex-col items-center text-center transition-all duration-500`}
                                    style={{
                                        backgroundColor: isCurrent ? "white" : "rgba(0,0,0,0.05)", // 担当者以外は薄い黒
                                        clipPath: `polygon(
                      50% 0%,
                      10% 95%,
                      25% 99%,
                      50% 100%,
                      75% 99%,
                      90% 95%
                    )`,
                                        boxShadow: isCurrent ? "0 60px 120px -30px rgba(0,0,0,0.7)" : "none"
                                    }}
                                >
                                    {/* 名前 */}
                                    <div
                                        className={`font-black tracking-tighter transition-all duration-[1500ms] ease-out ${isCurrent ? "text-7xl" : "text-4xl"} ${color.text} ${color.darkText}`}
                                        style={{
                                            transform: `rotate(${-itemRotation - rotation}deg)`,
                                            marginTop: "240px",
                                            whiteSpace: "nowrap",
                                            color: isHex(color.bg) ? (color.text === "text-white" ? "#fff" : "#111") : undefined
                                        }}
                                    >
                                        {member}
                                    </div>
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
