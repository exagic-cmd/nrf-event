"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
export default function MelvinChatStrap() {
  const { localizedPush } = useLocalizedRouter();
  const [isLoading, setIsLoading] = useState(false);

const handleAskAI = async () => {
  setIsLoading(true);
  setTimeout(() => {
    localizedPush("/day-tours/chatAI");
  }, 1500); 
};


  return (
    <div className="flex items-center gap-1 md:gap-4 bg-white/20 backdrop-blur-md text-white w-full rounded-full px-2 py-1 shadow-lg">
      <p className="text-sm sm:text-[12px] ml-1 md:ml-4">Your AI travel Assistant.</p>

      <button
        onClick={handleAskAI}
        disabled={isLoading}
        className="bg-white text-[#FE6F4F] lg:text-lg md:text-md sm:text-xs font-semibold px-2 py-1 md:px-4 md:py-2 rounded-full flex items-center gap-2 md:hover:scale-105 transition-all duration-300 shadow-md"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#FE6F4F]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          <>
           Ask Teressa!
            <img
              src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1751621393/External%20Links/robot.gif"
              alt="AI assistant"
              className="w-10 h-10 rounded-full animate-pop-bounce"
            />
          </>
        )}
      </button>
    </div>
  );
}
