import { messagingApi } from "@line/bot-sdk";

const { MessagingApiClient } = messagingApi;

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
// ユーザーID、グループID、またはトークルームIDを入力可能
const destinationId = process.env.LINE_USER_ID || "";

const client = new MessagingApiClient({
    channelAccessToken: channelAccessToken
});

export const sendLineMessage = async (text: string) => {
    if (!channelAccessToken) {
        console.warn("LINE_CHANNEL_ACCESS_TOKEN is not set. Skipping notification.");
        return;
    }

    try {
        if (destinationId) {
            // Push to specific user/group/room
            await client.pushMessage({
                to: destinationId,
                messages: [{ type: "text", text: text }]
            });
            console.log("LINE message pushed to:", destinationId);
        } else {
            // Broadcast to all followers
            await client.broadcast({
                messages: [{ type: "text", text: text }]
            });
            console.log("LINE message broadcasted to all followers.");
        }
    } catch (error) {
        console.error("Error sending LINE Messaging API notification:", error);
    }
};
