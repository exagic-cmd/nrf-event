"use client";

import React from "react";

export default function CategoryFilterTabs({
  categories,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 flex-wrap mb-3">
      {/* Show All option */}
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
          selectedCategory === null
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-secondary"
        }`}
        disabled={isLoading}
      >
        All
      </button>

      {/* Category tabs */}
      {categories.map((cat) => (
        <button
          key={cat.type}
          type="button"
          onClick={() => onSelectCategory(cat.type)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            selectedCategory?.toLowerCase() === cat.type.toLowerCase()
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-secondary"
          }`}
          disabled={isLoading}
          title={`${cat.count} ${cat.type} options`}
        >
          {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)} ({cat.count})
        </button>
      ))}
    </div>
  );
}
