import { getMemberColor, memberColors, isHex, getCustomColor } from "@/lib/colors";

export const getMemberDisplayColor = (member: string, profiles: Record<string, { color: string; affiliation: string }> = {}) => {
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
};

export const getMemberAffiliation = (member: string, profiles: Record<string, { color: string; affiliation: string }> = {}) => {
    return (profiles[member] && profiles[member].affiliation) || "所属なし";
};
