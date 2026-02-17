"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CleaningBackground } from "../components/CleaningBackground";
import { getMemberColor, isHex, getCustomColor } from "@/lib/colors";

interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
}

interface Profile {
    color: string;
    affiliation: string;
    icon?: string;
}

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [profiles, setProfiles] = useState<Record<string, Profile>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch calendar events
                const calendarRes = await fetch("/api/calendar");
                if (!calendarRes.ok) {
                    throw new Error("Failed to fetch calendar events");
                }
                const calendarData = await calendarRes.json();
                setEvents(Array.isArray(calendarData) ? calendarData : []);

                // Fetch member profiles
                const dutyRes = await fetch("/api/duty");
                if (dutyRes.ok) {
                    const dutyData = await dutyRes.json();
                    setProfiles(dutyData.profiles || {});
                }
            } catch (err) {
                console.error(err);
                setError("データの取得に失敗しました。");
                setEvents([]);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === "month") {
            const dateStr = date.toISOString().split('T')[0];
            const dailyEvents = events.filter(event => {
                const startStr = event.start.dateTime || event.start.date;
                return startStr?.startsWith(dateStr);
            });

            if (dailyEvents.length > 0) {
                return (
                    <div className="flex-1 flex flex-col gap-1.5 w-full mt-2 items-center">
                        {dailyEvents.map(event => {
                            // Remove "バイト" and any parentheses/spaces
                            const member = event.summary.replace(/バイト|\(|\)|（|）|\s/g, "").trim();
                            const profile = profiles[member];
                            let color;

                            if (profile && profile.color && isHex(profile.color)) {
                                color = getCustomColor(profile.color);
                            } else {
                                color = getMemberColor(member);
                            }

                            return (
                                <div
                                    key={event.id}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md shadow-sm border border-black/5 dark:border-white/5 transition-transform hover:scale-105 ${isHex(color.bg) ? "" : color.bg} ${color.text} ${isHex(color.bg) ? "" : color.darkBg} ${color.darkText}`}
                                    style={isHex(color.bg) ? { backgroundColor: color.bg } : {}}
                                    title={member}
                                >
                                    {profile?.icon && (
                                        <Image
                                            src={`/icons/${profile.icon}.svg`}
                                            alt={member}
                                            width={16}
                                            height={16}
                                            className="rounded-full flex-shrink-0"
                                            unoptimized
                                        />
                                    )}
                                    <span className="text-[11px] font-bold truncate max-w-[70px]">
                                        {member}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="w-full h-screen h-screen-svh flex flex-col relative overflow-hidden bg-white dark:bg-zinc-900">
            <CleaningBackground opacity={0.06} />

            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-center items-center bg-transparent relative z-20">
                <Link
                    href="/"
                    className="absolute left-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition shadow-sm border border-gray-100 dark:border-zinc-800"
                    title="戻る"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>
                <h3 className="font-bold text-4xl dark:text-zinc-200">シフトカレンダー</h3>
                {loading && (
                    <div className="absolute right-6 flex items-center gap-2 text-gray-400 text-sm font-bold bg-white/80 dark:bg-zinc-900/80 px-4 py-2 rounded-full shadow-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        読み込み中...
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-auto bg-transparent scrollbar-hide relative z-10 px-4">
                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-50 text-red-600 rounded-full font-bold shadow-lg border border-red-100 animate-bounce">
                        {error}
                    </div>
                )}

                <Calendar
                    tileContent={tileContent}
                    className="!w-full !border-none !font-sans !bg-transparent dark:!text-zinc-200 text-lg"
                    tileClassName="dark:hover:!bg-zinc-800 flex flex-col pt-4 items-center min-h-[140px] flex-1 hover:bg-gray-50/50 transition-colors border-r border-b border-gray-50 dark:border-zinc-800/50 cursor-default"
                    prevLabel={
                        <div className="flex items-center justify-center p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </div>
                    }
                    nextLabel={
                        <div className="flex items-center justify-center p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                    }
                    next2Label={null}
                    prev2Label={null}
                    formatShortWeekday={(locale, date) => ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}
                />
            </div>

            <style jsx global>{`
                .react-calendar {
                    display: flex;
                    flex-direction: column;
                }
                .react-calendar__viewContainer {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .react-calendar__month-view {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .react-calendar__month-view > div {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .react-calendar__month-view > div > div {
                    flex: 1;
                    display: flex !important;
                    flex-direction: column;
                }
                .react-calendar__month-view__days {
                    flex: 1 !important;
                    height: 100% !important;
                }

                /* Weekday header */
                .react-calendar__month-view__weekdays {
                    font-weight: bold;
                    text-transform: none;
                    font-size: 1rem;
                    padding: 10px 0;
                    border-bottom: 1px solid #e5e7eb;
                }
                .react-calendar__month-view__weekdays__weekday abbr {
                    text-decoration: none;
                    color: #4b5563;
                }
                /* Sunday Red */
                .react-calendar__month-view__weekdays__weekday:first-child abbr {
                    color: #ef4444;
                }
                /* Saturday Blue */
                .react-calendar__month-view__weekdays__weekday:last-child abbr {
                    color: #3b82f6;
                }

                /* Date tile */
                .react-calendar__tile {
                    position: relative;
                }
                .react-calendar__tile abbr {
                    font-size: 1.125rem;
                    font-weight: 500;
                    color: #1f2937;
                }

                /* Weekend colors for dates */
                .react-calendar__month-view__days__day--weekend:nth-child(7n+1) abbr {
                    color: #ef4444;
                }
                .react-calendar__month-view__days__day--weekend:nth-child(7n) abbr {
                    color: #3b82f6;
                }

                /* Navigation */
                .react-calendar__navigation {
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0px;
                }
                .react-calendar__navigation__label {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #374151;
                }
                .react-calendar__navigation__label:hover {
                    background: transparent !important;
                }

                @media (prefers-color-scheme: dark) {
                    .react-calendar__navigation__label {
                        color: #e5e7eb;
                    }
                    .react-calendar__month-view__weekdays__weekday abbr {
                        color: #9ca3af;
                    }
                    .react-calendar__tile abbr {
                        color: #e5e7eb;
                    }
                    .react-calendar__month-view__weekdays {
                        border-bottom-color: #374151;
                    }
                }

                /* Scrollbar hide */
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
