import React from 'react';

const ReviewSummary = () => {
  const totalReviews = 1543;
  const ratings = [
    { star: 5, count: 1021 },
    { star: 4, count: 121 },
    { star: 3, count: 88 },
    { star: 2, count: 37 },
    { star: 1, count: 13 },
  ];

  const getBarWidth = (count) => `${(count / totalReviews) * 100}%`;

  return (
    <div className="p-4 bg-surface  max-w-xl">
      <div className="flex gap-8 items-start">
        {/* Score */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-bold">4.0</div>
          <div className="text-sm text-muted-foreground mb-1">/5</div>
          {/* Star rating visual */}
          <div className="flex text-yellow-400 text-sm mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">({totalReviews.toLocaleString()} Ratings)</div>
        </div>

        {/* Progress Bars */}
        <div className="flex-1 space-y-2">
          {ratings.map((rating) => (
            <div key={rating.star} className="flex items-center text-sm">
              <span className="w-6">{rating.star}★</span>
              <div className="flex-1 h-2 bg-secondary rounded-full mx-2">
                <div
                  className="h-2 bg-yellow-400 rounded-full"
                  style={{ width: getBarWidth(rating.count) }}
                ></div>
              </div>
              <span className="w-10 text-right">{rating.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;
