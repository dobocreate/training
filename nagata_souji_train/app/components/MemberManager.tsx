"use client";

import { useState } from "react";
import { memberColors } from "@/lib/colors";
import { ToggleButton } from "./member-manager/ToggleButton";
import { MemberQueuePanel } from "./member-manager/MemberQueuePanel";
import { MemberProfileModal } from "./member-manager/MemberProfileModal";

interface MemberManagerProps {
    members: string[];
    history: { member: string; date: string }[];
    profiles?: Record<string, { color: string; affiliation: string }>;
    onUpdate: (newMembers: string[]) => void;
    onUpdateProfile?: (member: string, color: string, affiliation: string) => void;
}

export default function MemberManager({ members, history, profiles = {}, onUpdate, onUpdateProfile }: MemberManagerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    // Get all colors currently in use by profiles
    const usedColors = Object.values(profiles).map(p => p.color);

    const handleAdd = (name: string) => {
        const updated = [...members, name];
        onUpdate(updated);

        // Auto-assign an unused color if profiles sync is available
        if (onUpdateProfile) {
            const unusedColor = memberColors.find(c => !usedColors.includes(c.bg));
            if (unusedColor) {
                onUpdateProfile(name, unusedColor.bg, "");
            }
        }
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

    return (
        <>
            <ToggleButton isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />

            {isExpanded && (
                <MemberQueuePanel
                    members={members}
                    profiles={profiles}
                    onClose={() => setIsExpanded(false)}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    onSelectMember={setSelectedMember}
                />
            )}

            {selectedMember && (
                <MemberProfileModal
                    member={selectedMember}
                    profiles={profiles}
                    history={history}
                    onClose={() => setSelectedMember(null)}
                    onUpdateProfile={onUpdateProfile}
                />
            )}
        </>
    );
}
