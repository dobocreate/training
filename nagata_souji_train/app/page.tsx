"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import MemberManager from "./components/MemberManager";
import DutyCalendar from "./components/DutyCalendar";
import RouletteDisplay from "./components/RouletteDisplay";
import { getMemberColor } from "@/lib/colors";

interface DutyData {
  members: string[];
  currentIndex: number;
  lastUpdated: string;
  history: { member: string; date: string }[];
  profiles?: Record<string, { color: string; affiliation: string }>;
}

interface MemberManagerProps {
  members: string[];
  history: { member: string; date: string }[];
  profiles?: Record<string, { color: string; affiliation: string }>;
  onUpdateProfile?: (member: string, color: string, affiliation: string) => void;
  onAddMember: (member: string) => void;
  onDeleteMember: (member: string) => void;
  onReorderMembers: (newMembers: string[]) => void;
}

export default function Home() {
  const [data, setData] = useState<DutyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCleaningMenuOpen, setIsCleaningMenuOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/duty");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNext = async () => {
    if (!data) return;

    setLoading(true);
    try {
      const res = await fetch("/api/duty", {
        method: "POST",
        body: JSON.stringify({ action: "next" }),
      });

      if (res.ok) {
        await fetchData();
      } else {
        console.error("エラーが発生しました");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Wrapper for RouletteDisplay
  const handleNextWrapper = async () => {
    return new Promise<void>((resolve) => {
      handleNext().then(() => resolve());
    });
  };

  const handleUpdateMembers = async (newMembers: string[]) => {
    try {
      const res = await fetch("/api/duty", {
        method: "POST",
        body: JSON.stringify({ action: "updateMembers", members: newMembers }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddHistory = async (date: Date, member: string) => {
    try {
      const res = await fetch("/api/duty", {
        method: "POST",
        body: JSON.stringify({
          action: "addHistory",
          date: date.toISOString(),
          member
        }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to add history", error);
    }
  };

  const handleUpdateProfile = async (member: string, color: string, affiliation: string) => {
    try {
      const res = await fetch("/api/duty", {
        method: "POST",
        body: JSON.stringify({
          action: "updateProfile",
          member,
          color,
          affiliation
        }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  if (!data) return <div className="flex min-h-screen items-center justify-center dark:text-white">読み込み中...</div>;

  const currentPerson = data.members[data.currentIndex];
  // Safe calculation for next person
  const nextIndex = data.members.length > 0 ? (data.currentIndex + 1) % data.members.length : 0;
  const nextPerson = data.members[nextIndex];

  // Calculate Duty Count
  const dutyCount = data.history ? data.history.filter(h => h.member === currentPerson).length : 0;

  return (
    <div className="flex min-h-screen flex-col bg-emerald-50 dark:bg-black font-sans relative overflow-hidden">
      <MemberManager
        members={data.members}
        history={data.history || []}
        profiles={data.profiles || {}}
        onUpdate={handleUpdateMembers}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Cleaning Menu Button (Fixed: Icon on Right, Expands Left) */}
      <button
        onClick={() => setIsCleaningMenuOpen(true)}
        className="absolute bottom-36 right-10 flex flex-row-reverse items-center bg-white text-emerald-600 rounded-full shadow-xl border-4 border-white dark:border-zinc-800 transition-all hover:w-72 duration-300 ease-out z-40 h-20 w-20 group overflow-hidden"
        aria-label="掃除メニュー"
      >
        <div className="w-20 h-full flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
        <span className="whitespace-nowrap font-bold text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-10 group-hover:translate-x-0 ml-4">
          掃除マニュアル
        </span>
      </button>

      {/* Cleaning Menu Overlay */}
      <div
        className={`fixed inset-y-0 right-0 w-1/2 z-50 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out dark:bg-zinc-900/95 border-l border-gray-100 dark:border-zinc-800 ${isCleaningMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-8 h-full flex flex-col relative">
          <button
            onClick={() => setIsCleaningMenuOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            掃除メニュー
          </h2>

          <div className="flex-1 overflow-y-auto">
            <p className="text-gray-500 text-lg">ここに掃除の内容やオプションが表示されます。</p>
          </div>
        </div>
      </div>

      <main className={`w-full h-screen grid transition-all duration-500 ease-in-out ${isCalendarOpen ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-[0fr_1fr]"}`}>

        {/* Left Column: Calendar */}
        <div className={`h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transition-all duration-500 ease-in-out relative overflow-hidden ${isCalendarOpen ? "w-full opacity-100" : "w-0 opacity-0 border-none"}`}>
          {data.history && (
            <DutyCalendar
              history={data.history}
              members={data.members}
              onAddHistory={handleAddHistory}
              currentMember={currentPerson}
              lastUpdated={data.lastUpdated}
            />
          )}
        </div>

        {/* Right Column: Duty Display */}
        <div className="w-full h-full flex flex-col items-center justify-center relative bg-emerald-50 dark:bg-black">

          {/* Toggle Button for Calendar */}
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="absolute top-24 left-8 z-30 p-3 rounded-full bg-white dark:bg-zinc-800 shadow-md hover:shadow-lg transition-all text-gray-500 hover:text-blue-600 dark:text-gray-400 group border border-gray-100 dark:border-zinc-700"
            title={isCalendarOpen ? "カレンダーを閉じる" : "カレンダーを開く"}
          >
            {isCalendarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </button>

          <div className={`absolute top-8 transition-all duration-500 ${isCalendarOpen ? "left-1/2 transform -translate-x-1/2 w-full lg:left-0 lg:w-full lg:translate-x-0 flex justify-center" : "left-1/2 transform -translate-x-1/2"}`}>
            <div className="bg-white/80 backdrop-blur-md px-12 py-4 rounded-2xl shadow-sm border border-gray-100 dark:bg-zinc-900/80 dark:border-zinc-800 text-center inline-block pointer-events-auto min-w-[500px]">
              <h1 className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-wider flex items-center justify-center gap-3 whitespace-nowrap">
                <span className="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
                掃除当番システム
                <span className="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
              </h1>
            </div>
          </div>

          <div className="mt-20 w-full max-w-2xl px-4">
            <RouletteDisplay
              members={data.members}
              currentMember={currentPerson}
              onComplete={handleNextWrapper}
              loading={loading}
              nextPerson={nextPerson}
              dutyCount={dutyCount}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
