"use client"

import { useState, useEffect } from "react"
import "@/styles/globals.css"
import Layout from "@/components/layout/Layout"
import TransfersList from "@/components/transfers/TransfersList"
import Faqs from "@/components/transfers/Faqs"
import TransferSearchFilter from "@/components/transfers/FilterBar"
import TransferBookingPlaceholder from "@/components/transfers/TransferBookingPlaceholder"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useSearchParams } from 'next/navigation'

function TransfersPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isInitialSearch, setIsInitialSearch] = useState(true);
  const [searchCategory, setSearchCategory] = useState("transfer"); // default
  
  const { t } = useTranslation("common", "transfer");
  const searchParams = useSearchParams();

  useEffect(() => {
    const searched = searchParams.get("searched");
    const category = searchParams.get("category");

    if (searched) {
      setHasSearched(true);
      setIsInitialSearch(false);
      if (category) {
        setSearchCategory(category.toLowerCase()); // ✅ normalize category
      }
    } else {
      setShowSearchModal(true);
    }
  }, [searchParams]);

  const handleSearch = (searchData) => {
    setHasSearched(true);
    setShowSearchModal(false);

    // ✅ normalize category
    if (searchData?.category) {
      setSearchCategory(searchData.category.toLowerCase());
    }

    if (isInitialSearch) {
      setIsInitialSearch(false);
    }
  };

  return (
    <Layout>
      <div className="relative mt-12 md:mt-20 pt-6 pb-44 bg-black">
        <div className="flex flex-col lg:flex-row gap-6 px-6">
          
          {/* Left: Filter */}
          <div className="h-fit md:sticky top-24 self-start z-20">
            <TransferSearchFilter
              onSearch={handleSearch}
              showModal={showSearchModal}
              setShowModal={setShowSearchModal}
              forceSearch={isInitialSearch}
            />
          </div>

          {/* Center: Dynamic content */}
          <div className="flex-1 relative z-10">
            {hasSearched ? (
              <TransfersList category={searchCategory} />
            ) : (
              <TransferBookingPlaceholder />
            )}
          </div>

          {/* Right: FAQs */}
          <div className="lg:w-1/4 h-fit sticky top-24 self-start z-10">
            {hasSearched && searchCategory === "transfer" && <Faqs />}
          </div>
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
  }
}

export default TransfersPage