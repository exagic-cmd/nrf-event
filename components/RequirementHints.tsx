import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface HintItem {
  type: string;
  example: string;
}

const RequirementHints: React.FC = () => {
  const hints: HintItem[] = [
    { type: "Accommodation", example: "Update bed type to king" },
    { type: "Transfer", example: "Add private car" },
    { type: "Basic Requirements", example: "Change my duration to 3 days" },
    { type: "Meal", example: "Add halal food" },
    { type: "Activity", example: "Add some adventure activities" }
  ];
  
  return (
    <div className="max-w-5xl mx-auto mb-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-sm">
            <span className="mr-1">💡</span> Tips for best results
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-100">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">For best results, always start with a requirement type:</h4>
            <div className="space-y-2">
              {hints.map((hint, index) => (
                <div key={index} className="flex flex-col">
                  <span className="font-medium text-blue-600 dark:text-blue-400">{hint.type}:</span>
                  <span className="text-slate-600 dark:text-slate-300 text-sm italic">{hint.type}: {hint.example}</span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RequirementHints;