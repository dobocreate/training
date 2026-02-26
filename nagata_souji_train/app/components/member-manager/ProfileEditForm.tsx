import React, { useState, useRef, useEffect } from "react";
import { memberColors, isHex, getContrastColor } from "@/lib/colors";

import Image from "next/image";

interface ProfileEditFormProps {
    member: string;
    initialColor: string;
    initialAffiliation: string;
    initialIcon?: string;
    usedColors: string[];
    onCancel: () => void;
    onSave: (color: string, affiliation: string, icon?: string) => void;
    onColorChange?: (color: string) => void;
}

export const ProfileEditFormWithPreview: React.FC<ProfileEditFormProps> = ({
    member,
    initialColor,
    initialAffiliation,
    initialIcon,
    usedColors,
    onCancel,
    onSave,
    onColorChange
}) => {
    const [editColor, setEditColor] = useState(initialColor);
    const [editAffiliation, setEditAffiliation] = useState(initialAffiliation);
    const [editIcon, setEditIcon] = useState<string | undefined>(initialIcon);
    const colorInputRef = useRef<HTMLInputElement>(null);

    const icons = [
        "bear", "cat", "dog", "rabbit", "owl",
        "fox", "panda", "koala", "lion", "tiger",
        "pig", "frog", "monkey", "mouse", "elephant",
        "penguin", "giraffe", "hippo", "zebra",
        "squirrel", "deer", "wolf", "raccoon", "sheep",
        "cow", "chicken", "duck", "eagle", "bat",
        "shark", "whale", "dolphin", "octopus", "turtle",
        "snake", "dragon", "dinosaur", "bee"
    ].map(id => ({ id, src: `/icons/${id}.svg`, alt: id }));

    useEffect(() => {
        if (onColorChange) {
            onColorChange(editColor);
        }
    }, [editColor, onColorChange]);

    return (
        <div className="mb-6 space-y-4">
            <div className="text-left">
                <label className="text-xs font-bold text-gray-500 block mb-2">アイコン</label>
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {icons.map((icon) => (
                        <button
                            key={icon.id}
                            onClick={() => setEditIcon(icon.id)}
                            className={`flex-shrink-0 w-16 h-16 rounded-2xl border-4 transition-all overflow-hidden relative ${editIcon === icon.id ? "border-blue-500 scale-110 shadow-md" : "border-gray-100 dark:border-zinc-800 opacity-60 hover:opacity-100"}`}
                        >
                            <Image
                                src={icon.src}
                                alt={icon.alt}
                                fill
                                className="object-cover"
                            />
                            {editIcon === icon.id && (
                                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[1px] flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 text-white drop-shadow-sm">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                    <button
                        onClick={() => setEditIcon(undefined)}
                        className={`flex-shrink-0 w-16 h-16 rounded-2xl border-4 transition-all flex items-center justify-center bg-gray-50 dark:bg-zinc-800 text-gray-400 font-bold text-xs ${editIcon === undefined ? "border-blue-500 scale-110 shadow-md text-blue-500" : "border-gray-100 dark:border-zinc-800"}`}
                    >
                        なし
                    </button>
                </div>
            </div>

            <div className="text-left">
                <label className="text-xs font-bold text-gray-500 block mb-2">所属</label>
                <input
                    type="text"
                    value={editAffiliation}
                    onChange={(e) => setEditAffiliation(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="所属部署など"
                />
            </div>
            <div className="text-left">
                <label className="text-xs font-bold text-gray-500 block mb-2">テーマカラー</label>
                <div className="flex flex-wrap gap-2">
                    {memberColors.map((c) => {
                        const isUsedByOthers = usedColors.includes(c.bg) && c.bg !== initialColor;
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
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                    キャンセル
                </button>
                <button
                    onClick={() => onSave(editColor, editAffiliation, editIcon)}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md"
                >
                    保存
                </button>
            </div>
        </div>
    );
};
