"use client"

import { useState, useEffect } from "react"
import { useProductStore } from "@/store/useProductStore"
import { Tag, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "next-i18next"

const BookingPriceTable = ({ id, accommodation_group_id }) => {
  const { t } = useTranslation("daytour");
  const { tieredPricingData, bookedProductDetail } = useProductStore()

  const isPackageTour = bookedProductDetail?.data?.basicinfo?.category_id === 8 ||
                        tieredPricingData?.data?.tieredPricing?.data?.product_pricing?.some(p => p.adult_sharing);
 const pricingList = isPackageTour && accommodation_group_id
    ? (bookedProductDetail?.data?.basicinfo?.accommodation_group_pricing?.find(g => String(g.group_id) === String(accommodation_group_id))?.b2c_tiers || [])
    : (tieredPricingData?.data?.tieredPricing?.data?.product_pricing || tieredPricingData?.data?.b2c_pricing || []);

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isPackageTour) {
      setIsOpen(true)
    }
  }, [isPackageTour])

  const renderPriceWithPromo = (price, promo, currency) => {
    if (promo > 0) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="font-semibold text-sm text-green-600">{currency} {promo}</span>
          <span className="line-through text-muted-foreground text-xs">{currency} {price}</span>
          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1 py-1 w-fit mt-1 sm:mt-0">
            {t("promo")}
          </Badge>
        </div>
      )
    }
    return <span className="text-sm font-medium text-foreground">{currency} {price}</span>
  }

  if (pricingList.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">{t("noPricing")}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mb-6">
      <div className="mx-0">
        <div className="text-lg my-4 md:text-xl font-semibold text-foreground flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          {t("bookingInformation")}
        </div>

        <div
          className="mt-4 mb-4 p-4 bg-primary/15 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-black font-semibold">
              <ChevronUp className={`w-5 h-5 text-primary transition-transform duration-300 ${!isOpen ? "rotate-180" : ""}`} />
              <span className="font-medium text-foreground">
                {t("tiersAvailable", { count: pricingList.length })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {t("groupSize", {
                  min: Math.min(...pricingList.map((p) => p.min_pax)),
                  max: Math.max(...pricingList.map((p) => p.max_pax)),
                })}
              </span>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-foreground whitespace-nowrap">#</th>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        {t("paxRangeLabel", "Pax Range")}
                      </div>
                    </th>
                    {!isPackageTour ? (
                      <>
                        <th className="py-4 px-4 text-left font-semibold text-sm text-foreground whitespace-nowrap">{t("adultPrice")}</th>
                        <th className="py-4 px-4 text-left font-semibold text-sm text-foreground whitespace-nowrap">{t("childPrice")}</th>
                      </>
                    ) : (
                      <>
                        <th className="py-4 px-4 text-left font-semibold text-sm text-foreground whitespace-nowrap">{t("twinSharing")}</th>
                        <th className="py-4 px-4 text-left font-semibold text-sm text-foreground whitespace-nowrap">{t("singleSharing")}</th>
                        <th className="py-4 px-4 text-left font-semibold text-sm text-foreground whitespace-nowrap">{t("childWithBed")}</th>
                        <th className="py-4 px-4 text-left font-semibold text-sm text-foreground whitespace-nowrap">{t("childWithoutBed")}</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pricingList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-orange-25 transition-colors duration-200 group">
                      <td className="py-4 px-4">
                        <div className="w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-foreground">
                        {item.min_pax} - {item.max_pax}
                      </td>
                      {!isPackageTour ? (
                        <>
                          <td className="py-4 px-4">
                            <div className="bg-green-50 rounded-lg p-2 inline-block min-w-fit">
                              {renderPriceWithPromo(item.adult_price, item.adult_promo_price, item.currency)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="bg-green-50 rounded-lg p-2 inline-block min-w-fit">
                              {renderPriceWithPromo(item.child_price, item.child_promo_price, item.currency)}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-4 px-4"><span className="text-sm">{item.currency} {item.adult_sharing}</span></td>
                          <td className="py-4 px-4"><span className="text-sm">{item.currency} {item.adult_private}</span></td>
                          <td className="py-4 px-4"><span className="text-sm">{item.currency} {item.child_with_bed}</span></td>
                          <td className="py-4 px-4"><span className="text-sm">{item.currency} {item.child_without_bed}</span></td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <hr className="my-3" />
      </div>
    </div>
  )
}

export default BookingPriceTable
