import Image from "next/image";
import React, { useState, useEffect } from "react";
import { isHex, getMemberColor } from "@/lib/colors";
import { getMemberDisplayColor, getMemberAffiliation } from "./utils";
import { ProfileEditFormWithPreview } from "./ProfileEditForm";
import { ProfileStatsView } from "./ProfileStatsView";

interface MemberProfileModalProps {
    member: string;
    profiles: Record<string, { color: string; affiliation: string; icon?: string }>;
    history: { member: string; date: string }[];
    onClose: () => void;
    onUpdateProfile?: (member: string, color: string, affiliation: string, icon?: string) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
    member,
    profiles,
    history,
    onClose,
    onUpdateProfile
}) => {
    const [isEditing, setIsEditing] = useState(false);

    // Get current profile data
    const currentProfile = profiles[member];
    const initialColor = currentProfile?.color || getMemberColor(member).bg;
    const initialAffiliation = currentProfile?.affiliation || "";
    const initialIcon = currentProfile?.icon;
    const memberColor = getMemberDisplayColor(member, profiles);

    const [previewColor, setPreviewColor] = useState(initialColor);

    useEffect(() => {
        setPreviewColor(initialColor);
    }, [initialColor]);

    const handleSave = (color: string, affiliation: string, icon?: string) => {
        if (onUpdateProfile) {
            onUpdateProfile(member, color, affiliation, icon);
        }
        setIsEditing(false);
    };

    // Calculate used colors for the picker
    const usedColors = Object.values(profiles).map(p => p.color);

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className={`bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 transform transition-all scale-100`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Color */}
                <div
                    className={`h-32 ${isEditing ? (isHex(previewColor) ? "" : previewColor) : (isHex(memberColor.bg) ? "" : memberColor.bg)} relative flex items-center justify-center transition-colors duration-300`}
                    style={isEditing && isHex(previewColor) ? { backgroundColor: previewColor } : (!isEditing && isHex(memberColor.bg) ? { backgroundColor: memberColor.bg } : {})}
                >
                    <button
                        onClick={onClose}
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

                    <div className={`w-28 h-28 rounded-full border-4 border-white dark:border-zinc-900 shadow-xl flex items-center justify-center bg-white absolute -bottom-14 overflow-hidden`}>
                        {initialIcon ? (
                            <Image
                                src={`/icons/${initialIcon}.png`}
                                alt={initialIcon}
                                width={112}
                                height={112}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <span className="text-4xl font-bold text-gray-700">{member.charAt(0)}</span>
                        )}
                    </div>
                </div>

                <div className="pt-20 pb-8 px-8 text-center">
                    <h2 className={`text-2xl font-bold mb-2 ${memberColor.text} ${memberColor.darkText}`}>
                        {member}
                    </h2>

                    {isEditing ? (
                        <ProfileEditFormWithPreview
                            member={member}
                            initialColor={initialColor}
                            initialAffiliation={initialAffiliation}
                            initialIcon={initialIcon}
                            usedColors={usedColors}
                            onCancel={() => setIsEditing(false)}
                            onSave={handleSave}
                            onColorChange={setPreviewColor}
                        />
                    ) : (
                        <ProfileStatsView
                            member={member}
                            affiliation={getMemberAffiliation(member, profiles)}
                            history={history}
                            profiles={profiles}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Inline wrapper to handle the preview update because ProfileEditFormProps doesn't have onColorChange
// I need to update ProfileEditForm props to include onColorChange or direct control 
// For now, I'll allow ProfileEditForm to controlled or semi-controlled.
// Let's redefine ProfileEditForm content here slightly or use a controlled version.
// Looking at my previous step, ProfileEditForm has internal state.
// I should update ProfileEditForm to accept `onColorChange` callback if I want the live preview feature.

// Let's rewrite ProfileEditForm in my mind...
// It's internal state `editColor`.
// I'll update `ProfileEditForm.tsx` to accept `onColorChange`.
// Wait, I already wrote the file. I can use `multi_replace` to add the prop.
// Or I can just overwrite it since I just created it.
