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
          <span className="font-semibold text-sm text-green-600">{currency} {promo}</span>
          <span className="line-through text-gray-400 text-xs">{currency} {price}</span>
          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1 py-1 w-fit mt-1 sm:mt-0">
            {t("promo")}
          </Badge>
        </div>
      )
    }
    return <span className="text-sm font-medium text-gray-700">{currency} {price}</span>
  }

  if (pricingList.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">{t("noPricing")}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mb-6">
      <div className="mx-0">
        <div className="text-lg my-4 md:text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#D3202D]" />
          {t("bookingInformation")}
        </div>

        <div
          className="mt-4 mb-4 p-4 bg-gradient-to-r from-[#D3202D] to-gray-50 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-black font-semibold">
              <ChevronUp className={`w-5 h-5 text-[#D3202D] transition-transform duration-300 ${!isOpen ? "rotate-180" : ""}`} />
              <span className="font-medium">
                {t("tiersAvailable", { count: pricingList.length })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4 text-[#D3202D]" />
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
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-gray-700 whitespace-nowrap">#</th>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#D3202D]" />
                        {t("minPax")}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#D3202D]" />
                        {t("maxPax")}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-gray-700 whitespace-nowrap">
                      {t("adultPrice")}
                    </th>
                    <th className="py-4 px-4 text-left font-semibold text-sm text-gray-700 whitespace-nowrap">
                      {t("childPrice")}
                    </th>
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
                      <td className="py-4 px-4">{item.min_pax}</td>
                      <td className="py-4 px-4">{item.max_pax}</td>
                      <td className="py-4 px-4">
                        <div className="bg-red-50 rounded-lg p-2 inline-block min-w-fit">
                          {renderPriceWithPromo(item.adult_price, item.adult_promo_price, item.currency)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="bg-red-50 rounded-lg p-2 inline-block min-w-fit">
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
