import { useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useTranslation } from "next-i18next"; 
// import { useCategoryStore } from "@/store/useProductStore";

const TopSection = () => {
  const { localizedPush } = useLocalizedRouter();
    const router = useRouter();
  const { t } = useTranslation("common");
  const currentPath = router.pathname.toLowerCase();

  // const { categories, fetchCategories } = useCategoryStore();

  const categories = [
    // { name: "Day Tours", is_active: "Y", sort_order: 1 },
   // { name: "Transfers", is_active: "Y", sort_order: 2 },
    // { name: "Package Tours", is_active: "Y", sort_order: 3 },
  ];

  useEffect(() => {
    // fetchCategories();
  }, []);

  const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");

  const menus = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories
      .filter((cat) => cat.is_active === "Y")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((category) => {
        if (category.name === "Package Tours") {
          return { label: t("categories.package-tours"), path: "/day-tours/chatAI" };
        }
        return {
          label: t(`categories.${slugify(category.name)}`),
          path: `/${slugify(category.name)}`,
        };
      });
  }, [categories, t]);

  const pageTitles = {
    "/transfers": t("topSection.titles.transfers"),
    // "/day-tours": t("topSection.titles.dayTours"),
    // "/accommodations": t("topSection.titles.accommodations"),
  };

  const title = pageTitles[currentPath] || t("topSection.titles.default");

  return (
    <div className="text-center h-[183px] py-6 bg-gradient-to-r from-pink-200 via-orange-200 to-yellow-200">
      <h2 className="text-xl font-semibold mt-4 mb-6">{title}</h2>
      <div className="overflow-hidden">
        <div
          className="flex items-center gap-3 overflow-x-auto pb-4 -mb-4 px-4
                     lg:flex-wrap lg:justify-center lg:pb-0 lg:mb-0"
        >
          {menus.map(({ label, path }) => {
            const isActive = currentPath === path;
            return (
              <button
                key={label}
                onClick={() => localizedPush(path)}
                className={`flex-shrink-0 px-4 py-1 rounded-full border text-sm font-medium transition 
                  ${isActive ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopSection;
