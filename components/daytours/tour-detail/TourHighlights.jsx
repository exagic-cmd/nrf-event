import { Award } from "lucide-react";
import { useTranslation } from "next-i18next";

const TourHighlights = ({ apiData, fromOrderScreen }) => {
  const { t } = useTranslation("daytour");
  const isFromOrder =
    typeof fromOrderScreen !== "undefined"
      ? fromOrderScreen
      : typeof window !== "undefined" && sessionStorage.getItem("fromOrder") === "true";

  if (isFromOrder) return null; 

  const mainHighlights = apiData?.product_description?.highlights || [];
  const groupHighlights =
    apiData?.is_group && apiData?.group_products
      ? apiData.group_products.flatMap((p) => p.highlights || [])
      : [];

  const highlightsRaw = [...mainHighlights, ...groupHighlights];

  const allHighlights = [...new Set(highlightsRaw)]
    .flatMap((item) => (typeof item === "string" ? item.split(",") : []))
    .map((h) => h.trim())
    .filter(Boolean);

  if (allHighlights.length === 0) return null;

  return (
    <div className="mb-6">
      <div
        className="
          flex gap-3 overflow-x-auto pb-2
          scrollbar-hide
        "
      >
        {allHighlights.map((highlight, i) => (
          <div
            key={i}
            className="
              flex items-center gap-2 bg-surface p-1 rounded-xl shadow-sm border border-border
              flex-shrink-0 min-w-[250px]
            "
          >
            <Award className="text-primary flex-shrink-0" size={18} />
            <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">
              {highlight}
            </span>
          </div>
        ))}
      </div>

      <div>
        <p className="py-2 mt-2">{apiData?.product_description?.short_desc}</p>
      </div>
    </div>
  );
};

export default TourHighlights;
