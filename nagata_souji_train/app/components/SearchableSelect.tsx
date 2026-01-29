"use client";

import { useState, useRef, useEffect } from "react";

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "選択してください",
    className = "",
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // When dropdown opens, focus input - handled by conditional rendering autoFocus?
    // When value changes externally (or initial), update search term only if we want to show it?
    // Actually, typical pattern:
    // - Input displays the selected value OR the current search term.
    // - If not open and value exists, show value.
    // - If open, show search term (initially value, then editable).

    useEffect(() => {
        if (!isOpen) {
            // Reset search term to match value when closed, so it displays the selected item
            setSearchTerm(value);
        }
    }, [isOpen, value]);

    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                onClick={() => setIsOpen(true)}
                className="w-full"
            >
                <input
                    type="text"
                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 max-h-60 overflow-y-auto bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 custom-scrollbar">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option}
                                className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${option === value ? "bg-blue-50 dark:bg-blue-900/10 font-black text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-zinc-200"}`}
                                onClick={() => {
                                    onChange(option);
                                    setSearchTerm(option);
                                    setIsOpen(false);
                                }}
                            >
                                {option}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-sm text-gray-400 italic">
                            見つかりません
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
