"use client";
import { useTransferStore } from "@/store/useTransferStore"
import usePusher from "@/hooks/usePusher";
import { ensureChatbotIsActive, sendTransferAgentMessage, fetchChatLogs } from "@/lib/clientApi";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/router";
// Function to generate a random user ID
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

// Function to get or create user ID from localStorage
const getOrCreateUserId = () => {
  if (typeof window === 'undefined') return 'default_user';
  
  let userId = localStorage.getItem("teressa_user_id");
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem("teressa_user_id", userId);
  }
  return userId;
};

export default function ChatPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [lastApiResponse, setLastApiResponse] = useState(null);
  const [messages, setMessages] = useState([]);
  const { socketId, newMessage } = usePusher(userId || null);

  const [input, setInput] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [confirmVehicle, setConfirmVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize user ID and fetch chat logs on component mount
  useEffect(() => {
    const user = getOrCreateUserId();
    setUserId(user);

    async function fetchChatLogsAndSetInitialMessage() {
      const initialHelloMessage = {
        sender: "ai",
        text: `Hello! I am Teressa, your Airport Transfers Booking Assistant.  
How can I assist you today?`,
      };

      const welcomeBackMessage = {
        sender: "ai",
        text: `Welcome back!
        How can I assist you today?`
      };

      if (!user || user === 'default_user') {
        setMessages([initialHelloMessage]);
        return;
      }
      
      try {
        const data = await fetchChatLogs(user);
        let chatHistory = [];

        if (data.logs && data.logs.length > 0) {
          chatHistory = data.logs.flatMap((log) => {
            let systemResp = {};
            try {
              systemResp = JSON.parse(log.system_response);
            } catch {
              systemResp = { message: log.system_response, data: {} };
            }
            return [
              { sender: "user", text: log.user_message },
              {
                sender: "ai",
                text: systemResp.message,
                vehicles: systemResp.data?.vehicles || [],
              },
            ];
          });
          setMessages([...chatHistory, welcomeBackMessage]); 
        } else {
          setMessages([initialHelloMessage]); 
        }
        
      } catch (error) {
        console.error("Failed to fetch chat logs:", error);
        setMessages([initialHelloMessage]); 
      }
    }

    fetchChatLogsAndSetInitialMessage();
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    const savedVehicle = localStorage.getItem(`selectedVehicle_${userId}`);
    if (savedVehicle) {
      setSelectedVehicleId(JSON.parse(savedVehicle).vehicle_id);
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, confirmVehicle]);

  // Append messages received via Pusher
  useEffect(() => {
    if (!newMessage) return;
    setMessages((prev) => [...prev, { sender: "ai", text: newMessage }]);
  }, [newMessage]);

  const refreshChat = () => {
    setShowRefreshConfirm(true);
  };

  const confirmRefresh = () => {
    // Clear current chat and user ID
    localStorage.removeItem("teressa_user_id");
    localStorage.removeItem(`selectedVehicle_${userId}`);
    
    const newUserId = generateUserId();
    localStorage.setItem("teressa_user_id", newUserId);
    setUserId(newUserId);
    
    // Reset to initial state
    setMessages([
      {
        sender: "ai",
        text: `Hello! I am Teressa, your Airport Transfers Booking Assistant.  
How can I assist you today?`,
      },
    ]);
    
    setSelectedVehicleId(null);
    setConfirmVehicle(null);
    setShowRefreshConfirm(false);
  };

  const cancelRefresh = () => {
    setShowRefreshConfirm(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !userId) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    localStorage.removeItem(`selectedVehicle_${userId}`);
    setSelectedVehicleId(null);

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    try {
      // Ensure AI ChatBot is Active
      const isAIActive = await ensureChatbotIsActive(userId);
      const isChatbotInactive = isAIActive?.result === false;

      if (isChatbotInactive) {
        setIsLoading(false);
      }

      const data = await sendTransferAgentMessage({
        userId,
        message: userMessage,
        selectedVehicleId: null,
        socketId,
      });

      if (isChatbotInactive) {
        return;
      }
      
 setLastApiResponse(data); 
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.message, vehicles: data.data?.vehicles },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Something went wrong." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) sendMessage();
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-800 bg-gradient-to-r from-black to-gray-900">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
            <span className="text-black font-bold text-sm">T</span>
          </div>
          <div>
            <h1 className="text-md font-semibold text-white">Teressa</h1>
            <p className="text-xs text-gray-400">Airport Transfer Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">User: {userId.substring(0, 8)}...</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-gray-900 to-black pt-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-3">
            <div className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "ai" && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
              )}

              <div className={`max-w-[80%] ${msg.sender === "user" ? "order-first" : ""}`}>
                <div
                  className={`px-3 py-2 rounded-xl ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-yellow-500 to-yellow-600 text-black"
                      : "bg-gray-800 text-white border border-gray-700"
                  }`}
                >
                  <ReactMarkdown 
                    components={{
                      p: ({ children }) => (
                        <p className="text-sm leading-relaxed m-0">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold">
                          {children}
                        </strong>
                      ),
                      a: ({ children, href }) => (
                        <a href={href} className="underline font-semibold text-xs">
                          {children}
                        </a>
                      )
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Vehicle Listings */}
            {msg.vehicles && msg.vehicles.length > 0 && (
              <div className="ml-8 space-y-2">
                <p className="text-xs text-gray-400 font-medium">Available Vehicles:</p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {msg.vehicles.map((v) => {
                    const isSelected = selectedVehicleId === v.vehicle_id;
                    return (
                      <div
                        key={v.vehicle_id}
                        className={`flex-shrink-0 w-64 bg-gray-800 rounded-lg border transition-all ${
                          isSelected 
                            ? "border-yellow-500 shadow-lg shadow-yellow-500/20" 
                            : "border-gray-700"
                        }`}
                      >
                        <div className="p-3">
                          <div className="relative mb-2">
                            <img
                              src={`https://res.cloudinary.com/www-travelpakistani-com/image/upload/${v.image}`}
                              alt={v.vehicle_name}
                              className="w-full h-28 object-cover rounded-md"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='128' viewBox='0 0 320 128' fill='none'%3E%3Crect width='320' height='128' fill='%23374151'/%3E%3Cpath d='M60 40h200v16H60v-16zm0 24h200v16H60v-16zm24 24h152v16H84v-16z' fill='%23CC9A55'/%3E%3Ccircle cx='100' cy='100' r='12' fill='%23CC9A55'/%3E%3Ccircle cx='220' cy='100' r='12' fill='%23CC9A55'/%3E%3C/svg%3E";
                              }}
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-bold text-sm text-white truncate">{v.vehicle_name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-200">
                                {v.vehicle_type}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-300">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                {v.min_capacity}-{v.max_capacity}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-md font-bold text-yellow-400">
                                ${isNaN(Number(v.display_price)) ? v.display_price : Number(v.display_price).toFixed(2)}
                              </span>
                              
                              <button
                                onClick={() => setConfirmVehicle(v)}
                                className={`px-3 py-1.5 rounded text-xs transition-all ${
                                  isSelected
                                    ? "bg-yellow-500 text-black"
                                    : "bg-gray-700 text-white border border-gray-600"
                                }`}
                              >
                                {isSelected ? "Selected" : "Select"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <div className="ml-2 bg-gray-800 text-white border border-gray-700 px-3 py-2 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-300">Teressa is typing...</span>
              </div>
            </div>
          </div>
        )}

        {confirmVehicle && (
          <div className="flex justify-start">
            <div className="ml-8 max-w-[85%] bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-white text-sm leading-relaxed">
                    Confirm <strong className="text-yellow-400">{confirmVehicle.vehicle_name}</strong>?
                  </p>
                  <div className="flex gap-2">
                   <button
onClick={() => {
  const transferData = lastApiResponse?.data?.user_transfer;
  console.log("transferData", transferData);

  useTransferStore.getState().setSelectedTransfer({
    ...confirmVehicle,
    transferId: transferData?.id,
  });

  useTransferStore.getState().setSearchParams({
    pickup: {
      id: transferData?.pickup_point_id,
      name: transferData?.pickup_point_name,
    },
    dropoff: {
      id: transferData?.dropoff_point_id,
      name: transferData?.dropoff_point_name,
    },
    tripType: transferData?.trip_type || "one-way",
  });

  useTransferStore.getState().setSelectedPickup({
    id: transferData?.pickup_point_id,
    name: transferData?.pickup_point_name,
  });

  useTransferStore.getState().setSelectedDropoff({
    id: transferData?.dropoff_point_id,
    name: transferData?.dropoff_point_name,
  });

  setSelectedVehicleId(confirmVehicle.vehicle_id);
  localStorage.setItem(
    `selectedVehicle_${userId}`,
    JSON.stringify(confirmVehicle)
  );
  setMessages((prev) => [
    ...prev,
    {
      sender: "ai",
      text: `Confirmed ${confirmVehicle.vehicle_name}. Redirecting...`,
    },
  ]);

  setConfirmVehicle(null);

  setTimeout(() => {
     router.push("/transfers/booking");
  }, 800); 
}}
className="bg-green-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
>
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
  Yes, Confirm
</button>

                    <button
                      onClick={() => {
                        setConfirmVehicle(null);
                        setMessages((prev) => [
                          ...prev,
                          { sender: "ai", text: "What can we help with your selection?" },
                        ]);
                      }}
                      className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 border border-gray-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      No, Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Refresh Confirmation Dialog */}
      {showRefreshConfirm && (
        <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-gradient-to-r from-black to-gray-900">
          <div className="max-w-4xl mx-auto bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-300 mb-1">Clear Chat History?</h3>
                <p className="text-sm text-gray-300 mb-3">
                  This will remove your current chat history and start a new session. Your existing chat will be gone and cannot be recovered.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={confirmRefresh}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Yes, Clear Chat
                  </button>
                  <button
                    onClick={cancelRefresh}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center gap-1 transition-colors border border-gray-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    No, Keep Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area with Refresh Button */}
      <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-gradient-to-r from-black to-gray-900">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-gray-400">
            Session ID: <span className="font-mono">{userId}</span>
          </div>
          <button
            onClick={refreshChat}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors border border-gray-700 text-yellow-300"
            title="Start a new chat session"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Chat
          </button>
        </div>
        
        <div className="flex gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              className={`w-full bg-gray-800 border-2 border-gray-700 rounded-xl p-4 pr-12 text-white text-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder={isLoading ? "Please wait..." : "Type your message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {isLoading ? (
                <svg className="w-5 h-5 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                </svg>
              )}
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`px-5 py-4 rounded-xl transition-all flex items-center gap-2 text-md font-semibold ${
              isLoading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black hover:shadow-yellow-500/25'
            } ${!input.trim() && !isLoading ? 'from-gray-700 to-gray-700 cursor-not-allowed text-gray-400' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}