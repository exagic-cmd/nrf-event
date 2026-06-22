"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchValuesStore } from '@/store/searchValues.store';
import { toast } from 'react-toastify';

const fetchRecommendedProducts = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get-recommended-products`);
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch recommended products:", error);
    toast.error("Could not load recommendations.");
    return { success: false, data: [] };
  }
};

export default function RecommendedProductsModal({ isOpen, onClose, hotelName }) {
  const router = useRouter();
  const { setTransferParams } = useSearchValuesStore();
  const hasFetchedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [productLoading, setProductLoading] = useState(null);

  useEffect(() => {
    if (isOpen && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      setLoading(true);
      setProductLoading(null);
      fetchRecommendedProducts().then((res) => {
        if (res.success) {
          const filteredData = res.data.filter(
            (cat) => cat.category_title !== "Additional Services"
          );
          setRecommendations(filteredData);
          if (filteredData.length > 0) {
            setActiveCategory(filteredData[0].category_title);
          }
        }
        setLoading(false);
      });
    }
    // Reset on close so next open fetches fresh data
    if (!isOpen) {
      hasFetchedRef.current = false;
    }
  }, [isOpen]);
  
  const handleProductClick = async (product, category) => {
    setProductLoading(product.id);

    if (category === 'Transfers') {
      if (product.title.toLowerCase().includes('shuttle')) {
        router.push(`/day-tours/detail/${product.id}`);
        return; }

      if (!hotelName) {
        toast.error('Hotel information is missing. Cannot book transfer.');
        setProductLoading(null);
        return;
      }
      try {
        const pickupPoint = {
          id: 8513,
          name: "Singapore Changi Airport Any Terminal ",
          score: 0,
          type: "airport"
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transfer/dropoff-options?pickup_point_id=${pickupPoint.id}`);
        if (!res.ok) throw new Error('API request to fetch dropoff options failed');
        
        const dropoffData = await res.json();

        if (dropoffData.success) {
          const matchedDropoffPoint = dropoffData.dropoff_points.find(
            point => point.name.toLowerCase() === hotelName.toLowerCase()
          );

          if (matchedDropoffPoint) {
            setTransferParams({
              pickup: pickupPoint,
              dropoff: matchedDropoffPoint,
            });
            router.push('/listings?searched=true&type=transfer');
          } else {
            toast.warn(`Transfer to "${hotelName}" is not available at the moment.`);
            setProductLoading(null);
          }
        } else {
          throw new Error(dropoffData.message || "Failed to fetch dropoff options");
        }
      } catch (error) {
        console.error("Error setting up transfer:", error);
        toast.error("An error occurred while setting up the transfer. Please try again.");
        setProductLoading(null);
      }
    } else if (category === 'Day Tours') {
      router.push(`/day-tours/detail/${product.id}`);
    }
  };

  if (!isOpen) return null;

  const currentCategoryData = recommendations.find(c => c.category_title === activeCategory);

  // Helper to construct image URL based on pattern in other files
  const getImageUrl = (path) => {
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1617894191/${path}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-sm text-gray-500">Enhance your trip with these popular add-ons</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <Loader2 className="w-10 h-10 animate-spin text-[#D3202D]" />
            </div>
          ) : (
            <>
              {/* Sidebar Categories */}
              <div className="w-full md:w-64 bg-gray-50 border-r p-3 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-2 shrink-0">
                {recommendations.map((cat) => (
                  <button
                    key={cat.category_title}
                    onClick={() => setActiveCategory(cat.category_title)}
                    className={`px-4 py-3 rounded-lg text-left text-sm font-medium transition-all whitespace-nowrap md:whitespace-normal flex justify-between items-center
                      ${activeCategory === cat.category_title 
                        ? "bg-white text-[#D3202D] shadow-sm border border-gray-200" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    {cat.category_title}
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {cat.products.length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {currentCategoryData?.products.map((product) => (
                      <div 
                        key={product.id} 
                        className={`relative border rounded-xl overflow-hidden transition-all cursor-pointer group flex flex-col
                          border-gray-200 hover:border-gray-300 hover:shadow-md
                        `}
                        onClick={() => productLoading !== product.id && handleProductClick(product, activeCategory)}
                      >
                        <div className="aspect-[16/9] w-full bg-gray-100 relative overflow-hidden shrink-0">
                          {product.image ? (
                            <img 
                              src={getImageUrl(product.image)} 
                              alt={product.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 text-sm">
                              No Image Available
                            </div>
                          )}
                          {productLoading === product.id && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                              <Loader2 className="w-8 h-8 animate-spin text-[#D3202D]" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">{product.title}</h3>
                            <span className="font-bold text-[#D3202D] whitespace-nowrap text-sm">
                              {Number(product.starting_price) > 0 ? `SGD ${product.starting_price}` : 'Free'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                            {product.description || "No description available."}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-between items-center">
          <p className="text-sm text-gray-500">Your hotel has been added to the cart.</p>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button onClick={onClose} className="flex-1 sm:flex-none bg-[#D3202D] hover:bg-[#b71c1c]">
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}