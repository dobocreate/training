export const memberColors = [
    { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", ring: "ring-red-200", darkBg: "dark:bg-red-900/50", darkText: "dark:text-red-200" },
    { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", ring: "ring-orange-200", darkBg: "dark:bg-orange-900/50", darkText: "dark:text-orange-200" },
    { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", ring: "ring-amber-200", darkBg: "dark:bg-amber-900/50", darkText: "dark:text-amber-200" },
    { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", ring: "ring-yellow-200", darkBg: "dark:bg-yellow-900/50", darkText: "dark:text-yellow-200" },
    { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-200", ring: "ring-lime-200", darkBg: "dark:bg-lime-900/50", darkText: "dark:text-lime-200" },
    { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", ring: "ring-green-200", darkBg: "dark:bg-green-900/50", darkText: "dark:text-green-200" },
    { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", ring: "ring-emerald-200", darkBg: "dark:bg-emerald-900/50", darkText: "dark:text-emerald-200" },
    { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", ring: "ring-teal-200", darkBg: "dark:bg-teal-900/50", darkText: "dark:text-teal-200" },
    { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200", ring: "ring-cyan-200", darkBg: "dark:bg-cyan-900/50", darkText: "dark:text-cyan-200" },
    { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200", ring: "ring-sky-200", darkBg: "dark:bg-sky-900/50", darkText: "dark:text-sky-200" },
    { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", ring: "ring-blue-200", darkBg: "dark:bg-blue-900/50", darkText: "dark:text-blue-200" },
    { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", ring: "ring-indigo-200", darkBg: "dark:bg-indigo-900/50", darkText: "dark:text-indigo-200" },
    { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", ring: "ring-violet-200", darkBg: "dark:bg-violet-900/50", darkText: "dark:text-violet-200" },
    { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", ring: "ring-purple-200", darkBg: "dark:bg-purple-900/50", darkText: "dark:text-purple-200" },
    { bg: "bg-fuchsia-100", text: "text-fuchsia-700", border: "border-fuchsia-200", ring: "ring-fuchsia-200", darkBg: "dark:bg-fuchsia-900/50", darkText: "dark:text-fuchsia-200" },
    { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200", ring: "ring-pink-200", darkBg: "dark:bg-pink-900/50", darkText: "dark:text-pink-200" },
    { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", ring: "ring-rose-200", darkBg: "dark:bg-rose-900/50", darkText: "dark:text-rose-200" },
];

export function getMemberColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % memberColors.length;
    return memberColors[index];
}

export function isHex(color: string) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

// Simple YIQ contrast ratio for selecting black or white text
export function getContrastColor(hex: string) {
    if (!isHex(hex)) return "text-gray-700";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? "text-gray-900" : "text-white";
}

export function getCustomColor(hex: string) {
    const textColor = getContrastColor(hex);
    return {
        bg: hex, // Used in style={{ backgroundColor: bg }}
        text: textColor,
        border: "border-gray-200",
        ring: "ring-gray-200",
        darkBg: hex,
        darkText: textColor,
        isCustom: true
    };
}
