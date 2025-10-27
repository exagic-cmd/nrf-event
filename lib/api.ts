// lib/api.ts
export const fetchChatApi = async (userId: string, message: string, socketId?: string) => {
    try {
        const bookingToken = localStorage.getItem("booking_token");
        const response = await fetch("https://ai.airporttransfers.ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(socketId && { "X-Socket-Id": socketId }),
            },
            body: JSON.stringify({ userId, message, booking_token: bookingToken || null }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API call error:", error);
        throw error;
    }
};

export const ensureChatbotIsActive = async (userId: string) => {

    console.log("userid: ", userId)
    try {
        const response = await fetch("https://ai.airporttransfers.ai/ensure-chatbot-is-active", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Chatbot status check failed:", error);
        throw error;
    }
};
