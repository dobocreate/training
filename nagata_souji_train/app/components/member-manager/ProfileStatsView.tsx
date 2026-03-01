import React from "react";
import { isHex } from "@/lib/colors";
import { getMemberDisplayColor } from "./utils";

interface ProfileStatsViewProps {
    member: string;
    affiliation: string;
    history: { member: string; date: string }[];
    profiles: Record<string, { color: string; affiliation: string }>;
}

export const ProfileStatsView: React.FC<ProfileStatsViewProps> = ({ member, affiliation, history, profiles }) => {
    // Stats calculation
    const getMemberStats = (name: string) => {
        // Step 1: Map the LATEST member assigned to each unique date string
        const dateToLatestMember = new Map<string, string>();
        history.forEach(h => {
            const dateStr = new Date(h.date).toDateString();
            dateToLatestMember.set(dateStr, h.member);
        });

        // Step 2: Extract dates where 'name' is the assigned member
        const assignedDates = Array.from(dateToLatestMember.entries())
            .filter(([_, memberName]) => memberName === name)
            .map(([date, _]) => date);

        const count = assignedDates.length;

        // Step 3: Sort descending for "recent activity" list
        const sortedDates = [...assignedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const recentDates = sortedDates.map(dateStr => new Date(dateStr).toLocaleDateString());

        return { count, recentDates };
    };

    const stats = getMemberStats(member);

    return (
        <>
            <p className="text-gray-500 text-sm font-medium mb-6">
                {affiliation || "所属情報なし"}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl">
                    <div className="text-3xl font-black text-gray-800 dark:text-gray-200">
                        {stats.count}
                    </div>
                    <div className="text-xs text-gray-500 font-bold mt-1">担当回数</div>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl flex flex-col justify-center">
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {stats.recentDates[0] || "まだありません"}
                    </div>
                    <div className="text-xs text-gray-500 font-bold mt-1">前回の担当</div>
                </div>
            </div>

            <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 mb-3 ml-1">最近の活動</h3>
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4 max-h-48 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-zinc-700/50">
                    {stats.recentDates.length > 0 ? (
                        <ul className="space-y-1">
                            {stats.recentDates.map((date, i) => {
                                const mColor = getMemberDisplayColor(member, profiles);
                                return (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 py-2 border-b last:border-0 border-gray-100/50 dark:border-zinc-700/50">
                                        <div className={`w-2 h-2 rounded-full ${isHex(mColor.bg) ? "" : mColor.bg}`} style={isHex(mColor.bg) ? { backgroundColor: mColor.bg } : {}}></div>
                                        <span className="font-medium tracking-tight">{date}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-4">履歴がありません</p>
                    )}
                </div>
            </div>
        </>
    );
};
