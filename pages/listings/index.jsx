"use client";

import { useState, useEffect } from "react";
import "@/styles/globals.css";
import Layout from "@/components/layout/Layout";
import TransfersList from "@/components/transfers/TransfersList";
import DaytoursList from "@/components/daytours/DaytoursList";
import AccommodationList from "@/components/accommodations/AccommodationList";
import Faqs from "@/components/transfers/Faqs";
import TransferSearchFilter from "@/components/transfers/FilterBar";
import FilterSidebar from "@/components/daytours/FilterSidebar";
import TransferBookingPlaceholder from "@/components/transfers/TransferBookingPlaceholder";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useSearchParams } from "next/navigation";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import GoogleMap from "@/components/daytours/GoogleMap";

function ListingsPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isInitialSearch, setIsInitialSearch] = useState(true);
  const [searchCategory, setSearchCategory] = useState("transfer");
  const [searchParams, setSearchParams] = useState({});
  const { t } = useTranslation("common", "transfer");
  const urlSearchParams = useSearchParams();

  // Zustand stores
  const {
    searchResults,
    isLoading,
  } = useDaytoursStore();

  const {
    searchParams: accommodationPayload,
    accommodations,
    isLoading: accommodationLoading,
    fetchAccommodations,
  } = useAccommodationsStore();

  // Detect search via URL
  useEffect(() => {
    const searched = urlSearchParams.get("searched");
    const type = urlSearchParams.get("type");
    const category = urlSearchParams.get("category");

    if (searched) {
      setHasSearched(true);
      setIsInitialSearch(false);
      if (category) {
        setSearchCategory(category.toLowerCase());
      } else if (type) {
        setSearchCategory(type.toLowerCase());
      }
      const params = {};
      for (const [key, value] of urlSearchParams.entries()) {
        params[key] = value;
      }
      setSearchParams(params);
    } else {
      setShowSearchModal(true);
    }
  }, [urlSearchParams]);

  // Fetch accommodations when payload is available
  useEffect(() => {
    if (
      (searchCategory === "accommodation" || searchCategory === "hotels") &&
      accommodationPayload
    ) {
      fetchAccommodations(accommodationPayload);
    }
  }, [searchCategory, accommodationPayload, fetchAccommodations]);

  // Render the correct list
  const renderListComponent = () => {
    switch (searchCategory) {
      case "transfer":
        return <TransfersList searchParams={searchParams} />;
      case "daytour":
      case "day-tours":
        return <DaytoursList searchParams={searchParams} />;
      case "accommodation":
      case "hotels":
        return (
          <AccommodationList
            accommodations={accommodations}
            isLoading={accommodationLoading}
          />
        );
      default:
        return <TransfersList searchParams={searchParams} />;
    }
  };

  // Placeholders
  const renderPlaceholder = () => {
    switch (searchCategory) {
      case "daytour":
      case "day-tours":
        return (
          <div className="text-white text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Search for Day Tours</h2>
            <p className="text-gray-400">Enter your destination to find amazing day tours</p>
          </div>
        );
      case "accommodation":
      case "hotels":
        return (
          <div className="text-white text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Search for Accommodations</h2>
            <p className="text-gray-400">Enter your destination to find the perfect stay</p>
          </div>
        );
      default:
        return <TransferBookingPlaceholder />;
    }
  };

  const showFaqs = hasSearched && searchCategory === "transfer";

  return (
    <Layout>
      <div className="relative mt-12 md:mt-20 pt-6 pb-44 bg-black">
        <div className="flex flex-col lg:flex-row gap-6 px-6">
          {searchCategory === "transfer" && (
            <div className="h-fit md:sticky top-24 self-start z-20">
              <TransferSearchFilter
                onSearch={() => {}}
                showModal={showSearchModal}
                setShowModal={setShowSearchModal}
                forceSearch={isInitialSearch}
                initialCategory={searchCategory}
              />
            </div>
          )}
			 {/* Day Tours: Filter Sidebar + List */}
          {(searchCategory === "daytour" || searchCategory === "day-tours") && (
            <div className="h-fit md:sticky top-24 self-start z-20">
              {/* Filter Sidebar (Sticky) */}
              <div className="h-fit md:sticky top-24 self-start z-20 w-full lg:w-80">
                {!isLoading && searchResults.length > 0 && (
                  <FilterSidebar />
                )}
              </div>
            </div>
          )}
          { /* Accomodation: No sidebar for now */}
          {(searchCategory === "accommodation" || searchCategory === "hotels") && (
          <div className="h-fit md:sticky top-24 self-start z-20">
            {/* Filter Sidebar (Sticky) */}
            <div className="h-fit md:sticky top-24 self-start z-20 w-full lg:w-80">
              {!isLoading && searchResults.length > 0 && (
                <FilterSidebar />
              )}
            </div>
          </div>
          )}

          {/* Center: Dynamic content */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6">
            {hasSearched ? (
              renderListComponent()
            ) : (
              renderPlaceholder()
            )}
          </div>
          {/* Google Maps */}
                  {(searchCategory === "daytour" || searchCategory === "day-tours" || searchCategory === "accommodation" || searchCategory === "hotels") && (
                  <div className="lg:w-1/4 h-fit sticky top-24 self-start z-10">
                    <GoogleMap 
                    center={{ lat: 1.3521, lng: 103.8198 }} // Singapore coordinates
                zoom={12}
                width="100%"
                height="550px"
                className="rounded-lg shadow-lg"
              />
            </div>
          )}

          {searchCategory === "transfer" && (
            <div className="lg:w-1/4 h-fit sticky top-24 self-start z-10">
              {showFaqs && <Faqs />}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "transfer"])),
    },
  };
}

export default ListingsPage;
