import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendLineMessage } from "@/lib/line";
import { sendLineNotify } from "@/lib/lineNotify";

// Define the path to the JSON file
const DATA_FILE_PATH = path.join(process.cwd(), "data", "duty.json");

interface DutyData {
    members: string[];
    currentIndex: number;
    lastUpdated: string;
    history?: { member: string; date: string }[];
    profiles?: Record<string, { color: string; affiliation: string; icon?: string }>;
    messages?: { id: string; sender: string; content: string; date: string }[];
    manual?: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "duty.json");

function readData(): DutyData {
    if (!fs.existsSync(DATA_FILE)) {
        return {
            members: ["石飛", "中土", "KIM", "ALIF", "THOM", "中村"],
            currentIndex: 0,
            lastUpdated: new Date().toISOString(),
            history: [],
            profiles: {},
            messages: []
        };
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    if (!data.profiles) data.profiles = {};
    if (!data.history) data.history = [];
    if (!data.messages) data.messages = [];
    return data;
}

function writeData(data: DutyData) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

import { getGoogleCalendarEvents } from "@/lib/googleCalendar";

async function getActiveMembers(data: DutyData) {
    const today = new Date();
    const day = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    try {
        const events = await getGoogleCalendarEvents(startOfWeek.toISOString(), endOfWeek.toISOString());
        const memberSet = new Set<string>();

        events.forEach((event: any) => {
            if (event.summary) {
                // Remove noise from summary for matching
                const normalizedSummary = event.summary.replace(/[(\uff08].*?[)\uff09]/g, "").replace(/バイト|\s/g, "").trim();

                data.members.forEach(member => {
                    // Try exact match first, then partial
                    if (normalizedSummary === member || event.summary.includes(member)) {
                        memberSet.add(member);
                    }
                });
            }
        });
        return Array.from(memberSet);
    } catch (error) {
        console.error("Failed to fetch weekly shifts:", error);
        return [];
    }
}

export async function GET() {
    const data = readData();
    const activeMembers = await getActiveMembers(data);
    return NextResponse.json({ ...data, activeMembers });
}

export async function POST(req: Request) {
    const body = await req.json();
    const { action } = body;
    const data = readData();

    if (action === "next") {
        const activeMembers = await getActiveMembers(data);

        // Helper for weighted selection based on duty history
        const selectWeightedMember = (candidates: string[]) => {
            if (candidates.length === 0) return null;

            const dutyCounts: Record<string, number> = {};
            candidates.forEach(m => dutyCounts[m] = 0);

            if (data.history) {
                data.history.forEach(h => {
                    if (dutyCounts[h.member] !== undefined) {
                        dutyCounts[h.member]++;
                    }
                });
            }

            const weights = candidates.map(m => {
                const count = dutyCounts[m] || 0;
                return { member: m, weight: 1.0 / (count + 1) };
            });

            const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
            let r = Math.random() * totalWeight;

            for (const item of weights) {
                r -= item.weight;
                if (r < 0) return item.member;
            }
            return candidates[candidates.length - 1];
        };

        let selectedName: string | null = null;

        if (activeMembers.length > 0) {
            selectedName = selectWeightedMember(activeMembers);
        } else {
            selectedName = selectWeightedMember(data.members);
        }

        let nextIndex = -1;
        if (selectedName) {
            nextIndex = data.members.indexOf(selectedName);
        }

        if (nextIndex === -1) {
            nextIndex = Math.floor(Math.random() * data.members.length);
        }

        const currentPerson = data.members[data.currentIndex];
        const completionDate = new Date().toISOString();
        data.history!.push({
            member: currentPerson,
            date: completionDate
        });

        data.currentIndex = nextIndex;
        data.lastUpdated = completionDate;

        writeData(data);

        const nextPerson = data.members[nextIndex];
        const message = `次の掃除担当は ${nextPerson} さんです`;

        await sendLineMessage(message);

        return NextResponse.json({ ...data, activeMembers });
    } else if (action === "updateMembers") {
        const { members } = body;
        if (Array.isArray(members)) {
            data.members = members;
            // Validate index
            if (data.currentIndex >= members.length) {
                data.currentIndex = 0;
            }
            writeData(data);
        }
        return NextResponse.json(data);
    } else if (action === "addHistory") {
        const { date, member } = body;
        if (date && member) {
            // Check if entry exists for this date (simple check by date string)
            const targetDateStr = new Date(date).toDateString();
            const existingIndex = data.history!.findIndex(h => new Date(h.date).toDateString() === targetDateStr);

            if (existingIndex >= 0) {
                data.history![existingIndex] = { member, date };
            } else {
                data.history!.push({ member, date });
            }

            // Sort history
            data.history!.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            writeData(data);
        }
        return NextResponse.json(data);
    } else if (action === "updateProfile") {
        const { member, color, affiliation, icon } = body;
        if (member) {
            if (!data.profiles) data.profiles = {};
            // Merge existing profile data with updates, or create new
            const existing = data.profiles[member] || {};
            data.profiles[member] = {
                color: color !== undefined ? color : existing.color,
                affiliation: affiliation !== undefined ? affiliation : existing.affiliation,
                icon: icon !== undefined ? icon : existing.icon
            };
            writeData(data);
        }
        return NextResponse.json(data);
    } else if (action === "addMessage") {
        const { sender, content } = body;
        if (sender && content) {
            if (!data.messages) data.messages = [];
            data.messages.push({
                id: Math.random().toString(36).substring(2, 11),
                sender,
                content,
                date: new Date().toISOString()
            });
            // Keep only last 50 messages to prevent JSON bloat
            if (data.messages.length > 50) {
                data.messages = data.messages.slice(-50);
            }
            writeData(data);
        }
        return NextResponse.json(data);
    } else if (action === "updateManual") {
        const { manual } = body;
        if (typeof manual === "string") {
            data.manual = manual;
            writeData(data);
        }
        return NextResponse.json(data);
    } else if (action === "deleteMessage") {
        const { id } = body;
        if (id && data.messages) {
            data.messages = data.messages.filter(m => m.id !== id);
            writeData(data);
        }
        return NextResponse.json(data);
    } else if (action === "editMessage") {
        const { id, content } = body;
        if (id && content && data.messages) {
            const index = data.messages.findIndex(m => m.id === id);
            if (index !== -1) {
                data.messages[index].content = content;
                writeData(data);
            }
        }
        return NextResponse.json(data);
    } else if (action === "renameMember") {
        const { oldName, newName } = body;
        if (oldName && newName && oldName !== newName) {
            // Check if new name already exists (prevent duplicates)
            if (data.members.includes(newName)) {
                return NextResponse.json({ error: "Member name already exists" }, { status: 400 });
            }

            // Update members list
            const index = data.members.indexOf(oldName);
            if (index !== -1) {
                data.members[index] = newName;

                // Update profile key
                if (data.profiles && data.profiles[oldName]) {
                    data.profiles[newName] = data.profiles[oldName];
                    delete data.profiles[oldName];
                }

                // Update history
                if (data.history) {
                    data.history.forEach(h => {
                        if (h.member === oldName) h.member = newName;
                    });
                }

                // Update messages
                if (data.messages) {
                    data.messages.forEach(m => {
                        if (m.sender === oldName) m.sender = newName;
                    });
                }

                writeData(data);
            }
        }
        return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
