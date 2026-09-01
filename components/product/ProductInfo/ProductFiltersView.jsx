import React, { useState } from "react";
import Card from "@/components/common/Card";
import SearchBar from "@/components/common/SearchBar";
import FilterModal from "@/components/filters/ProductFilter";
import Pagination from "@/components/common/Pagination";
import { useScrollToTop } from '@/hooks/use-scroll-top';
import { useAppStore } from "@/store/useAppStore";
import { ChevronLeft, } from 'lucide-react';

const PRODUCTS_PER_PAGE = 20; 

export default function ProductFiltersView({ onBackClick }) {
  useScrollToTop();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { filteredProducts, setSelectedView, setShowMenuFullView } = useAppStore();

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleBackClick = () => {
    setSelectedView(null);
    setShowMenuFullView(false);
  };

  // Pagination logic
  const totalProducts = filteredProducts?.length || 0;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts?.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="mb-14 mt-8 ">
     

      {/* Search bar + Filter */}
      <div className="flex justify-center items-center mt-24 gap-2">
         <button
          onClick={handleBackClick}
          className="flex items-center px-5 py-2 border border-border rounded-full text-muted-foreground hover:bg-muted"
        >
         <ChevronLeft/>
          Back
        </button>
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>

        {/* <button
          onClick={handleFilterClick}
          className="flex items-center px-5 py-2 border border-border rounded-full text-muted-foreground hover:bg-muted"
        >
          <img
            src="NEXT_PUBLIC_IMAGE_BASE_URLimage/upload/v1744783776/External+Links/lvpxygbjx15x2czmgqfu.svg"
            alt="Filter Icon"
            className="w-5 h-5 mr-2"
          />
          Filter
        </button> */}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-1 gap-y-8 mx-2 md:mx-8 lg:mx-8 xl:mx-12 mt-12">
        {paginatedProducts && paginatedProducts.length > 0 ? (
          paginatedProducts.map((item) =><div className="flex justify-center"> <Card {...item} key={item.id} category_id={item.category_id} /><div/></div>)
        ) : (
          <p className="text-center text-muted-foreground">No products available</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />
    </div>
  );
}
