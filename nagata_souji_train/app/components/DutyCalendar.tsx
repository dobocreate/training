"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useEffect, useState } from "react";
import { getMemberColor } from "@/lib/colors";

interface HistoryItem {
    member: string;
    date: string;
}

interface DutyCalendarProps {
    history: HistoryItem[];
    currentMember?: string;
    lastUpdated?: string;
    members: string[];
    onAddHistory: (date: Date, member: string) => void;
    loading: boolean;
    nextPerson: string;
    dutyCount: number;
    onNext: () => Promise<void>;
}

export default function DutyCalendar({
    history,
    members,
    onAddHistory,
    loading,
    nextPerson,
    dutyCount,
    onNext,
    currentMember
}: DutyCalendarProps) {
    const [historyMap, setHistoryMap] = useState<Record<string, string>>({});

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedMember, setSelectedMember] = useState("");

    useEffect(() => {
        const map: Record<string, string> = {};
        history.forEach((item) => {
            const date = new Date(item.date).toDateString();
            map[date] = item.member;
        });
        setHistoryMap(map);
    }, [history]);

    const handleDayClick = (value: Date) => {
        setSelectedDate(value);
        // Pre-select existing member if any
        const dateString = value.toDateString();
        setSelectedMember(historyMap[dateString] || "");
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (selectedDate && selectedMember) {
            onAddHistory(selectedDate, selectedMember);
            setIsModalOpen(false);
        }
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === "month") {
            const dateString = date.toDateString();
            const member = historyMap[dateString];

            if (member) {
                const color = getMemberColor(member);
                return (
                    <div className="flex-1 flex items-center justify-center w-full">
                        <span className={`inline-block px-3 py-1.5 rounded-md text-lg font-bold truncate max-w-full ${color.bg} ${color.text} ${color.darkBg} ${color.darkText}`}>
                            {member}
                        </span>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="w-full h-full flex flex-col relative">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-center items-center bg-white dark:bg-zinc-900">
                <h3 className="font-bold text-4xl dark:text-zinc-200">当番カレンダー</h3>
            </div>
            <div className="flex-1 overflow-auto bg-white dark:bg-zinc-900 scrollbar-hide">
                <Calendar
                    tileContent={tileContent}
                    onClickDay={handleDayClick}
                    className="!w-full !border-none !font-sans dark:!bg-zinc-900 dark:!text-zinc-200 text-lg"
                    tileClassName="dark:hover:!bg-zinc-800 flex flex-col pt-2 items-center min-h-[140px] flex-1 hover:bg-gray-50 transition-colors cursor-pointer"
                />
            </div>

            {/* Integrated Action Panel - Moved from Roulette side */}
            <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 flex flex-col items-center gap-6">
                <div className="flex items-center gap-12">
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">当番回数</span>
                        <div className="px-8 py-3 bg-white dark:bg-zinc-900 rounded-2xl text-blue-600 dark:text-blue-400 font-black text-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                            {dutyCount} <span className="text-sm ml-1 opacity-60">回</span>
                        </div>
                    </div>

                    {!loading && (
                        <div className="flex flex-col items-center">
                            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">次回の担当</span>
                            <div className="flex items-center gap-3 text-2xl text-gray-900 dark:text-white font-black">
                                <span className="bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 min-w-[120px] text-center">{nextPerson}</span>
                                <span className="text-base text-gray-400">さん</span>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={onNext}
                    disabled={loading || !currentMember}
                    className={`w-full max-w-lg py-6 px-12 rounded-3xl text-3xl font-black text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-4 ${loading
                        ? "bg-gray-400 cursor-not-allowed grayscale"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20"
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-3">
                            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            送信中...
                        </span>
                    ) : "完了して次へ"}
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && selectedDate && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                        <h4 className="font-bold text-lg mb-4 text-center dark:text-zinc-200">
                            {selectedDate.toLocaleDateString()} の担当者
                        </h4>

                        <div className="grid grid-cols-2 gap-2 mb-6 max-h-60 overflow-y-auto">
                            {members.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setSelectedMember(m)}
                                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${selectedMember === m
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200 dark:ring-blue-900"
                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700"
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition dark:hover:bg-zinc-800"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!selectedMember}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .calendar-wrapper .react-calendar {
                    display: flex;
                    flex-direction: column;
                }
                .calendar-wrapper .react-calendar__viewContainer {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .calendar-wrapper .react-calendar__month-view {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .calendar-wrapper .react-calendar__month-view > div {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .calendar-wrapper .react-calendar__month-view > div > div {
                    flex: 1;
                    display: flex !important;
                    flex-direction: column;
                }
                .calendar-wrapper .react-calendar__month-view__days {
                    flex: 1 !important;
                    height: 100% !important;
                }

                /* Header Styling */
                .calendar-wrapper .react-calendar__month-view__weekdays {
                    background: #fdfbf7; /* Light warm bg */
                    border-bottom: 2px solid #8B4513;
                }
                .calendar-wrapper .react-calendar__month-view__weekdays__weekday {
                    padding: 10px 0;
                    font-size: 1rem;
                    font-weight: bold;
                    text-transform: none;
                    border-right: 1px solid #d7ccc8; /* Lighter brown for vertical dividers */
                }
                /* Sunday Red */
                .calendar-wrapper .react-calendar__month-view__weekdays__weekday:first-child abbr {
                    color: #ef4444; /* red-500 */
                    text-decoration: none;
                }
                /* Saturday Blue */
                .calendar-wrapper .react-calendar__month-view__weekdays__weekday:last-child abbr {
                    color: #3b82f6; /* blue-500 */
                    text-decoration: none;
                }

                /* Tile Styling (Strict Grid) */
                .calendar-wrapper .react-calendar__tile {
                    flex: 1 0 auto !important;
                    border-right: 1px solid #8B4513;
                    border-bottom: 1px solid #8B4513;
                    background: white;
                    padding: 0.2rem !important;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start; /* Align content to top */
                    position: relative;
                    min-height: 120px;
                }

                /* Date Number Positioning (Top Left) */
                .calendar-wrapper .react-calendar__tile abbr {
                    font-weight: 900;
                    font-size: 7rem;
                    line-height: 1;
                    align-self: flex-start;
                    margin-bottom: auto; /* Push content down */
                    padding-left: 12px;
                    padding-top: 8px;
                    color: #1e293b;
                    letter-spacing: -2px;
                }

                /* Weekend Colors for Dates */
                /* Sunday column dates */
                .calendar-wrapper .react-calendar__month-view__days__day--weekend:nth-child(7n+1) abbr {
                    color: #ef4444;
                }
                /* Saturday column dates */
                .calendar-wrapper .react-calendar__month-view__days__day--weekend:nth-child(7n) abbr {
                    color: #3b82f6;
                }

                /* Dark Mode overrides */
                @media (prefers-color-scheme: dark) {
                    .calendar-wrapper .react-calendar__month-view__weekdays {
                        background: #1f2937;
                        border-bottom-color: #374151;
                    }
                    .calendar-wrapper .react-calendar__month-view__weekdays__weekday {
                        border-right-color: #374151;
                    }
                    .calendar-wrapper .react-calendar__tile {
                        background: #18181b;
                        border-color: #27272a;
                    }
                    .calendar-wrapper .react-calendar__tile:hover {
                        background: #27272a !important;
                    }
                }

                /* Today Highlight */
                .calendar-wrapper .react-calendar__tile--now {
                    background: #eff6ff !important;
                }
                .calendar-wrapper .react-calendar__tile--now abbr {
                    color: #2563eb !important;
                    text-decoration: underline;
                }
                @media (prefers-color-scheme: dark) {
                    .calendar-wrapper .react-calendar__tile--now {
                        background: #1e3a8a !important;
                    }
                }

                /* Navigation Buttons */
                .calendar-wrapper .react-calendar__navigation {
                    height: 120px;
                    margin-bottom: 0;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }
                .calendar-wrapper .react-calendar__navigation button {
                    font-size: 16rem;
                    font-weight: 900;
                    color: #2563eb;
                }
                @media (prefers-color-scheme: dark) {
                    .calendar-wrapper .react-calendar__navigation {
                        background: #1f2937;
                        border-color: #374151;
                    }
                }
            `}</style>
        </div>
    );
}
