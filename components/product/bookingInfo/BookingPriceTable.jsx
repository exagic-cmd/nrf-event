"use client"

import { useState } from "react"
import { useProductStore } from "@/store/useProductStore"
import { Tag, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "next-i18next"

const BookingPriceTable = ({ id }) => {
  const { t } = useTranslation("daytour");
  const [isOpen, setIsOpen] = useState(false)
  const { tieredPricingData } = useProductStore()
  const pricingList = tieredPricingData?.tieredPricing?.data?.product_pricing || []

  const renderPriceWithPromo = (price, promo, currency) => {
    if (promo > 0) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="font-semibold text-sm text-foreground">{currency} {promo}</span>
          <span className="line-through text-muted-foreground text-xs">{currency} {price}</span>
          <Badge variant="secondary" className="bg-secondry text-surface-foregroundz2 text-xs px-1 py-1 w-fit mt-1 sm:mt-0">
            {t("promo")}
          </Badge>
        </div>
      )
    }
    return <span className="text-sm font-medium text-muted-foreground">{currency} {price}</span>
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
          className="mt-4 mb-4 p-4 bg-gradient-to-r from-primary to-surface-muted rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-surface-foreground font-semibold">
              <ChevronUp className={`w-5 h-5 text-primary transition-transform duration-300 ${!isOpen ? "rotate-180" : ""}`} />
              <span className="font-medium">
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
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-muted to-secondary">
                  <tr>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-muted-foreground whitespace-nowrap">#</th>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        {t("minPax")}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        {t("maxPax")}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-muted-foreground whitespace-nowrap">
                      {t("adultPrice")}
                    </th>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-muted-foreground whitespace-nowrap">
                      {t("childPrice")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pricingList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-orange-25 transition-colors duration-200 group">
                      <td className="py-4 px-4">
                        <div className="w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-4">{item.min_pax}</td>
                      <td className="py-4 px-4">{item.max_pax}</td>
                      <td className="py-4 px-4">
                        <div className="bg-muted rounded-lg p-2 inline-block min-w-fit">
                          {renderPriceWithPromo(item.adult_price, item.adult_promo_price, item.currency)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="bg-muted rounded-lg p-2 inline-block min-w-fit">
                          {renderPriceWithPromo(item.child_price, item.child_promo_price, item.currency)}
                        </div>
                      </td>
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
