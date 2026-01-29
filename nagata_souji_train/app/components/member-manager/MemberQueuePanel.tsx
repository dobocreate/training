import React, { useRef, useEffect } from "react";
import { isHex } from "@/lib/colors";
import { getMemberDisplayColor } from "./utils";

interface MemberQueuePanelProps {
    members: string[];
    profiles: Record<string, { color: string; affiliation: string }>;
    onClose: () => void;
    onAdd: (name: string) => void;
    onDelete: (index: number) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onSelectMember: (member: string) => void;
}

export const MemberQueuePanel: React.FC<MemberQueuePanelProps> = ({
    members,
    profiles,
    onClose,
    onAdd,
    onDelete,
    onMoveUp,
    onMoveDown,
    onSelectMember,
}) => {
    const [newMember, setNewMember] = React.useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when opened
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleAddClick = () => {
        if (!newMember.trim()) return;
        onAdd(newMember.trim());
        setNewMember("");
    };

    return (
        <div className="absolute bottom-36 right-10 z-[200] p-6 border border-gray-100 dark:border-zinc-800 rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl dark:bg-zinc-900/95 w-[500px] transform transition-all animate-in fade-in slide-in-from-bottom-5 duration-200 origin-bottom-right">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600 dark:text-blue-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-lg dark:text-zinc-200">メンバー管理</h3>
                </div>

                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition dark:hover:bg-zinc-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <input
                    ref={inputRef}
                    type="text"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    placeholder="名前を入力"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-zinc-800 dark:text-white dark:border-zinc-700 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAddClick()}
                />
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-bold text-sm shadow-md"
                >
                    追加
                </button>
            </div>

            <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {members.map((member, index) => {
                    const color = getMemberDisplayColor(member, profiles);
                    return (
                        <li
                            key={`${member}-${index}`}
                            className="flex justify-between items-center bg-gray-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 group hover:border-blue-200 dark:hover:border-blue-900 transition-colors cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                            onClick={() => onSelectMember(member)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-full text-xs font-bold text-gray-400 border border-gray-100 dark:border-zinc-700">
                                    {index + 1}
                                </span>
                                <span className={`w-3 h-3 rounded-full ${isHex(color.bg) ? "" : color.bg} ${color.ring} ring-1`} style={isHex(color.bg) ? { backgroundColor: color.bg } : {}}></span>
                                <span className={`font-medium dark:text-zinc-300 ${color.text} ${color.darkText}`} style={isHex(color.bg) ? { color: color.text === "text-white" ? "#fff" : "#111" } : {}}>{member}</span>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <span className="text-[10px] text-gray-400 mr-2 hidden sm:inline">クリックして詳細を表示</span>
                                <button
                                    onClick={() => onMoveUp(index)}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 hover:bg-blue-50 rounded transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onMoveDown(index)}
                                    disabled={index === members.length - 1}
                                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 hover:bg-blue-50 rounded transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                <button
                                    onClick={() => onDelete(index)}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
