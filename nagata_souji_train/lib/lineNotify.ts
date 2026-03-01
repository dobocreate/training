export const sendLineNotify = async (message: string) => {
    const token = process.env.LINE_NOTIFY_TOKEN;
    if (!token) {
        console.warn("LINE_NOTIFY_TOKEN is not set.");
        return;
    }

    try {
        const response = await fetch("https://notify-api.line.me/api/notify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${token}`,
            },
            body: new URLSearchParams({
                message: message,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to send LINE notification:", response.status, errorText);
        }
    } catch (error) {
        console.error("Error sending LINE notification:", error);
    }
};
