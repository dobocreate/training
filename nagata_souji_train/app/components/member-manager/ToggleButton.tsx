import React from "react";

interface ToggleButtonProps {
    isExpanded: boolean;
    onToggle: () => void;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({ isExpanded, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`absolute bottom-10 right-10 flex flex-row-reverse items-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl text-white z-[201] group border-4 border-white dark:border-zinc-800 transition-all duration-300 ease-out overflow-hidden ${isExpanded ? "w-16 h-16 from-gray-500 to-gray-600" : "h-16 w-16 hover:w-52"}`}
            aria-label={isExpanded ? "閉じる" : "メンバー管理"}
        >
            <div className="flex-shrink-0 w-16 h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            </div>

            {/* Text (Hover visible) */}
            {!isExpanded && (
                <span className="whitespace-nowrap font-bold text-base opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-10 group-hover:translate-x-0 ml-3">
                    メンバー編集
                </span>
            )}
        </button>
    );
};
