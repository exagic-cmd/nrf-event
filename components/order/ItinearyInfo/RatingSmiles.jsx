// components/RatingSmiles.js
import React from 'react';
import { Heart, ThumbsUp, Meh, Frown, Smile } from 'lucide-react';

const RatingSmiles = ({ rating, onRate, label }) => {
  const smiles = [
    { icon: Frown, color: 'text-red-500', bg: 'bg-muted', border: 'border-red-200' },
    { icon: Meh, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    { icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { icon: ThumbsUp, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200' }
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
                  : 'bg-muted border-border text-muted-foreground hover:bg-muted'
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