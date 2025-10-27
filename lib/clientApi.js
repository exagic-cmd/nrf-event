const BASE_URL = "https://app.airporttransfers.ai/api";   //API base URL
export const AI_BASE_URL = "https://ai.airporttransfers.ai";
//const REDIRECT_BASE_URL ='https://event-api.travelpos360.com/index.php'


export async function apiRequest({ endpoint, method = "GET", data, headers = {} }) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}/${endpoint}`, config);

  let responseData;
  try {
    responseData = await response.json();
  } catch {
    responseData = null;
  }

  if (!response.ok) {
    throw new Error(responseData?.message || responseData?.error || "Request failed");
  }

  return responseData;
}
// booknow 
export async function bookNow(id) {
  return apiRequest({
    endpoint: `product/${id}/1`,
    method: "GET", 
  });
}

// get tour mapper
export async function tour_location(productId, langId) {
  return apiRequest({
    endpoint: `tour_location/${productId}/${langId}`,
    method: "GET",
  });
}

// Generate user for chat
export async function generateUserCode() {
  return apiRequest({
    endpoint: `chat/generate-user-code`,
    method: "GET",
  });
}

//get catgories

export const getCategories = async () => {
  return apiRequest({
    endpoint: "category",
    method: "GET",
  });
};

//get BookingInfo

export const getBookingInfo = async () => {
  return apiRequest({
    endpoint: "category",
    method: "GET",
  });
};


// api.js


export async function trackAgentRedirect(payload) {
  const response = await fetch(`${BASE_URL}/affiliate-redirects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Agent redirect API failed");
  }

  return await response.json();
}


// AirportTransfers AI: Ensure chatbot is active for a given user
export async function ensureChatbotIsActive(userId) {
  try {
    const response = await fetch(`${AI_BASE_URL}/ensure-chatbot-is-active`, {
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
}

// AirportTransfers AI: Send message to transfer-agent with optional socket header
export async function sendTransferAgentMessage({ userId, message, selectedVehicleId = null, socketId }) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (socketId) headers["X-Socket-Id"] = socketId;

  const res = await fetch(`${AI_BASE_URL}/transfer-agent`, {
    method: "POST",
    headers,
    body: JSON.stringify({ userId, message, selectedVehicleId }),
  });

  if (!res.ok) {
    let errText = "Request failed";
    try {
      const err = await res.json();
      errText = err?.message || errText;
    } catch {}
    throw new Error(errText);
  }

  return res.json();
}

// AirportTransfers AI: Fetch chat logs for a user
export async function fetchChatLogs(userId) {
  const res = await fetch(`${AI_BASE_URL}/chat-logs/${userId}`);
  if (!res.ok) {
    let msg = "Failed to fetch chat logs";
    try {
      const err = await res.json();
      msg = err?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
