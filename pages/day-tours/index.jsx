"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import Layout from "@/components/layout/Layout";
import DaytoursList from "@/components/daytours/DaytoursList";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import "@/styles/globals.css";

function DaytoursPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const { t } = useTranslation(["common", "daytour"]);
  const searchParams = useSearchParams();
  const { searchResults, fetchSearchResults, isLoading } = useDaytoursStore();

  // ✅ Fetch day tours when query params exist
  useEffect(() => {
    const searched = searchParams.get("searched");
    const country_id = searchParams.get("country_id");
    const city_id = searchParams.get("city_id");
    const name = searchParams.get("name") || "";

    if (searched && country_id && city_id && !isLoading) {
      setHasSearched(true);

      const payload = {
        category_id: 3,
        country_id: Number(country_id),
        city_id: Number(city_id),
        name,
        is_b2c_only: 1,
        is_active:1
      };

      console.log("🎯 Fetching Day Tours:", payload);
      fetchSearchResults(payload);
    }
  }, [searchParams]);

  // ✅ Optional manual trigger for search filters
  const handleSearch = async ({ country, city, search }) => {
    if (!country || !city) {
      alert("Please select both country and city before searching.");
      return;
    }

    setHasSearched(true);

    const payload = {
      category_id: 3,
      country_id: country?.id,
      city_id: city?.id,
      name: search || "",
      is_b2c_only: 1,
      is_active: true,
    };

    console.log("🧭 Manual Day Tours Search:", payload);
    await fetchSearchResults(payload);
  };

  return (
    <Layout>
      <section className="relative mt-12 md:mt-20 pt-6 pb-44 bg-black min-h-[80vh]">
        <div className="px-6">
          {hasSearched ? (
            isLoading ? (
              <div className="flex justify-center items-center py-20 text-muted-foreground">
                {t("daytour.loading", "Loading day tours...")}
              </div>
            ) : searchResults?.length > 0 ? (
              <DaytoursList tours={searchResults} />
            ) : (
              <div className="text-center text-muted-foreground py-20">
                <p className="text-lg font-semibold">
                  {t("daytour.noResultsTitle", "No tours found")}
                </p>
                <p className="text-sm">
                  {t(
                    "daytour.noResultsSubtitle",
                    "Try different filters or keywords."
                  )}
                </p>
              </div>
            )
          ) : (
            <div className="text-center text-white/90 py-20">
              <h2 className="text-2xl font-semibold">
                {t("daytour.exploreTitle", "Explore Exciting Day Tours")}
              </h2>
              <p className="mt-2 text-sm">
                {t("daytour.exploreSubtitle", "Use filters to find tours by country and city.")}
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "daytour"])),
    },
  };
}

export default DaytoursPage;
