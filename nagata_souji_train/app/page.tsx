"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import MemberManager from "./components/MemberManager";
import DutyCalendar from "./components/DutyCalendar";
import RouletteDisplay from "./components/RouletteDisplay";
import { getMemberColor, memberColors, isHex, getCustomColor } from "@/lib/colors";

interface DutyData {
  members: string[];
  currentIndex: number;
  lastUpdated: string;
  history: { member: string; date: string }[];
  profiles?: Record<string, { color: string; affiliation: string }>;
  messages?: { id: string; sender: string; content: string; date: string }[];
  manual?: string;
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
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isBulletinOpen, setIsBulletinOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [isEditingManual, setIsEditingManual] = useState(false);
  const [editManualContent, setEditManualContent] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState("");

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

  const handleUpdateManual = async () => {
    if (!data) return;
    try {
      const res = await fetch("/api/duty", {
        method: "POST",
        body: JSON.stringify({ action: "updateManual", manual: editManualContent }),
      });
      if (res.ok) {
        await fetchData();
        setIsEditingManual(false);
      }
    } catch (error) {
      console.error("Failed to update manual", error);
    }
  };

  const [newMessage, setNewMessage] = useState("");
  const [messageSender, setMessageSender] = useState("");

  const handleAddMessage = async () => {
    if (!newMessage.trim() || !messageSender) return;
    try {
      const res = await fetch("/api/duty", {
        method: "POST",
        body: JSON.stringify({
          action: "addMessage",
          sender: messageSender,
          content: newMessage.trim()
        }),
      });
      if (res.ok) {
        setNewMessage("");
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to add message", error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("メッセージを削除しますか？")) return;
    try {
      const res = await fetch("/api/duty", {
        method: "POST",
        body: JSON.stringify({ action: "deleteMessage", id }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  const handleEditMessage = async () => {
    if (!editingMessageId || !editMessageContent.trim()) return;
    try {
      const res = await fetch("/api/duty", {
        method: "POST",
        body: JSON.stringify({ action: "editMessage", id: editingMessageId, content: editMessageContent.trim() }),
      });
      if (res.ok) {
        await fetchData();
        setEditingMessageId(null);
      }
    } catch (error) {
      console.error("Failed to edit message", error);
    }
  };

  // Standby/Splash screen state tracking
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!loading && data) {
      // Transition out after a short minimum display time for the feel
      const timer = setTimeout(() => setShowSplash(false), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  if (showSplash) {
    return (
      <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-emerald-50 dark:bg-zinc-950 transition-all duration-1000 ease-in-out ${!loading && data ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"}`}>
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/30 dark:bg-emerald-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/30 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

        <div className="relative flex flex-col items-center">
          {/* Logo Frame */}
          <div className="relative mb-12 transform-gpu hover:scale-110 transition-transform duration-700">
            <div className="absolute inset-0 bg-white/40 dark:bg-white/5 rounded-[4rem] blur-2xl animate-pulse scale-150"></div>
            <div className="relative bg-white/90 dark:bg-zinc-900 shadow-2xl rounded-[3rem] px-12 py-8 flex items-center justify-center gap-6 border border-white/50 backdrop-blur-3xl overflow-hidden">
              {/* Inner glow */}
              <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-3xl"></div>

              <div className="flex items-center gap-5">
                <div className="w-1.5 h-12 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                <h1 className="text-6xl font-black text-gray-800 dark:text-white tracking-tighter drop-shadow-sm">
                  掃除当番<span className="text-blue-600 dark:text-blue-400">システム</span>
                </h1>
                <div className="w-1.5 h-12 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full bg-emerald-500/60 transition-all duration-700 animate-bounce`} style={{ animationDelay: `${i * 150}ms` }}></div>
              ))}
            </div>
            <p className="text-emerald-700/60 dark:text-emerald-400/50 font-bold tracking-[0.3em] uppercase text-xs">
              {loading ? "INITIALIZING CORE DATA" : "READY TO START"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="flex min-h-screen items-center justify-center dark:text-white">読み込み中...</div>;

  const currentPerson = data.members[data.currentIndex];
  // Safe calculation for next person
  const nextIndex = data.members.length > 0 ? (data.currentIndex + 1) % data.members.length : 0;
  const nextPerson = data.members[nextIndex];

  // Calculate Duty Count (Sync with calendar visualization: latest assigned per day)
  let dutyCount = 0;
  if (data.history) {
    const dateToLatestMember = new Map<string, string>();
    data.history.forEach(h => {
      const dateStr = new Date(h.date).toDateString();
      dateToLatestMember.set(dateStr, h.member);
    });
    dutyCount = Array.from(dateToLatestMember.values()).filter(m => m === currentPerson).length;
  }

  const getColor = (member: string) => {
    const profile = data.profiles?.[member];
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

  return (
    <div className="flex min-h-screen flex-col bg-emerald-50 dark:bg-black font-sans relative overflow-hidden">
      <MemberManager
        members={data.members}
        history={data.history || []}
        profiles={data.profiles || {}}
        onUpdate={handleUpdateMembers}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Mini Bulletin Board (Top Right) */}
      <div
        onClick={() => setIsBulletinOpen(true)}
        className="fixed top-6 right-6 z-40 w-72 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-xl p-4 cursor-pointer hover:bg-white dark:hover:bg-zinc-900 transition-all hover:scale-[1.02] group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-blue-600 dark:text-blue-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m-9 3h3m-6.75 4.125l-.033.033L4.875 18l.033-.033M12 21.75l-4.5-4.5H4.875c-.621 0-1.125-.504-1.125-1.125V4.125c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v12c0 .621-.504 1.125-1.125 1.125h-4.5l-4.5 4.5z" />
              </svg>
            </div>
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">掃除連絡掲示板</h4>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>

        <div className="space-y-3">
          {data.messages && data.messages.length > 0 ? (
            [...data.messages].slice(-3).reverse().map((msg) => {
              const senderColor = getColor(msg.sender);
              return (
                <div key={msg.id} className="flex flex-col gap-0.5" title={`${msg.sender}: ${msg.content}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isHex(senderColor.bg) ? "" : senderColor.bg}`} style={isHex(senderColor.bg) ? { backgroundColor: senderColor.bg } : {}}></span>
                    <span className={`text-[10px] font-bold ${senderColor.text} ${senderColor.darkText}`} style={isHex(senderColor.bg) ? { color: senderColor.text === "text-white" ? "#fff" : "#111" } : {}}>{msg.sender}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-zinc-400 line-clamp-1 pl-3 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-[10px] text-gray-400 italic text-center py-2">新着メッセージはありません</p>
          )}
        </div>
      </div>

      {/* Cleaning Menu Button (Fixed: Icon on Right, Expands Left) */}
      <button
        onClick={() => {
          setIsBulletinOpen(true);
          setIsManualOpen(false);
        }}
        className="absolute bottom-60 right-10 flex flex-row-reverse items-center bg-white text-blue-600 rounded-full shadow-xl border-4 border-white dark:border-zinc-800 transition-all hover:w-72 duration-300 ease-out z-40 h-20 w-20 group overflow-hidden"
        aria-label="掃除連絡掲示板"
      >
        <div className="w-20 h-full flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m-9 3h3m-6.75 4.125l-.033.033L4.875 18l.033-.033M12 21.75l-4.5-4.5H4.875c-.621 0-1.125-.504-1.125-1.125V4.125c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v12c0 .621-.504 1.125-1.125 1.125h-4.5l-4.5 4.5z" />
          </svg>
        </div>
        <span className="whitespace-nowrap font-bold text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-10 group-hover:translate-x-0 ml-4">
          掃除連絡掲示板
        </span>
      </button>

      {/* Cleaning Menu Button (Fixed: Icon on Right, Expands Left) */}
      <button
        onClick={() => {
          setIsManualOpen(true);
          setIsBulletinOpen(false);
        }}
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

      {/* Cleaning Manual Overlay */}
      <div
        className={`fixed inset-y-0 right-0 w-1/2 z-[100] bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out dark:bg-zinc-900/95 border-l border-gray-100 dark:border-zinc-800 ${isManualOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-8 h-full flex flex-col relative">
          <button
            onClick={() => setIsManualOpen(false)}
            className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition group/close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-gray-400 group-hover/close:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>

          <h2 className="text-3xl font-black mb-8 flex flex-col gap-1 text-emerald-600 dark:text-emerald-400 pl-14">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 tracking-[0.2em]">Ver1.01 / 26.01.26</span>
              {!isEditingManual && (
                <button
                  onClick={() => {
                    setEditManualContent(data?.manual || "");
                    setIsEditingManual(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-800 flex items-center gap-1.5 hover:bg-emerald-100 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  編集する
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              ドボクリエイト 掃除マニュアル
            </div>
          </h2>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-10">
            {isEditingManual ? (
              <div className="space-y-4">
                <textarea
                  value={editManualContent}
                  onChange={(e) => setEditManualContent(e.target.value)}
                  className="w-full h-[600px] p-4 border rounded-2xl dark:bg-zinc-800 dark:border-zinc-700 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="マニュアルの内容をHTML等で記入してください..."
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditingManual(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl font-bold transition"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUpdateManual}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition"
                  >
                    変更を保存
                  </button>
                </div>
              </div>
            ) : data.manual ? (
              <div
                className="manual-content prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: data.manual }}
              />
            ) : (
              /* Original static manual as initial default */
              <>
                {/* Sector 1: Rules */}
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                  <h3 className="font-bold text-xl mb-4 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                    担当場所
                  </h3>
                  <ul className="space-y-4 text-gray-700 dark:text-zinc-300 text-sm">
                    <li className="flex gap-2">
                      <span className="text-emerald-500 font-bold">・</span>
                      <span>シンク、メインルーム、サブルームに当たった人は、その週のシフト中に掃除を行ってください。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-500 font-bold">・</span>
                      <span>週に1回だけでOKです。</span>
                    </li>
                    <li className="flex gap-2 bg-white/50 dark:bg-zinc-800/30 p-3 rounded-xl border border-emerald-100/50 italic text-[13px]">
                      <span>（もしその週にシフトが入っていない場合は、LINE等で代理の人を立てて掃除をお願いしてください。）</span>
                    </li>
                  </ul>
                </div>

                {/* Sector 2: Sink */}
                <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full flex items-center justify-end pr-4 pb-4 -mr-4 -mt-4">
                    <span className="text-blue-200 dark:text-blue-800 text-6xl font-black">S</span>
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    掃除方法 ― シンク ―
                  </h3>

                  <div className="mb-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">使う物</span>
                    <div className="flex flex-wrap gap-2">
                      {["バスタブクレンジング", "掃除用スポンジ(ボロボロの方)", "ビニール手袋", "水切りネット(週に一度交換)"].map(item => (
                        <span key={item} className="px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 rounded-xl text-[11px] font-bold text-gray-600 dark:text-zinc-400 border border-gray-100 dark:border-zinc-700">{item}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[
                      "水切りネットを交換する",
                      "シンクにバスタブクレンジングをばらまく",
                      "電子レンジ、冷蔵庫を除菌シート（レンジ専用シートがあればそれでもOK）で拭く",
                      "シンクにばらまいておいたクレンジングを洗い流す",
                      "気になる所（水垢等）を掃除用スポンジで綺麗にする"
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="flex flex-col items-center gap-1">
                          <span className="flex-shrink-0 w-8 h-8 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform">
                            {i + 1}
                          </span>
                          {i < 4 && <div className="w-0.5 h-full bg-blue-50 dark:bg-blue-900/20"></div>}
                        </div>
                        <div className="pt-1">
                          <span className="text-[14px] font-bold text-gray-700 dark:text-zinc-200 block mb-0.5">Step {i + 1}</span>
                          <span className="text-sm text-gray-600 dark:text-zinc-400 leading-6">{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sector 3: Main/Sub Room */}
                <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full flex items-center justify-end pr-4 pb-4 -mr-4 -mt-4">
                    <span className="text-emerald-200 dark:text-emerald-800 text-6xl font-black">R</span>
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                    メインルーム・サブルーム
                  </h3>

                  <div className="mb-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">使う物</span>
                    <span className="px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 rounded-xl text-[11px] font-bold text-gray-600 dark:text-zinc-400 border border-gray-100 dark:border-zinc-700 inline-block">掃除機（スティックタイプ）</span>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4 group">
                      <span className="flex-shrink-0 w-8 h-8 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-black">1</span>
                      <div className="pt-1">
                        <span className="text-[14px] font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">手順</span>
                        <span className="text-sm text-gray-600 dark:text-zinc-400 leading-6">
                          四角い部屋を四角く掃除機をかける。<br />
                          掃除機・irobotのゴミが溜まったら捨てる。
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cleaning Bulletin Board Overlay */}
      <div
        className={`fixed inset-y-0 right-0 w-1/2 z-[100] bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out dark:bg-zinc-900/95 border-l border-gray-100 dark:border-zinc-800 ${isBulletinOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-8 h-full flex flex-col relative">
          <button
            onClick={() => setIsBulletinOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="text-3xl font-black mb-8 flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m-9 3h3m-6.75 4.125l-.033.033L4.875 18l.033-.033M12 21.75l-4.5-4.5H4.875c-.621 0-1.125-.504-1.125-1.125V4.125c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v12c0 .621-.504 1.125-1.125 1.125h-4.5l-4.5 4.5z" />
            </svg>
            掃除連絡掲示板
          </h3>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar flex flex-col-reverse">
            {data.messages && data.messages.length > 0 ? (
              [...data.messages].reverse().map((msg) => (
                <div key={msg.id} className="flex flex-col gap-1 items-start group/msg">
                  <div className="flex items-center gap-2 px-1">
                    <span className={`text-xs font-bold ${getColor(msg.sender).text} ${getColor(msg.sender).darkText}`}>{msg.sender}</span>
                    <span className="text-[10px] text-gray-400">{new Date(msg.date).toLocaleString()}</span>
                  </div>

                  {editingMessageId === msg.id ? (
                    <div className="w-full space-y-2 bg-white dark:bg-zinc-800 p-3 rounded-2xl border-2 border-blue-500 shadow-lg animate-in zoom-in-95 duration-150">
                      <textarea
                        value={editMessageContent}
                        onChange={(e) => setEditMessageContent(e.target.value)}
                        className="w-full p-2 text-sm bg-gray-50 dark:bg-zinc-900 border rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={handleEditMessage}
                          className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 w-full">
                      <div className="bg-white dark:bg-zinc-800 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-sm max-w-[85%] break-words flex-shrink-0">
                        {msg.content}
                      </div>

                      {/* Action Buttons: Positioned beside the bubble */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity pt-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditMessageContent(msg.content);
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-400 hover:text-blue-500 transition"
                          title="編集"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-gray-400 hover:text-red-500 transition"
                          title="削除"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 italic">
                <p>まだメッセージはありません</p>
              </div>
            )}
          </div>

          {/* Post Form */}
          <div className="bg-gray-50 dark:bg-zinc-950/50 p-4 rounded-3xl border border-gray-100 dark:border-zinc-800">
            <div className="flex gap-2 mb-2">
              <select
                value={messageSender}
                onChange={(e) => setMessageSender(e.target.value)}
                className="flex-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">投稿者を選択...</option>
                {data.members.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="メッセージを入力..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMessage()}
                className="flex-[3] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleAddMessage}
                disabled={!newMessage.trim() || !messageSender}
                className="flex-1 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                投稿
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className={`w-full h-screen grid transition-all duration-500 ease-in-out ${isCalendarOpen ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-[0fr_1fr]"}`}>

        {/* Left Column: Calendar */}
        <div className={`h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transition-all duration-500 ease-in-out relative overflow-hidden z-[40] ${isCalendarOpen ? "w-full opacity-100" : "w-0 opacity-0 border-none"}`}>
          {/* Toggle Button for Calendar (Moved to top-right, simplified) */}
          {isCalendarOpen && (
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-blue-600/10 text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white transition-all group border border-blue-200"
              title="カレンダーを閉じる"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {data.history && (
            <DutyCalendar
              history={data.history}
              members={data.members}
              onAddHistory={handleAddHistory}
              currentMember={currentPerson}
              lastUpdated={data.lastUpdated}
              loading={loading}
              nextPerson={nextPerson}
              dutyCount={dutyCount}
              profiles={data.profiles || {}}
              onNext={handleNextWrapper}
            />
          )}
        </div>

        {/* Right Column: Duty Display */}
        <div className="w-full h-full flex flex-col items-center justify-center relative bg-emerald-50 dark:bg-black">

          {/* Toggle Button for Calendar (appears when calendar is closed) */}
          {!isCalendarOpen && (
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="absolute top-40 left-8 z-50 flex items-center bg-blue-600 text-white rounded-full shadow-xl border-4 border-white dark:border-zinc-800 transition-all hover:w-72 duration-300 ease-out h-20 w-20 group overflow-hidden"
              aria-label="当番カレンダー"
            >
              <div className="w-20 h-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <span className="whitespace-nowrap font-bold text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-10 group-hover:translate-x-0 ml-4">
                当番カレンダー
              </span>
            </button>
          )}

          {/* Fixed Title Box at Top Left */}
          <div className="absolute top-10 left-12 z-[60] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-2xl px-10 py-5 rounded-[2rem] shadow-2xl border border-white/50 dark:bg-zinc-900/95 dark:border-zinc-800 text-left inline-block pointer-events-auto min-w-[400px]">
              <h1 className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-wider flex items-center justify-start gap-4 whitespace-nowrap">
                <span className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                掃除当番システム
                <span className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              </h1>
            </div>
          </div>

          <div className="mt-20 w-full max-w-2xl px-4">
            <RouletteDisplay
              members={data.members}
              currentMember={currentPerson}
              profiles={data.profiles || {}}
              onComplete={handleNextWrapper}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
