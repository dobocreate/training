import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendLineNotify } from "@/lib/lineNotify";

// Define the path to the JSON file
const DATA_FILE_PATH = path.join(process.cwd(), "data", "duty.json");

interface DutyData {
    members: string[];
    currentIndex: number;
    lastUpdated: string;
    history?: { member: string; date: string }[];
    profiles?: Record<string, { color: string; affiliation: string }>;
    messages?: { id: string; sender: string; content: string; date: string }[];
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

export async function GET() {
    const data = readData();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const body = await req.json();
    const { action } = body;
    const data = readData();

    if (action === "next") {
        // ... existing next logic ...
        const currentPerson = data.members[data.currentIndex];
        // Rotate
        const nextIndex = (data.currentIndex + 1) % data.members.length;

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
        const token = process.env.LINE_NOTIFY_TOKEN;
        if (token) {
            const nextPerson = data.members[nextIndex];
            const message = `\n掃除当番が完了しました。\n担当: ${currentPerson}\n次は ${nextPerson} さんです。`;

            try {
                await fetch("https://notify-api.line.me/api/notify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": `Bearer ${token}`
                    },
                    body: new URLSearchParams({ message })
                });
            } catch (error) {
                console.error("LINE Notification failed:", error);
            }
        }

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
        const { member, color, affiliation } = body;
        if (member) {
            if (!data.profiles) data.profiles = {};
            data.profiles[member] = { color, affiliation };
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
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
