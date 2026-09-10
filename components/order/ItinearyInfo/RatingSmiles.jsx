// components/RatingSmiles.js
import React from 'react';
import { Heart, ThumbsUp, Meh, Frown, Smile } from 'lucide-react';

const RatingSmiles = ({ rating, onRate, label }) => {
  const smiles = [
    { icon: Frown, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
    { icon: Meh, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
    { icon: Smile, color: 'text-accent-foreground', bg: 'bg-accent', border: 'border-border' },
    { icon: ThumbsUp, color: 'text-secondary-foreground', bg: 'bg-secondary', border: 'border-border' },
    { icon: Heart, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-base sm:text-lg font-semibold text-foreground">{label}</label>
      <div className="flex gap-3 overflow-x-auto pb-10 md:pb-14 sm:justify-between sm:overflow-visible sm:pb-0">
        {smiles.map((smile, index) => {
          const IconComponent = smile.icon;
          const isSelected = rating === index + 1;
          return (
            <button
              key={index}
              onClick={() => onRate(index + 1)}
              className={`flex-shrink-0 w-20 sm:flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                isSelected 
                  ? `${smile.bg} ${smile.border} ${smile.color} shadow-lg scale-105` 
                      : 'bg-muted border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              <IconComponent size={28} className="mx-auto mb-1 sm:mb-2" />
              <div className="text-xs font-medium ">{index + 1}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RatingSmiles;