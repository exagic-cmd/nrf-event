"use client";

import ProductCard from "./ProductCard";

export default function ProductList({ products = [], onSelect }) {
  if (!products.length) {
    return (
      <span></span>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onSelect={onSelect} />
      ))}
    </div>
  );
}
