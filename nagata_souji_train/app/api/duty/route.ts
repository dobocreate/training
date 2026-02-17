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

export async function GET() {
    const data = readData();

    // Calculate current week range (Sunday to Saturday)
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday
    const diff = now.getDate() - day; // Adjust to Sunday
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let activeMembers: string[] = [];

    try {
        const events = await getGoogleCalendarEvents(startOfWeek.toISOString(), endOfWeek.toISOString());
        // Extract unique member names from event summaries (assuming summary is member name)
        const memberSet = new Set<string>();
        // Normalize names (remove "バイト", trim spaces)
        events.forEach((event: any) => {
            if (event.summary) {
                let name = event.summary.replace("バイト", "").trim();
                // Check if this name exists in our master member list to be safe
                if (data.members.includes(name)) {
                    memberSet.add(name);
                }
            }
        });
        activeMembers = Array.from(memberSet);
    } catch (error) {
        console.error("Failed to fetch weekly shifts:", error);
        // Fallback to all members if calendar fetch fails? Or empty list?
        // Let's fallback to current members for stability, but observing task req "filter based on shift data"
        // If error, maybe best to show all or none. Let's keep empty and handle on frontend or just use all as fail-safe.
        activeMembers = [];
    }

    return NextResponse.json({ ...data, activeMembers });
}

export async function POST(req: Request) {
    const body = await req.json();
    const { action } = body;
    const data = readData();

    if (action === "next") {
        // ... existing next logic ...
        // Calculate active members for the current week
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day;
        const startOfWeek = new Date(now.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        let activeMembers: string[] = [];
        try {
            const events = await getGoogleCalendarEvents(startOfWeek.toISOString(), endOfWeek.toISOString());
            const memberSet = new Set<string>();
            events.forEach((event: any) => {
                if (event.summary) {
                    let name = event.summary.replace("バイト", "").trim();
                    if (data.members.includes(name)) memberSet.add(name);
                }
            });
            activeMembers = Array.from(memberSet);
        } catch (e) {
            console.error("Failed to get active members for rotation:", e);
        }

        let nextIndex = -1;
        if (activeMembers.length > 0) {
            // Pick random from active members
            const nextName = activeMembers[Math.floor(Math.random() * activeMembers.length)];
            nextIndex = data.members.indexOf(nextName);
        }

        if (nextIndex === -1) {
            // Fallback: Pick random from ALL members (instead of sequential)
            nextIndex = Math.floor(Math.random() * data.members.length);
        }

        const currentPerson = data.members[data.currentIndex];
        // Rotate (nextIndex is already calculated)

        // Save history
        const completionDate = new Date().toISOString();
        data.history!.push({
            member: currentPerson,
            date: completionDate
        });

        data.currentIndex = nextIndex;
        data.lastUpdated = completionDate;

        writeData(data);

        // Notification logic...
        const nextPerson = data.members[nextIndex];
        const message = `次の掃除担当は ${nextPerson} さんです`;

        await sendLineMessage(message);

        return NextResponse.json(data);
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
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
