import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import DayTourCard from "./DayTourCard";
import Pagination from "@/components/common/Pagination";
import { List, Map } from "lucide-react";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useProductFeature } from "@/store/useProductFeature";
//import FeatureSection from "@/components/product/FeatureSection";
import useLanguageStore from "@/store/useLanguageStore";
const ITEMS_PER_PAGE = 12;


const CardList = () => {
  const { t } = useTranslation("daytour");
  const { searchResults, isLoading } = useDaytoursStore();
  const tours = searchResults || [];
  const [view, setView] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
const { productfeature, fetchProductFeature } = useProductFeature();
 const { languageId, currentLocale } = useLanguageStore.getState();
    console.log("Fetching with Language:", currentLocale, "ID:", languageId);
  // useEffect(() => {
  //   fetchProductFeature(languageId);
  // }, [languageId]);

  useEffect(() => {
    console.log('Product Feature:', productfeature);
  }, [productfeature]);

  if (isLoading) {
    return (
      <div className="text-center p-10">
        <p className="text-lg font-semibold">{t("search.searchTours")}</p>
        <p className="text-muted-foreground">{t("search.refineSearch")}</p>
      </div>
    );
  }

  // if (!searchResults || tours.length === 0) {
  //   return (
  //     <div className="text-center p-1 md:p-10">
  //      {productfeature.map((item) => (
     
  //                  <FeatureSection key={item.id}  {...item} />
  //               ))}
  //     </div>
  //   );
  // }

  const totalPages = Math.ceil(tours.length / ITEMS_PER_PAGE);
  const paginatedTours = tours.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4 md:12 sm:4 lg:mx-44">
      {/* View Switcher */}
      <div className="rounded-xl py-3 px-4 bg-surface">
        <div className="flex justify-between items-center">
          <p className="text-md md:text-lg font-normal md:font-semibold">
            {t("search.searchTours")}: {tours.length}
          </p>
          <div className="flex bg-muted rounded-full gap-1 p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1 px-4 py-1 rounded-full transition ${
                view === "list" ? "bg-surface shadow text-surface-foreground" : "text-muted-foreground hover:text-surface-foreground"
              }`}
            >
              <List size={16} />
              <span className="text-sm">List</span>
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1 px-4 py-1 rounded-full transition ${
                view === "map" ? "bg-surface shadow text-surface-foreground" : "text-muted-foreground hover:text-surface-foreground"
              }`}
            >
              <Map size={16} />
              <span className="text-sm">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Day Tour Cards */}
      {paginatedTours.map((tour) => (
        <DayTourCard key={tour.id} tour={tour} />
      ))}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default CardList;
