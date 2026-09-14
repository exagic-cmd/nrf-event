import {
  ChevronDown,
  ChevronRight,
  Clock,
  Mountain,
  UserCheck,
  Globe,
  Bus,
  CarTaxiFront,
  Hotel,
  Eye,
  X,
} from "lucide-react"
import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react";
import { useProductStore } from "@/store/useProductStore";
// import { getCurrencyRate } from "@/utils/getIP";
import formatPrice from "@/lib/formatPrice";
const TourInfoCard = ({ apiData, onScrollToOptions, onProceedBooking, isPackageTour, onInquireNow }) => {
  const { t } = useTranslation(["daytour", "common"])

  const startingPrice = apiData.starting_price || ""
  const [fromOrderScreen, setFromOrderScreen] = useState(false);
  const [currencyData, setCurrencyData] = useState(null);

  const parsePrice = (priceStr) => {
    if (typeof priceStr === "number") return priceStr;
    if (!priceStr) return 0;
    const match = priceStr.toString().replace(/[^0-9.]/g, "");
    return parseFloat(match) || 0;
  };

  // useEffect(() => {
  //   const fetchRate = async () => {
  //     try {
  //       const rate = await getCurrencyRate();
  //       if (rate && rate.exchange_rate !== 1) {
  //         setCurrencyData(rate);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching currency rate:", err);
  //     }
  //   };
  //   fetchRate();
  // }, []);

  useEffect(() => {
    const flag = sessionStorage.getItem("fromOrder") === "true";
    setFromOrderScreen(flag);
  }, []);

  const { bookedProductDetail } = useProductStore();
  const [viewingHotels, setViewingHotels] = useState(null);
  const [showAllHotels, setShowAllHotels] = useState(false);
  const accommodationGroups = bookedProductDetail?.data?.basicinfo?.accommodation_group_pricing || [];

  const tourFeatures = [
    ...(apiData.duration ? [{
      icon: Clock,
      title: t("duration", { ns: "daytour" }),
      desc: `${apiData.duration} ${isPackageTour ? t("days", "Days") : t("hours")}`
    }] : []),

    ...(apiData.tourtype ? [{
      icon: Mountain,
      title: t("tour_type"),
      desc: apiData.tourtype === "Private Tour"
        ? t("privateTour", "Private Tour")
        : t("shareTour", "Share Tour")
    }] : []),

    ...(apiData.guide_tour ? [{
      icon: UserCheck,
      title: t("guide"),
      desc: apiData.guide_tour === "yes" ? t("guided") : t("no_guide")
    }] : []),

    ...(apiData.guidelanguage ? [{
      icon: Globe,
      title: t("language"),
      desc: t("english")
    }] : []),

    ...(apiData.return_transfer === "yes" ? [{
      icon: Bus,
      title: t("return_transfer"),
      desc: t("included")
    }] : []),

    ...(apiData.pickup_included === "yes" ? [{
      icon: CarTaxiFront,
      title: t("pickup_included"),
      desc: t("available")
    }] : []),
  ]

  return (
    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
 

      {/* Desktop Pricing & Proceed Button Section */}
      {!fromOrderScreen && (
        <div className="hidden md:block bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden mb-6">
          {isPackageTour && (
            <>
              <div className="p-4 border-b border-border bg-muted">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Hotel size={18} className="text-primary" />
                  {t("filterSidebar.packageOptions")}
                </h3>
              </div>

              {/* Desktop Table */}
              <div className="overflow-x-auto my-2">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">{t("filterSidebar.group")}</th>
                      <th className="px-4 py-3">{t("filterSidebar.startingPrice")}</th>
                      <th className="px-4 py-3 text-center">{t("filterSidebar.hotelSelection")}</th>
                      <th className="px-4 py-3 text-right">{t("filterSidebar.hotels")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {accommodationGroups.map((group) => (
                      <tr key={group.group_id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{group.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col text-left">
                            <span className="text-primary font-bold">
                              {apiData?.currency} {group.b2c_tiers?.[0]?.adult_sharing || "N/A"}
                            </span>
                            {currencyData && currencyData.exchange_rate !== 1 && group.b2c_tiers?.[0]?.adult_sharing && (
                                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                Est. {formatPrice(parsePrice(startingPrice) * currencyData.exchange_rate)} {currencyData.currency}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${group.allow_hotel_selection ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {group.allow_hotel_selection ? t("common:yes") : t("common:no")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => { setViewingHotels(group); setShowAllHotels(false); }}
                            className="text-primary hover:text-primary-hover flex items-center gap-1 ml-auto font-medium"
                          >
                            <Eye size={14} /> {t("filterSidebar.view")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="p-4 bg-muted border-t border-border">
            <div className="text-center">
              {!isPackageTour && (
                <>
                  <div className="text-sm text-muted-foreground">{t("starting_from")}</div>
                  <div className="my-2 flex flex-col items-center">
                    <span className="text-2xl font-bold text-foreground">{apiData?.currency} {startingPrice}</span>
                    {currencyData && currencyData.exchange_rate !== 1 && (
                      <span className="text-sm text-muted-foreground font-medium mt-0.5">
                        Est. {formatPrice(parsePrice(startingPrice) * currencyData.exchange_rate)} {currencyData.currency}
                      </span>
                    )}
                  </div>
                </>
              )}
              {apiData?.is_group && !isPackageTour ? (
                <button
                  onClick={onScrollToOptions}
                  className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {t("choose_tour_type")}
                  <ChevronDown size={20} />
                </button>
              ) : (
                <button
                  onClick={onProceedBooking}
                  className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {t("proceed_booking")}
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hotel Selection Modal */}
      {viewingHotels && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
          <div className="bg-card text-card-foreground rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-border">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted">
              <h4 className="font-bold text-foreground">{viewingHotels.name} - {t("filterSidebar.hotelList")}</h4>
              <button onClick={() => setViewingHotels(null)} className="p-1 hover:bg-secondary rounded-full transition-colors">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {(showAllHotels ? viewingHotels.hotels : viewingHotels.hotels?.slice(0, 4))?.map((hotel, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
                  <div className="bg-primary/15 p-2 rounded-lg"><Hotel size={16} className="text-primary" /></div>
                  <span className="text-sm font-medium text-foreground">{hotel.title || hotel}</span>
                </div>
              ))}
              {viewingHotels.hotels?.length > 4 && !showAllHotels && (
                <button 
                  onClick={() => setShowAllHotels(true)}
                  className="w-full py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl border-2 border-dashed border-primary/30 transition-colors"
                >
                  {t("filterSidebar.loadMore")} ({viewingHotels.hotels.length - 4})
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Tour Features - Responsive Grid */}
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-3 rounded-lg">
        {tourFeatures.map((feature, i) => {
          const IconComponent = feature.icon
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-2 p-3 bg-card text-card-foreground rounded-lg shadow-sm border border-border flex-shrink-0 "
            >       
              <div className="flex items-center gap-2">
                <div className="bg-primary/15 p-2 rounded-lg">
                  <IconComponent size={14} className="text-primary" />
                </div>
                <div className="font-medium text-sm text-foreground">{t(feature.title)}</div>
              </div>
              <div className="text-xs text-muted-foreground">{feature.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TourInfoCard
