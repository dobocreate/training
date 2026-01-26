
"use client";

import { useState, useEffect, useRef } from "react";
import { getMemberColor, memberColors, isHex, getCustomColor, getContrastColor } from "@/lib/colors";

interface MemberManagerProps {
    members: string[];
    history: { member: string; date: string }[];
    profiles?: Record<string, { color: string; affiliation: string }>;
    onUpdate: (newMembers: string[]) => void;
    onUpdateProfile?: (member: string, color: string, affiliation: string) => void;
}

export default function MemberManager({ members, history, profiles = {}, onUpdate, onUpdateProfile }: MemberManagerProps) {
    // Get all colors currently in use by profiles
    const usedColors = Object.values(profiles).map(p => p.color);

    const colorInputRef = useRef<HTMLInputElement>(null);
    const [newMember, setNewMember] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editColor, setEditColor] = useState("");
    const [editAffiliation, setEditAffiliation] = useState("");

    useEffect(() => {
        if (selectedMember) {
            const currentProfile = profiles[selectedMember];
            // Initialize editColor with profile color if exists, otherwise use default hash color.
            // We store the `bg` class string as the 'color' value in profiles.
            setEditColor(currentProfile?.color || getMemberColor(selectedMember).bg);
            setEditAffiliation(currentProfile?.affiliation || "");
        }
    }, [selectedMember, profiles]);

    const handleAdd = () => {
        if (!newMember.trim()) return;
        const name = newMember.trim();
        const updated = [...members, name];
        onUpdate(updated);

        // Auto-assign an unused color if profiles sync is available
        if (onUpdateProfile) {
            const unusedColor = memberColors.find(c => !usedColors.includes(c.bg));
            if (unusedColor) {
                onUpdateProfile(name, unusedColor.bg, "");
            }
        }

        setNewMember("");
    };

    const handleDelete = (index: number) => {
        if (!confirm("本当に削除しますか？")) return;
        const updated = members.filter((_, i) => i !== index);
        onUpdate(updated);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const updated = [...members];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        onUpdate(updated);
    };

    const moveDown = (index: number) => {
        if (index === members.length - 1) return;
        const updated = [...members];
        [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
        onUpdate(updated);
    };

    const handleSaveProfile = () => {
        if (selectedMember && onUpdateProfile) {
            onUpdateProfile(selectedMember, editColor, editAffiliation);
            setIsEditing(false);
        }
    };

    // Stats calculation for profile - Updated to match Calendar visualization logic
    const getMemberStats = (name: string) => {
        // Step 1: Map the LATEST member assigned to each unique date string
        const dateToLatestMember = new Map<string, string>();
        history.forEach(h => {
            const dateStr = new Date(h.date).toDateString();
            dateToLatestMember.set(dateStr, h.member);
        });

        // Step 2: Extract dates where 'name' is the assigned member
        const assignedDates = Array.from(dateToLatestMember.entries())
            .filter(([_, member]) => member === name)
            .map(([date, _]) => date);

        const count = assignedDates.length;

        // Step 3: Sort descending for "recent activity" list
        const sortedDates = [...assignedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const recentDates = sortedDates.map(dateStr => new Date(dateStr).toLocaleDateString());

        return { count, recentDates };
    };

    // Helper to get color style: prefer profile color, fallback to hash
    const getColor = (member: string) => {
        const profile = profiles[member];
        if (profile && profile.color) {
            if (isHex(profile.color)) {
                return getCustomColor(profile.color);
            }
            const found = memberColors.find(c => c.bg === profile.color);
            if (found) return found;
            return { ...getMemberColor(member), bg: profile.color };
        }
        return getMemberColor(member);
    }

    const getAffiliation = (member: string) => {
        return (profiles[member] && profiles[member].affiliation) || "所属なし";
    }

    return (
        <>
            {/* Toggle Button (Always Visible) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`absolute bottom-10 right-10 flex flex-row-reverse items-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl text-white z-50 group border-4 border-white dark:border-zinc-800 transition-all duration-300 ease-out overflow-hidden ${isExpanded ? "w-20 h-20 from-gray-500 to-gray-600" : "h-20 w-20 hover:w-72"
                    } `}
                aria-label={isExpanded ? "閉じる" : "メンバー管理"}
            >
                <div className="flex-shrink-0 w-20 h-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-9 h-9">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>

                {/* Text (Hover visible) */}
                {!isExpanded && (
                    <span className="whitespace-nowrap font-bold text-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-10 group-hover:translate-x-0 ml-4">
                        メンバー編集
                    </span>
                )}
            </button>

            {/* Expanded Menu */}
            {isExpanded && (
                <div className="absolute bottom-36 right-10 z-40 p-6 border border-gray-100 dark:border-zinc-800 rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl dark:bg-zinc-900/95 w-[500px] transform transition-all animate-in fade-in slide-in-from-bottom-5 duration-200 origin-bottom-right">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600 dark:text-blue-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg dark:text-zinc-200">メンバー管理</h3>
                        </div>
                        <div className="text-gray-400 text-xs">
                            クリックして詳細を表示
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition dark:hover:bg-zinc-800"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newMember}
                            onChange={(e) => setNewMember(e.target.value)}
                            placeholder="名前を入力"
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-zinc-800 dark:text-white dark:border-zinc-700 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-bold text-sm shadow-md"
                        >
                            追加
                        </button>
                    </div>

                    <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {members.map((member, index) => {
                            const color = getColor(member);
                            return (
                                <li
                                    key={`${member}-${index}`}
                                    className="flex justify-between items-center bg-gray-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 group hover:border-blue-200 dark:hover:border-blue-900 transition-colors cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                                    onClick={() => { setSelectedMember(member); setIsEditing(false); }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-full text-xs font-bold text-gray-400 border border-gray-100 dark:border-zinc-700">
                                            {index + 1}
                                        </span>
                                        <span className={`w-3 h-3 rounded-full ${isHex(color.bg) ? "" : color.bg} ${color.ring} ring-1`} style={isHex(color.bg) ? { backgroundColor: color.bg } : {}}></span>
                                        <span className={`font-medium dark:text-zinc-300 ${color.text} ${color.darkText}`} style={isHex(color.bg) ? { color: color.text === "text-white" ? "#fff" : "#111" } : {}}>{member}</span>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0}
                                            className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 hover:bg-blue-50 rounded transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => moveDown(index)}
                                            disabled={index === members.length - 1}
                                            className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 hover:bg-blue-50 rounded transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </button>
                                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                        <button
                                            onClick={() => handleDelete(index)}
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
            )}

            {/* Profile Overlay */}
            {selectedMember && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedMember(null)}>
                    <div
                        className={`bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 transform transition-all scale-100`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Color */}
                        <div
                            className={`h-32 ${isEditing ? (isHex(editColor) ? "" : editColor) : (isHex(getColor(selectedMember).bg) ? "" : getColor(selectedMember).bg)} relative flex items-center justify-center transition-colors duration-300`}
                            style={isEditing && isHex(editColor) ? { backgroundColor: editColor } : (!isEditing && isHex(getColor(selectedMember).bg) ? { backgroundColor: getColor(selectedMember).bg } : {})}
                        >
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition shadow-sm z-10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="absolute top-4 left-4 p-2 bg-white/50 hover:bg-white rounded-full transition shadow-sm z-10 text-gray-700 font-bold text-xs flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                    編集
                                </button>
                            )}

                            <div className={`w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 shadow-xl flex items-center justify-center text-4xl font-bold bg-white text-gray-700 absolute -bottom-12`}>
                                {selectedMember.charAt(0)}
                            </div>
                        </div>

                        <div className="pt-16 pb-8 px-8 text-center">
                            <h2 className={`text-2xl font-bold mb-2 ${getColor(selectedMember).text} ${getColor(selectedMember).darkText}`}>
                                {selectedMember}
                            </h2>

                            {isEditing ? (
                                <div className="mb-6 space-y-4">
                                    <div className="text-left">
                                        <label className="text-xs font-bold text-gray-500 block mb-2">所属</label>
                                        <input
                                            type="text"
                                            value={editAffiliation}
                                            onChange={(e) => setEditAffiliation(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            placeholder="所属部署など"
                                        />
                                    </div>
                                    <div className="text-left">
                                        <label className="text-xs font-bold text-gray-500 block mb-2">テーマカラー</label>
                                        <div className="flex flex-wrap gap-2">
                                            {memberColors.map((c) => {
                                                const isUsedByOthers = usedColors.includes(c.bg) && c.bg !== profiles[selectedMember]?.color;
                                                return (
                                                    <button
                                                        key={c.bg}
                                                        onClick={() => setEditColor(c.bg)}
                                                        className={`w-10 h-10 rounded-full ${c.bg} border-2 ${editColor === c.bg ? "border-black dark:border-white scale-110" : "border-transparent"} relative flex items-center justify-center transition-all hover:scale-110`}
                                                        title={isUsedByOthers ? "他のメンバーが使用中" : ""}
                                                    >
                                                        {isUsedByOthers && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 text-gray-500 opacity-60">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        {editColor === c.bg && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 text-gray-800 dark:text-gray-200 drop-shadow-sm">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                );
                                            })}

                                            {/* Custom Color Selector */}
                                            <div className="relative">
                                                <input
                                                    type="color"
                                                    ref={colorInputRef}
                                                    onChange={(e) => setEditColor(e.target.value)}
                                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                                />
                                                <button
                                                    onClick={() => colorInputRef.current?.click()}
                                                    className={`w-10 h-10 rounded-full border-2 border-dashed ${isHex(editColor) ? "border-solid" : "border-gray-300 dark:border-zinc-700"} flex items-center justify-center transition-all hover:scale-110 active:scale-95`}
                                                    style={isHex(editColor) ? { backgroundColor: editColor, borderColor: "#000" } : {}}
                                                    title="カスタムカラーを作成"
                                                >
                                                    {isHex(editColor) ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-6 h-6 ${getContrastColor(editColor) === "text-white" ? "text-white" : "text-gray-800"}`}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-center mt-4">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                        >
                                            キャンセル
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md"
                                        >
                                            保存
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-500 text-sm font-medium mb-6">
                                        {getAffiliation(selectedMember) || "所属情報なし"}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl">
                                            <div className="text-3xl font-black text-gray-800 dark:text-gray-200">
                                                {getMemberStats(selectedMember).count}
                                            </div>
                                            <div className="text-xs text-gray-500 font-bold mt-1">担当回数</div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl flex flex-col justify-center">
                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                {getMemberStats(selectedMember).recentDates[0] || "まだありません"}
                                            </div>
                                            <div className="text-xs text-gray-500 font-bold mt-1">前回の担当</div>
                                        </div>
                                    </div>

                                    <div className="text-left">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 mb-3 ml-1">最近の活動</h3>
                                        <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4 max-h-48 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-zinc-700/50">
                                            {getMemberStats(selectedMember).recentDates.length > 0 ? (
                                                <ul className="space-y-1">
                                                    {getMemberStats(selectedMember).recentDates.map((date, i) => {
                                                        const mColor = getColor(selectedMember);
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
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
