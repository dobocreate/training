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
    const [selectedShift, setSelectedShift] = useState<CalendarEvent | null>(null);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch calendar events starting from 60 days ago
                const timeMin = new Date();
                timeMin.setDate(timeMin.getDate() - 60);
                const calendarRes = await fetch(`/api/calendar?timeMin=${timeMin.toISOString()}`);
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
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dailyEvents = events.filter(event => {
                const startStr = event.start.dateTime || event.start.date;
                return startStr?.includes(dateStr);
            });

            if (dailyEvents.length > 0) {
                return (
                    <div className="w-full mt-2 grid grid-cols-3 gap-1 px-1">
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedShift(event);
                                        setSelectedMember(member);
                                    }}
                                    className={`flex items-center justify-center gap-0.5 px-1 py-0.5 rounded-md shadow-sm border border-black/5 dark:border-white/5 transition-transform hover:scale-110 active:scale-95 cursor-pointer z-[100] relative pointer-events-auto ${isHex(color.bg) ? "" : color.bg} ${color.text} ${isHex(color.bg) ? "" : color.darkBg} ${color.darkText}`}
                                    style={isHex(color.bg) ? { backgroundColor: color.bg } : {}}
                                    title={`${member} の予定詳細を表示`}
                                >
                                    {profile?.icon && (
                                        <Image
                                            src={`/icons/${profile.icon}.svg`}
                                            alt={member}
                                            width={12}
                                            height={12}
                                            className="rounded-full flex-shrink-0 pointer-events-none"
                                            unoptimized
                                        />
                                    )}
                                    <span className="text-[9px] font-bold truncate pointer-events-none">
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
        <div className="w-full h-screen h-screen-svh flex flex-col lg:grid lg:grid-cols-2 relative overflow-hidden bg-white dark:bg-zinc-900">
            {/* Left Column: Title and Info */}
            <div className="hidden lg:flex flex-col items-center justify-center relative bg-emerald-50 dark:bg-black overflow-hidden py-8 border-r border-gray-100 dark:border-zinc-800">
                <CleaningBackground opacity={0.12} />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/20 dark:bg-emerald-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700 pointer-events-none"></div>

                <Link
                    href="/"
                    className="absolute top-10 left-8 p-3 rounded-full bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 transition shadow-xl border border-gray-100 dark:border-zinc-800 z-50 group"
                    title="戻る"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-gray-500 group-hover:text-blue-600 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>

                <div className="z-20 text-center px-12">
                    <h3 className="font-black text-6xl dark:text-zinc-200 mb-6 tracking-tighter">
                        シフト<br />
                        <span className="text-blue-600 dark:text-blue-400 text-7xl">カレンダー</span>
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-xl max-w-md">
                        Googleカレンダーと連携して、<br />
                        最新のシフトスケジュールを表示しています。
                    </p>
                </div>
            </div>

            {/* Mobile Header (Hidden on LG) */}
            <div className="lg:hidden p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-center items-center bg-transparent relative z-20">
                <Link
                    href="/"
                    className="absolute left-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>
                <h3 className="font-bold text-2xl dark:text-zinc-200">シフトカレンダー</h3>
            </div>

            {/* Right Column: Calendar Grid */}
            <div className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-zinc-900">
                {loading && (
                    <div className="absolute top-6 right-6 z-30 flex items-center gap-2 text-gray-400 text-sm font-bold bg-white/80 dark:bg-zinc-900/80 px-4 py-2 rounded-full shadow-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        読み込み中...
                    </div>
                )}

                <div className="flex-1 overflow-auto bg-transparent scrollbar-hide relative z-10 p-2 lg:p-6">
                    {error && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-50 text-red-600 rounded-full font-bold shadow-lg border border-red-100 animate-bounce">
                            {error}
                        </div>
                    )}

                    <Calendar
                        tileContent={tileContent}
                        className="!w-full !border-none !font-sans !bg-transparent dark:!text-zinc-200 text-lg"
                        tileClassName="dark:hover:!bg-zinc-800 flex flex-col pt-4 items-center min-h-[140px] flex-1 hover:bg-gray-50/50 transition-colors border-r border-b border-gray-100 dark:border-zinc-800/50 cursor-default"
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
            </div>

            {/* Shift Detail Modal */}
            {selectedShift && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    {profiles[selectedMember || ""]?.icon && (
                                        <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center p-3 border border-emerald-100 dark:border-emerald-800 shadow-inner">
                                            <Image
                                                src={`/icons/${profiles[selectedMember || ""].icon}.svg`}
                                                alt={selectedMember || ""}
                                                width={48}
                                                height={48}
                                                className="object-contain"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-2xl font-black dark:text-white uppercase tracking-tight">
                                            {selectedMember}
                                        </h4>
                                        <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 mt-0.5">
                                            SHIFT DETAILS
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedShift(null)}
                                    className="p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-400"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-[1.5rem] border border-gray-100 dark:border-zinc-800">
                                    <div className="flex flex-col gap-2 mb-4">
                                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75" />
                                            </svg>
                                            <span className="font-bold text-lg tracking-tight">
                                                {new Date(selectedShift.start.dateTime || selectedShift.start.date || "").toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-bold text-lg tracking-tight">勤務時間</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">開始</span>
                                            <span className="text-2xl font-black dark:text-white">
                                                {selectedShift.start.dateTime
                                                    ? new Date(selectedShift.start.dateTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                                                    : '終日'}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">終了</span>
                                            <span className="text-2xl font-black dark:text-white">
                                                {selectedShift.end.dateTime
                                                    ? new Date(selectedShift.end.dateTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                                                    : '終日'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedShift.start.dateTime && selectedShift.end.dateTime && (
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex items-center justify-between px-6 border border-blue-100/50 dark:border-blue-800/20">
                                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">合計勤務時間</span>
                                        <span className="text-xl font-black text-blue-700 dark:text-blue-300">
                                            {Math.abs(new Date(selectedShift.end.dateTime).getTime() - new Date(selectedShift.start.dateTime).getTime()) / (1000 * 60 * 60)} <span className="text-sm font-bold opacity-60 ml-0.5">h</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedShift(null)}
                                className="w-full mt-8 py-4 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.98]"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    border-bottom: 2px solid #3b82f6;
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
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0px;
                    background: transparent;
                }
                .react-calendar__navigation__label {
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: #3b82f6;
                }
                .react-calendar__navigation__label:hover {
                    background: transparent !important;
                }

                @media (prefers-color-scheme: dark) {
                    .react-calendar__navigation__label {
                        color: #60a5fa;
                    }
                    .react-calendar__month-view__weekdays__weekday abbr {
                        color: #9ca3af;
                    }
                    .react-calendar__tile abbr {
                        color: #e5e7eb;
                    }
                    .react-calendar__month-view__weekdays {
                        border-bottom-color: #3b82f6;
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
