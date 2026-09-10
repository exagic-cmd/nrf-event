import { ExternalLink, CheckCircle2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { getFullImageUrl } from "@/utils/imageService"; // Assuming getFullImageUrl is exported from here

interface AddonItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  image?: string;
  addon_info?: {
    title: string;
    short_desc: string;
    image: string;
  };
  product_images?: { image: string }[];
  category_id?: number; // For openDetails
  booking_status?: string; // For status fallback
}

interface EssentialAddonCardProps {
  item: AddonItem;
  onClick: (item: AddonItem) => void;
}

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
const normalizeStatus = (value?: string) => (value || "").toString().trim().toLowerCase();

const EssentialAddonCard = ({ item, onClick }: EssentialAddonCardProps) => {
  const { t } = useTranslation("order");
  const imageUrl = getFullImageUrl(item.addon_info?.image || item.image || item.product_images?.[0]?.image);
  const title = capitalize(item.addon_info?.title || item.title);
  const subtitle = capitalize(item.addon_info?.short_desc || item.subtitle || t("guest_travel_support_item"));
  const rawStatus = item.status || item.booking_status || "";
  const normalizedStatus = normalizeStatus(rawStatus);
  const isConfirmed = ["confirmed", "paid"].includes(normalizedStatus);
  const statusLabel = rawStatus || t("confirmation_pending");

  return (
    <div
      key={`addon-${item.id}`}
      onClick={() => isConfirmed ? onClick(item) : null}
      className={`group relative transition-all duration-300 ${isConfirmed ? 'cursor-pointer' : 'cursor-default'} md:h-[170px] h-[170px] w-full`}
    >
      {/* Service Card Container */}
      <div className="relative flex flex-row bg-surface shadow-sm ring-1 ring-border rounded-2xl overflow-hidden group-hover:shadow-md transition-all h-full group-hover:scale-[1.01]">
        
        {/* Left Side - Service Image */}
        <div className="relative h-full w-[35%] sm:w-[40%] shrink-0 bg-muted border-r border-border overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${!isConfirmed ? 'grayscale opacity-50' : 'group-hover:scale-110'}`} />
          ) : (
            // Fallback icon if no image is available
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          )}
          {!isConfirmed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
              <p className="text-[10px] text-white font-black uppercase tracking-tight text-center px-1">{statusLabel}</p>
            </div>
          )}
          {/* Subtle overlay to keep branding consistency */}
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        </div>

        {/* Right Side - Addon Details */}
        <div className="flex-1 p-3 sm:p-5 flex flex-col justify-between overflow-hidden">
          {/* Header Row */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 pr-3">
              <h3 className="md:text-sm text-lg font-bold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                {title}
              </h3>
            </div>

            {/* Status Badge - Hidden on very small screens to save space */}
            <div className="hidden xs:block flex-shrink-0">
              <span className={`inline-block px-2 py-1 sm:px-3 sm:py-1.5 border rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wide ${isConfirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                {statusLabel}
              </span>
            </div>
          </div>
            <div>
               <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                 {t("service_add_on")}
               </span>
            </div>
          </div>

          {/* Action/Info */}
          <div className="flex items-center justify-end mt-4">
            {isConfirmed ? (
              <button
                onClick={(e) => { e.stopPropagation(); onClick(item); }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              > {/* No static text here */}
                {t("view_details")} <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{statusLabel}</span>
            )}
          </div>
        </div>

        {/* Hover Border */}
        <div className="absolute inset-0 border-2 border-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </div>
  );
};

export default EssentialAddonCard;
