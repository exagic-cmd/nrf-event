import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, RotateCcw } from 'lucide-react';

const NewChatButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmNewChat = () => {
    setIsProcessing(true);

    // Remove userId from localStorage
    localStorage.removeItem('userId');

    // Refresh the page
    window.location.reload();
  };

  return (
    <div className="max-w-5xl mx-auto mb-3">
      <Popover open={showConfirm} onOpenChange={setShowConfirm}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-sm border-[#CC9A55] text-white bg-secondary hover:bg-brand-secondary hover:text-white"
          >
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            Start a new chat
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-black border border-[#CC9A55] text-white">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center text-white">
                <MessageSquarePlus className="w-4 h-4 mr-2 text-[#CC9A55]" />
                Start a new chat?
              </h4>
              <p className="text-sm text-slate-300">
                This will clear your current session and start fresh. Your conversation history will be lost.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={isProcessing}
                className="border-[#CC9A55] text-white bg-transparent hover:bg-brand-secondary/10 focus-visible:ring-[#CC9A55]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmNewChat}
                disabled={isProcessing}
                className="bg-brand-secondary hover:bg-[#B8894A] text-white"
              >
                {isProcessing ? (
                  <>
                    <RotateCcw className="w-3 h-3 mr-1 animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Start New Chat'
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NewChatButton;