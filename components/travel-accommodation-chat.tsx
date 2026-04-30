"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  User,
  HeadphonesIcon,
  Bot,
  Car,
  Utensils,
  Camera,
  Clock,
  DollarSign,
  Send,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
// import RequirementHints from '@/components/RequirementHints';
import NewChatButton from '@/components/NewChatButton';
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RequirementsProgress from "./requirements-progress";
import HotelCard from "./hotel-card";
import ItineraryDisplay from "./itinerary-display";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getOrCreateUserId } from "@/lib/utils";
import { fetchChatApi, ensureChatbotIsActive } from "@/lib/api";
import ItineraryDrawer from "@/components/ItineraryDrawer";
import usePusher from "@/hooks/usePusher";
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import ProductList from "@/components/chat/ProductList";
import VehicleList from "@/components/chat/VehicleList";

// Define types based on the API response structure
type ApiResponse = {
  message: string;
  options: string[] | null;
  type: string;
  suggestedAccommodation: HotelType | null;
  suggestedTransfer: TransferType | null;
  suggestedMeal: MealType | null;
  suggestedActivity: ActivityType | null;
  itinerary: ItineraryType | null;
  basicReq: BasicRequirements | null;
  accommodationReq: AccommodationRequirements | null;
  transferReq: TransferRequirements | null;
  mealReq: MealRequirements | null;
  activityReq: ActivityRequirements | null;
  products?: any;
  vehicles?: any;
  transferInfo?: any;
};

type MessageType = {
  id: string;
  content: string;
  sender: "ai" | "user" | "human-agent";
  timestamp: string;
  options?: string[] | null;
  selectedOption?: string;

  products?: any;
  vehicles?: any;
  transferInfo?: any;

  // ✅ Accept a single object or an array
  suggestedAccommodation?: HotelType | HotelType[] | null;
  suggestedTransfer?: TransferType | TransferType[] | null;
  suggestedMeal?: MealType | MealType[] | null;
  suggestedActivity?: ActivityType | ActivityType[] | null;

  itinerary?: ItineraryType | null;
  basicReq?: BasicRequirements | null;
  accommodationReq?: AccommodationRequirements | null;
  transferReq?: TransferRequirements | null;
  mealReq?: MealRequirements | null;
  activityReq?: ActivityRequirements | null;
};

// Types for different recommendation entities
type TransferType = {
  id: string;
  name: string;
  description: string;
  image: string;
  type: string;
  price: number;
  features: string[];
};

type MealType = {
  id: string;
  name: string;
  description: string;
  image: string;
  cuisine: string;
  price: number;
  dietaryOptions: string[];
};

type ActivityType = {
  id: string;
  title: string;
  short_desc: string;
  image: string;
  payment_type: string;
  tour_duration: string;
  starting_price: number;
  features: string[];
};

type HotelType = {
  id: string;
  name: string;
  description: string;
  image: string;
  brand: string;
  bedType: string;
  starRating: number;
  price: number;
  location: string;
  amenities: string[];
};

type ItineraryType = {
  destination: string;
  duration: string;
  days: ItineraryDayType[];
};

type ItineraryDayType = {
  day: number;
  date: string;
  activities: ItineraryActivityType[];
  meals: ItineraryMealType[];
  accommodation: string;
};

type ItineraryActivityType = {
  time: string;
  description: string;
  location: string;
  type: "sightseeing" | "adventure" | "cultural" | "relaxation" | "transfer";
};

type ItineraryMealType = {
  time: string;
  type: "breakfast" | "lunch" | "dinner";
  location: string;
  description: string;
};

// Requirement types
type BasicRequirements = {
  required: boolean;
  origin: string | null;
  destination: string | null;
  duration: string | null;
  paxComposition: string | null;
};

type AccommodationRequirements = {
  required: boolean;
  preferred_location: string | null;
  brand: string | null;
  star: number | null;
  bed_type: string | null;
  breakfast_included: boolean | null;
};

type TransferRequirements = {
  required: boolean;
  type: string | null;
  private_transfer: boolean | null;
};

type MealRequirements = {
  required: boolean;
  included_meals: string | null;
  dietary_restrictions: string | null;
  cuisine_preference: string | null;
};

type ActivityRequirements = {
  required: boolean;
  activity_level: string | null;
  preferred_activities: string[] | null;
  guided_tours: boolean | null;
};

// Initial welcome message in API response format
const initialApiResponse: ApiResponse = {
  message:
    "Hi! I’m Teressa. I’ll help you to plan your perfect trip to Singapore.",
  options: null, // No initial options, let the user start with free text
  type: "general",
  suggestedAccommodation: null,
  suggestedTransfer: null,
  suggestedMeal: null,
  suggestedActivity: null,
  itinerary: null,
  products: null,
  vehicles: null,
  transferInfo: null,
  basicReq: {
    required: true,
    origin: null,
    destination: null,
    duration: null,
    paxComposition: null,
  },
  accommodationReq: {
    required: false,
    preferred_location: null,
    brand: null,
    star: null,
    bed_type: null,
    breakfast_included: null,
  },
  transferReq: {
    required: false,
    type: null,
    private_transfer: null,
  },
  mealReq: {
    required: false,
    included_meals: null,
    dietary_restrictions: null,
    cuisine_preference: null,
  },
  activityReq: {
    required: false,
    activity_level: null,
    preferred_activities: null,
    guided_tours: null,
  },
};

function processChatLogs(chatLogs: any[]): {
  messages: MessageType[];
  transformedServices: {
    accommodation: any[];
    transfers: any[];
    meals: any[]; // Placeholder for future use
    activities: any[];
  };
} {
  const messages: MessageType[] = [];

  let transformedServices = {
    accommodation: [],
    transfers: [],
    meals: [],
    activities: [],
  };

  // Default AI greeting
  messages.push(
    {
      id: "default-ai-greeting",
      content:
        "Hi! I’m Teressa. I’ll help you to plan your perfect trip to Singapore.",
      sender: "ai",
      options: [],
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    {
      id: "default-ai-greeting-2",
      content:
        "",
      sender: "ai",
      options: ["Plan a 4-day trip for a couple from India", "A trip for a family of 4 from Dubai, Halal-friendly please", "We're from Europe and on a honeymoon trip, suggest something exciting!"],
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  );

  console.log("chatLogs..", chatLogs)

  // Normalize chatLogs to an array
  const logs =
  Array.isArray(chatLogs)
    ? chatLogs
    : (Array.isArray((chatLogs as any).logs) ? (chatLogs as any).logs : []);

  console.log("logs..", logs)

  logs.forEach((log: any) => {
    // User message
    if(log.user_message) {
      messages.push({
        id: `${log.id}-user`,
        content: log.user_message,
        sender: "user",
        timestamp: new Date(log.request_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }


    // System/AI message
    let response: any = {};
    try {
      response = JSON.parse(log.system_response);
    } catch (e) {
      console.error("Invalid system_response JSON in log:", log.id, e);
      return;
    }

    if(response && response.message && response.message != "") {
      messages.push({
        id: `${log.id}-ai`,
        content: response.message ?? "",
        sender: "ai",
        timestamp: new Date(log.response_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        options: response.options ?? null,
        suggestedAccommodation: null,
        suggestedTransfer: null,
        suggestedMeal: null,
        products: response.products ?? null,
        vehicles: response.vehicles ?? null,
        transferInfo: response.transferInfo ?? null,
        suggestedActivity: response.suggestedActivity ?? null,
        itinerary: response.itinerary ?? null,
        basicReq: response.basicReq ?? null,
        accommodationReq: response.accommodationReq ?? null,
        transferReq: response.transferReq ?? null,
        mealReq: response.mealReq ?? null,
        activityReq: response.activityReq ?? null,
      });
    } else {
      return;
    }

    // Update transformedServices ONLY from this latest response
    const selected = response.selectedServices || {};
    transformedServices = {
      accommodation: selected.Accommodations || [],
      transfers: selected.Transfers || [],
      meals: selected.Meal || [], // Add meals if needed later
      activities: selected["Day Tours"] || [],
    };
  });

  return {
    messages,
    transformedServices,
  };
}


export default function TravelPlannerChat() {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      content: initialApiResponse.message,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      options: initialApiResponse.options,
      basicReq: initialApiResponse.basicReq,
      accommodationReq: initialApiResponse.accommodationReq,
      transferReq: initialApiResponse.transferReq,
      mealReq: initialApiResponse.mealReq,
      activityReq: initialApiResponse.activityReq,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("general");
  const [currentResponder, setCurrentResponder] = useState<
    "ai" | "human-agent"
  >("ai");
  const [isHumanRequested, setIsHumanRequested] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState({});
  const [itinerary, setItinerary] = useState({});

  // Inside your component:
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await getOrCreateUserId();
      // console.log("User ID - called:", storedUserId);
      setUserId(storedUserId);
    };

    fetchUserId();
  }, []);

  const { socketId, newMessage, suggestedActivity } = usePusher(userId);

  useEffect(() => {
    if (newMessage) {
      const messageToAdd: MessageType = {
        id: Date.now().toString(),
        content: newMessage,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        suggestedActivity: suggestedActivity || null,
      };

      // Play sound
      const audio = new Audio('/sent.wav');
      audio.play().catch((e) => console.error("Audio play failed", e));

      setMessages((prevMessages) => [...prevMessages, messageToAdd]);
    }
  }, [newMessage, suggestedActivity]);

  useEffect(() => {
    // Need to use setTimeout to ensure the DOM has updated
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }, [messages, isTyping]);

  useEffect(() => {
    console.log("Drawer received selectedServices:", selectedServices);
  }, [selectedServices]);  

  // Get the latest requirements from the last message
  const getLatestRequirements = () => {
    const lastMessage = messages[messages.length - 1];
    console.log("lastMessage..", lastMessage)
    return {
      basicReq: lastMessage.basicReq || initialApiResponse.basicReq,
      accommodationReq:
        lastMessage.accommodationReq || initialApiResponse.accommodationReq,
      transferReq: lastMessage.transferReq || initialApiResponse.transferReq,
      mealReq: lastMessage.mealReq || initialApiResponse.mealReq,
      activityReq: lastMessage.activityReq || initialApiResponse.mealReq,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      // ✅ Fetch chat logs
      try {
        const res = await fetch(`https://ai.airporttransfers.ai/chat-logs/${userId}`);
        if (!res.ok) throw new Error(`Chat logs fetch failed: ${res.status}`);
        const chatLogs = await res.json();

        const { messages, transformedServices } = processChatLogs(chatLogs);

        console.log("Processed messages:", messages);

        setMessages(messages);
        setSelectedServices(transformedServices);
      } catch (err) {
        console.error("Failed to load chat logs:", err);
        setMessages([]); // safe fallback
        setSelectedServices({});
      }

      // ✅ Fetch user itinerary
      try {
        const itineraryRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-user-itinerary-grouped/${userId}`
        );
        if (!itineraryRes.ok) throw new Error(`Itinerary fetch failed: ${itineraryRes.status}`);
        const itinerary = await itineraryRes.json();

        console.log("Fetched Itinerary:", itinerary);

        setItinerary(itinerary && typeof itinerary === "object" ? itinerary : {});
        console.log("User Itinerary:", itinerary);
      } catch (err) {
        console.error("Failed to load itinerary:", err);
        setItinerary({}); // safe fallback
      }
    };

    fetchData();
  }, [userId]);


  if (!userId) return null; // Prevent SSR issues

  // Mock user ID - in a real app, this would come from authentication
  //const userId = "USER12345"

  // Calculate progress percentages
  const calculateProgress = () => {
    const requirements = getLatestRequirements();

    // Calculate basic progress
    const basicFields = Object.entries(requirements.basicReq)
      .filter(([key]) => key !== "required")
      .filter(([_, value]) => value !== null).length;
    const basicTotal = Object.keys(requirements.basicReq).length - 1; // Subtract 'required'
    const basicProgress = (basicFields / basicTotal) * 100;

    // Calculate accommodation progress
    let accommodationProgress = 0;
    if (requirements.accommodationReq.required) {
      const accommodationFields = Object.entries(requirements.accommodationReq)
        .filter(([key]) => key !== "required")
        .filter(([_, value]) => value !== null).length;
      const accommodationTotal =
        Object.keys(requirements.accommodationReq).length - 1; // Subtract 'required'
      accommodationProgress = (accommodationFields / accommodationTotal) * 100;
    } else {
      accommodationProgress = 100; // Not required, so 100% complete
    }

    // Calculate transfer progress
    let transferProgress = 0;
    if (requirements.transferReq.required) {
      const transferFields = Object.entries(requirements.transferReq)
        .filter(([key]) => key !== "required")
        .filter(([_, value]) => value !== null).length;
      const transferTotal = Object.keys(requirements.transferReq).length - 1; // Subtract 'required'
      transferProgress = (transferFields / transferTotal) * 100;
    } else {
      transferProgress = 100; // Not required, so 100% complete
    }

    // Calculate meals progress
    let mealsProgress = 0;
    if (requirements.mealReq.required) {
      const mealsFields = Object.entries(requirements.mealReq)
        .filter(([key]) => key !== "required")
        .filter(([_, value]) => value !== null).length;
      const mealsTotal = Object.keys(requirements.mealReq).length - 1; // Subtract 'required'
      mealsProgress = (mealsFields / mealsTotal) * 100;
    } else {
      mealsProgress = 100; // Not required, so 100% complete
    }

    // Calculate activities progress
    let activitiesProgress = 0;
    if (requirements.activityReq.required) {
      const activitiesFields = Object.entries(requirements.activityReq)
        .filter(([key]) => key !== "required")
        .filter(([_, value]) => value !== null).length;
      const activitiesTotal = Object.keys(requirements.activityReq).length - 1; // Subtract 'required'
      activitiesProgress = (activitiesFields / activitiesTotal) * 100;
    } else {
      activitiesProgress = 100; // Not required, so 100% complete
    }

    return {
      basic: basicProgress,
      accommodation: accommodationProgress,
      transfer: transferProgress,
      meals: mealsProgress,
      activities: activitiesProgress,
    };
  };

  // Function to handle both option selection and text input
  const handleUserMessage = async (messageContent: string) => {
    if (!userId || !messageContent.trim()) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue(""); // Clear input if it's a text message

    try {

      // Ensure AI ChatBot is Active
      const isAIActive = await ensureChatbotIsActive(userId);
      console.log("checkAIStatus", isAIActive);

      const isChatbotInactive = isAIActive?.result === false;

      // First check — before calling API
      if (isChatbotInactive) {
        //setCurrentResponder("human-agent");
        setIsTyping(false);
      } else {
        //setCurrentResponder("ai");
        setIsTyping(true);
      }

      // Call the API
      const apiResponse = await fetchChatApi(userId, messageContent, socketId ?? undefined);
      const response = apiResponse.response;

      // Second check — after API call
      if (isChatbotInactive) {
        return;
      }

      // Create AI response message
      const aiMessage: MessageType = {
        id: Date.now().toString(),
        content: response.message,
        sender: currentResponder,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        options: response.options,

        // ✅ Ensure only a single object is stored
        suggestedAccommodation: null,
        suggestedTransfer: null,
        suggestedMeal: null,
        suggestedActivity: null,

        products: response.products,
        vehicles: response.vehicles,
        transferInfo: response.transferInfo,

        itinerary: response.itinerary,
        basicReq: response.basicReq,
        accommodationReq: response.accommodationReq,
        transferReq: response.transferReq,
        mealReq: response.mealReq,
        activityReq: response.activityReq,
      };

      if (response.vehicles) {
        console.log("Vehicles received:", response.vehicles);
      }
      setMessages((prev) => [...prev, aiMessage]);
      console.log("Before Transform", )
      // Transform the data to match your component structure
      const transformedServices = {
        accommodation: response.selectedServices?.Accommodations || [],
        transfers: response.selectedServices?.Transfers || [],
        meals: response.selectedServices?.Meal || [], // Add if you have meals data
        activities: response.selectedServices?.["Day Tours"] || []
      };      
      
      // Log for debugging
      //console.log("Transformed services:", transformedServices);
      
      // Update the state
      setSelectedServices(transformedServices);

      try {
        // ✅ Fetch user itinerary
        const itineraryRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-user-itinerary-grouped/${userId}`
        );

        if (!itineraryRes.ok) {
          throw new Error(`Failed to fetch itinerary: ${itineraryRes.status}`);
        }

        const itinerary = await itineraryRes.json();

        console.log("Fetched Itinerary:", itinerary);

        // Handle null or non-array responses safely
        setItinerary(itinerary && typeof itinerary === "object" ? itinerary : {});
      } catch (err) {
        console.error("Error fetching itinerary:", err);
        setItinerary({}); // fallback so UI doesn’t break
      }


      // Play sound
      const audioSent = new Audio('/sent.wav');
      audioSent.play().catch((e) => console.error("Audio play failed", e));

    } catch (error) {
      // Handle API error
      const errorMessage: MessageType = {
        id: Date.now().toString(),
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        sender: currentResponder,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
      console.error("API call error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to handle option selection
  const handleOptionSelect = async (messageId: string, option: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, selectedOption: option } : msg
      )
    );

    // Get the last AI message before the user's selection
    const lastAiMessage = [...messages]
      .reverse()
      .find((msg) => msg.sender === currentResponder);

    // Format message as "Question: {Option}"
    const formattedMessage = lastAiMessage
      ? `${lastAiMessage.content}: ${option}`
      : option; // Fallback to just the option if no AI message is found

    // Call the common function with the formatted message
    handleUserMessage(formattedMessage);
  };

  // Function to handle text input submission
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    handleUserMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to handle selection of a specific accommodation
  const handleAccommodationSelect = async (hotelId: string) => {
    const selectedHotel = sampleHotels.find((hotel) => hotel.id === hotelId);

    if (selectedHotel) {
      const userMessage: MessageType = {
        id: Date.now().toString(),
        content: `I'm interested in ${selectedHotel.name}`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Simulate API response after hotel selection
      setTimeout(() => {
        const aiResponse: MessageType = {
          id: Date.now().toString(),
          content: `Great choice! ${selectedHotel.name} is an excellent option. I've noted your preference.`,
          sender: currentResponder,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          options: ["Continue with planning"],
          // Preserve the latest requirements
          ...getLatestRequirements(),
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Function to handle selection of a specific transfer option
  const handleTransferSelect = async (transferId: string) => {
    const selectedTransfer = sampleTransfers.find(
      (transfer) => transfer.id === transferId
    );

    if (selectedTransfer) {
      const userMessage: MessageType = {
        id: Date.now().toString(),
        content: `I'd like to choose the ${selectedTransfer.name} transfer option`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Simulate API response after transfer selection
      setTimeout(() => {
        const aiResponse: MessageType = {
          id: Date.now().toString(),
          content: `Excellent choice! The ${selectedTransfer.name} will provide a comfortable journey. I've noted your preference.`,
          sender: currentResponder,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          options: ["Continue with planning"],
          // Preserve the latest requirements
          ...getLatestRequirements(),
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Function to handle selection of a specific meal option
  const handleMealSelect = async (mealId: string) => {
    const selectedMeal = sampleMeals.find((meal) => meal.id === mealId);

    if (selectedMeal) {
      const userMessage: MessageType = {
        id: Date.now().toString(),
        content: `I'd like to choose the ${selectedMeal.name} meal package`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Simulate API response after meal selection
      setTimeout(() => {
        const aiResponse: MessageType = {
          id: Date.now().toString(),
          content: `Great choice! The ${selectedMeal.name} includes a variety of options to suit your preferences. I've added this to your plan.`,
          sender: currentResponder,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          options: ["Continue with planning"],
          // Preserve the latest requirements
          ...getLatestRequirements(),
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Function to handle selection of a specific activity
  const handleActivitySelect = async (activityId: string) => {
    const selectedActivity = sampleActivities.find(
      (activity) => activity.id === activityId
    );

    if (selectedActivity) {
      const userMessage: MessageType = {
        id: Date.now().toString(),
        content: `I'm interested in the ${selectedActivity.title} activity`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Simulate API response after activity selection
      setTimeout(() => {
        const aiResponse: MessageType = {
          id: Date.now().toString(),
          content: `Excellent choice! The ${selectedActivity.title} will be a highlight of your trip. I've added this to your itinerary.`,
          sender: currentResponder,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          options: ["Create final itinerary"],
          // Preserve the latest requirements
          ...getLatestRequirements(),
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const TypingText = () => {
  const messages = [
    "AI is analyzing your request...",
    "Processing with best solution...",
    "Formulating response...",
    "Thinking..."
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 6000); // change every 6s
    return () => clearInterval(interval);
  }, []);

  return messages[index];
};


  // Function to handle switching to human support
  const handleSwitchToHuman = () => {
    setIsHumanRequested(true);
    setIsTyping(true);

    // Simulate connecting to a human agent
    setTimeout(() => {
      const systemMessage: MessageType = {
        id: Date.now().toString(),
        content: "Connecting you to a human agent...",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        // Preserve the latest requirements
        ...getLatestRequirements(),
      };

      setMessages((prev) => [...prev, systemMessage]);

      // Simulate human agent joining after a delay
      setTimeout(() => {
        const humanMessage: MessageType = {
          id: Date.now().toString(),
          content:
            "Hello! I'm Sarah, a travel specialist. I can see you've been planning a trip. How can I assist you further today?",
          sender: "human-agent",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          // Preserve the latest requirements
        };

        setMessages((prev) => [...prev, humanMessage]);
        setCurrentResponder("human-agent");
        setIsTyping(false);
      }, 2000);
    }, 1000);
  };

  // Function to handle switching back to AI
  const handleSwitchToAI = () => {
    setIsTyping(true);

    setTimeout(() => {
      const systemMessage: MessageType = {
        id: Date.now().toString(),
        content: "Switching back to AI assistant...",
        sender: "human-agent",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        // Preserve the latest requirements
      };

      setMessages((prev) => [...prev, systemMessage]);

      setTimeout(() => {
        const aiMessage: MessageType = {
          id: Date.now().toString(),
          content:
            "I'm back! Your AI travel assistant is here to continue helping you. What would you like to do next?",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          // Preserve the latest requirements
        };

        setMessages((prev) => [...prev, aiMessage]);
        setCurrentResponder("ai");
        setIsHumanRequested(false);
        setIsTyping(false);
      }, 1000);
    }, 1000);
  };

  // Update sidebar state when screen size changes
  // if (isMobile) {
  //   useEffect(() => {
  //     setSidebarOpen(!isMobile);
  //   }, [isMobile]);
  // }

  // Calculate progress
  const progress = calculateProgress();

  // Get the latest requirements for the sidebar
  const latestRequirements = getLatestRequirements();

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      <SidebarProvider defaultOpen={!isMobile}>
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 w-full overflow-hidden max-w-full flex-grow">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#CC9A55] h-16 bg-black shadow-sm">
            <div className="flex items-center gap-3">
              {/* Make sure the sidebar trigger is visible on mobile */}
              {/* <SidebarTrigger className="md:hidden" /> */}
  
              <div className="flex items-center">
                <Avatar className="h-10 w-10 text-white">
                  <AvatarImage
                    src="/ai.png"
                    alt="AI Assistant"
                  />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <div className="ml-3">
                    <h3 className="font-semibold text-white">Travel Assistant</h3>
                    <p className="text-xs text-[#CC9A55]">
                      Plan your perfect trip
                    </p>
                  </div>
                )}
              </div>
            </div>
  
            {/* Current Responder Badge */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={
                      currentResponder === "ai" ? "secondary" : "default"
                    }
                    className={cn(
                      "flex items-center gap-1 transition-all",
                      currentResponder === "ai"
                        ? "bg-[#CC9A55] text-white hover:bg-[#B8894A]"
                        : "bg-white text-black hover:bg-gray-100"
                    )}
                  >
                    {currentResponder === "ai" ? (
                      <>
                        <Bot className="h-3 w-3" />
                        <span>AI Responding</span>
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3" />
                        <span>Human Agent</span>
                      </>
                    )}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {currentResponder === "ai"
                    ? "You are currently talking to an AI assistant"
                    : "You are currently talking to a human agent"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
  
          {/* Chat Area */}
          <ScrollArea className="flex-1 p-4 w-full">
            <div className="space-y-6 w-full max-w-5xl mx-auto" ref={scrollAreaRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex animate-in fade-in-0 slide-in-from-bottom-3 duration-500",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-end gap-3",
                      message.suggestedAccommodation || message.itinerary
                        ? "max-w-full w-full"
                        : "max-w-[85%]"
                    )}
                  >
                    {message.sender !== "user" && (
                      <Avatar
                        className={cn(
                          "h-8 w-8 rounded-full",
                          message.sender === "ai"
                            ? ""
                            : "bg-gradient-to-br from-blue-500 to-cyan-500"
                        )}
                      >
                        {message.sender === "ai" ? (
                          <>
                            <AvatarImage
                              src="/ai.png"
                              alt="AI Assistant"
                            />
                            <AvatarFallback>AI</AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage
                              src="/ai.png"
                              alt="Human Agent"
                            />
                            <AvatarFallback>HA</AvatarFallback>
                          </>
                        )}
                      </Avatar>
                    )}
                    <Card
                      className={cn(
                        "px-4 py-3 shadow-sm border-0",
                        message.sender === "user"
                          ? "bg-[#CC9A55] text-white"
                          : message.sender === "ai"
                          ? "bg-gray-800 text-white border-[#CC9A55]"
                          : "bg-[#CC9A55] text-white border-[#B8894A]",
                        message.suggestedAccommodation || message.itinerary
                          ? "w-full"
                          : "",
                        message.sender === "user"
                          ? "rounded-tr-none"
                          : "rounded-tl-none"
                      )}
                    >
                      {/* Sender indicator for human agent */}
                      {message.sender === "human-agent" && (
                        <div className="flex items-center gap-1 mb-1">
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0 text-white border-white"
                          >
                            Human Agent
                          </Badge>
                        </div>
                      )}
  
                      <div className={cn(
                        "prose leading-relaxed",
                        message.sender === "ai" ? "prose-invert text-white" : ""
                      )}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>

                      {/* Products */}
                      {message.products && (
                        <div className="mt-6 w-full">
                          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                            <ProductList
                              products={message.products}
                              onSelect={(id: number|string) => {
                                const url = `/day-tours/details/${id}`;
                                window.open(url, "_blank");
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {/* Vehicles */}
                      {message.vehicles && (
                        <div className="mt-6 w-full">
                          <VehicleList
                            vehicles={message.vehicles}
                            transferInfo={message.transferInfo}  
                          />
                        </div>
                      )}

  
                      {/* Hotel Recommendation */}
                      {message.suggestedAccommodation && (
                        <div className="mt-6 w-full">
                          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                            <HotelCard
                              hotel={message.suggestedAccommodation}
                              onSelect={() =>
                                handleAccommodationSelect(
                                  message.suggestedAccommodation!.id
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
  
                      {/* Transfer Recommendation */}
                      {message.suggestedTransfer && (
                        <div className="mt-6 w-full">
                          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                            <TransferCard
                              transfer={message.suggestedTransfer}
                              onSelect={() =>
                                handleTransferSelect(
                                  message.suggestedTransfer!.id
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
  
                      {/* Meal Recommendations */}
                      {message.suggestedMeal && message.suggestedMeal.length > 0 && (
                        <div className="mt-6 w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {message.suggestedMeal.map((meal: MealType) => (
                              <MealCard
                                key={meal.id}
                                meal={meal}
                                onSelect={() => handleMealSelect(meal.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
  
                      {/* Activity Recommendations */}
                      {message.suggestedActivity && message.suggestedActivity.length > 0 && (
                        <div className="mt-6 w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {message.suggestedActivity.map((activity: ActivityType) => (
                              <ActivityCard
                                key={activity.id}
                                activity={activity}
                                onSelect={() => handleActivitySelect(activity.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
  
                      {/* Itinerary Display */}
                      {message.itinerary && (
                        <div className="mt-6 w-full">
                          <ItineraryDisplay itinerary={message.itinerary} />
                        </div>
                      )}
  
                      {/* Options */}
                      {message.options &&
                        !message.selectedOption &&
                        message.options.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {message.options.map((option, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left transition-all border-[#CC9A55] text-white bg-gray-800",
                                  "hover:bg-[#CC9A55] hover:text-white hover:border-[#B8894A]"
                                )}
                                onClick={() =>
                                  handleOptionSelect(message.id, option)
                                }
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        )}
  
                      <p
                        className={cn(
                          "text-xs mt-2",
                          message.sender === "user"
                            ? "text-white/70"
                            : message.sender === "human-agent"
                            ? "text-white/70"
                            : "text-white/70"
                        )}
                      >
                        {message.timestamp}
                      </p>
                    </Card>
                  </div>
                </div>
              ))}
  
              {isTyping && (
                <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-3">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-end gap-3">
                      <Avatar
                        className={cn(
                          "h-8 w-8 rounded-full",
                          currentResponder === "ai"
                            ? ""
                            : "bg-[#CC9A55]"
                        )}
                      >
                        {currentResponder === "ai" ? (
                          <>
                            <AvatarImage src="/ai.png" alt="AI Assistant" />
                            <AvatarFallback>AI</AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src="/ai.png" alt="Human Agent" />
                            <AvatarFallback>HA</AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <Card
                        className={cn(
                          "px-3 py-2 shadow-md border-0 rounded-tl-lg rounded-tr-lg",
                          currentResponder === "ai"
                            ? "bg-gray-800 border-[#CC9A55]"
                            : "bg-[#CC9A55] border-[#B8894A]"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full animate-bounce"
                    style={{
                      animationDelay: `${-0.15 * i}s`,
                      background: "linear-gradient(135deg, #3b82f6, #06b6d4, #8b5cf6)",
                    }}
                  ></div>
                ))}
              </div>

                      </Card>
                    </div>

                    {/* Cycling text */}
                    <span className="mt-1 text-sm text-white font-medium bg-[#CC9A55] px-2 py-1 rounded-md shadow-sm animate-fade-in">
                      <TypingText />
                    </span>
                  </div>
                </div>
              )}


              <div ref={messagesEndRef} style={{ height: '1px', opacity: 0 }} />
            </div>
          </ScrollArea>
  
          <NewChatButton />
  
          {/* Input Area */}
          <div className="p-4 border-t border-[#CC9A55] bg-black">
            <div className="flex items-center gap-2 max-w-5xl mx-auto">
              <div className="relative flex-1 flex items-center">
                <textarea
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here. Press Enter or click Send"
                  className="w-full resize-none rounded-md border border-[#CC9A55] bg-gray-800 text-white placeholder-gray-400 px-4 py-2 pr-12 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC9A55] transition-all"
                />
                <div className="absolute right-2 inset-y-0 flex items-center pointer-events-none">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    size="sm"
                    className="pointer-events-auto"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
  
      {/* Floating Itinerary Button - Made more prominent */}
      <div className="fixed right-6 z-50 bottom-24"> {/* Changed to bottom-24 (6rem) */}
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
      <Button
  onClick={() => setIsDrawerOpen((prev) => !prev)}
  className={cn(
    "rounded-full shadow-xl bg-[#CC9A55] hover:bg-[#B8894A] transition-all",
    "flex items-center justify-center h-12 w-12 sm:w-auto sm:px-4",
    "border-2 border-white/80",
    "hover:scale-105 active:scale-95"
  )}
  size="icon"
>
  <Calendar className="h-5 w-5 text-white" />
  <span className="hidden sm:inline ml-2 text-white font-medium text-sm">
    Itinerary
  </span>
</Button>

      </TooltipTrigger>
      <TooltipContent side="left" className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span>View your itinerary</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
  
      {/* Drawer Component */}
      <ItineraryDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        onOpen={() => setIsDrawerOpen(true)}
        isDesktop={true} 
        selectedServices={selectedServices}
        itinerary={itinerary}
      />
    </div>
  );
}

// Component for rendering transfer card
const TransferCard = ({
  transfer,
  onSelect,
}: {
  transfer: TransferType;
  onSelect: () => void;
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-0 shadow-md group bg-gray-800">
      <div className="flex flex-col h-full">
        {/* Transfer Image */}
        <div className="h-40 w-full relative overflow-hidden">
          <img
            src={transfer.image || "/placeholder.svg"}
            alt={transfer.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-[#CC9A55] text-white border-0 shadow-md backdrop-blur-sm">
              <DollarSign className="h-3.5 w-3.5 mr-0.5 text-white" />
              {transfer.price}
            </Badge>
          </div>
        </div>

        {/* Transfer Details */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-semibold line-clamp-1 text-white">
                {transfer.name}
              </h3>
              <div className="flex items-center gap-0.5 mt-1">
                <Car className="h-3.5 w-3.5 text-[#CC9A55]" />
                <span className="text-xs text-white">
                  {transfer.type}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-white line-clamp-2">
            {transfer.description}
          </p>

          <div className="flex flex-wrap gap-1 mt-3">
            {transfer.features.slice(0, 3).map((feature, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-1.5 py-0 bg-[#CC9A55] text-white border-[#CC9A55]"
              >
                {feature}
              </Badge>
            ))}
            {transfer.features.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0 bg-[#CC9A55] text-white border-[#CC9A55]"
              >
                +{transfer.features.length - 3} more
              </Badge>
            )}
          </div>

          {/* <div className="mt-auto pt-3">
            <Button
              onClick={onSelect}
              size="sm"
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-md transition-all"
            >
              Select
            </Button>
          </div> */}
        </div>
      </div>
    </Card>
  );
};

const MealCard = ({
  meal,
  onSelect,
}: {
  meal: MealType;
  onSelect: () => void;
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-0 shadow-md group bg-gray-800">
      <div className="flex flex-col h-full">
        {/* Meal Image */}
        <div className="h-40 w-full relative overflow-hidden">
          <img
            src={meal.image || "/placeholder.svg"}
            alt={meal.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-[#CC9A55] text-white border-0 shadow-md backdrop-blur-sm">
              <DollarSign className="h-3.5 w-3.5 mr-0.5 text-white" />
              {meal.price}
            </Badge>
          </div>
        </div>

        {/* Meal Details */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-semibold line-clamp-1 text-white">
                {meal.name}
              </h3>
              {/* <div className="flex items-center gap-0.5 mt-1">
                <Utensils className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {meal.cuisine}
                </span>
              </div> */}
            </div>
          </div>

          <p className="mt-2 text-xs text-white line-clamp-2">
            {meal.description}
          </p>

          {/* <div className="flex flex-wrap gap-1 mt-3">
            {meal.dietaryOptions.slice(0, 3).map((option, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-1.5 py-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              >
                {option}
              </Badge>
            ))}
            {meal.dietaryOptions.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              >
                +{meal.dietaryOptions.length - 3} more
              </Badge>
            )}
          </div> */}

          {/* <div className="mt-auto pt-3">
            <Button
              onClick={onSelect}
              size="sm"
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-md transition-all"
            >
              Select
            </Button>
          </div> */}
        </div>
      </div>
    </Card>
  );
};

const ActivityCard = ({
  activity,
  onSelect,
}: {
  activity: ActivityType;
  onSelect: () => void;
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-0 shadow-md group bg-gray-800">
      <div className="flex flex-col h-full">
        {/* Activity Image */}
        <div className="h-40 w-full relative overflow-hidden">
          <img
            src={activity.image || "/placeholder.svg"}
            alt={activity.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* <div className="absolute top-2 right-2">
            <Badge className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border-0 shadow-md backdrop-blur-sm">
              <DollarSign className="h-3.5 w-3.5 mr-0.5 text-emerald-600 dark:text-emerald-400" />
              {activity.price}
            </Badge>
          </div> */}
        </div>

        {/* Activity Details */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-semibold line-clamp-1 text-white">
                {activity.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  <Camera className="h-3.5 w-3.5 text-[#CC9A55]" />
                  <span className="text-xs text-white">
                    {activity.payment_type}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Clock className="h-3.5 w-3.5 text-[#CC9A55]" />
                  <span className="text-xs text-white">
                    {activity.tour_duration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-white line-clamp-2">
            {activity.short_desc}
          </p>

          {/*<div className="flex flex-wrap gap-1 mt-3">
            {activity.features.slice(0, 3).map((feature, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-1.5 py-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              >
                {feature}
              </Badge>
            ))}
            {activity.features.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              >
                +{activity.features.length - 3} more
              </Badge>
            )}
          </div> */}

          <div className="mt-auto pt-3">
            <Button
            onClick={() =>
              window.open(
                `https://www.airporttransfers.ai/product/${encodeURIComponent(activity.id)}`,
                '_blank'
              )
            }
            size="sm"
            className="w-full bg-[#CC9A55] hover:bg-[#B8894A] text-white shadow-md transition-all"
          >
            View Details
          </Button>

          </div>
        </div>
      </div>
    </Card>
  );
};
