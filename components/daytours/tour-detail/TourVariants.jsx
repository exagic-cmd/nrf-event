"use client"

import { forwardRef } from "react"
import { CheckCircle } from "lucide-react"
import { useTranslation } from "next-i18next"

const TourVariants = forwardRef(({ groupProducts, onVariantSelect }, ref) => {
  const { t } = useTranslation("daytour") // Namespace optional

  return (
    <div
      ref={ref}
      className="mx-4 sm:mx-6 lg:mx-12 mb-12 sm:mb-24 bg-white shadow-xl rounded-2xl overflow-hidden scroll-mt-24"
    >
      {/* Mobile Cards View */}
      <div className="block lg:hidden">
        <div className="p-4 bg-gray-100 border-b">
          <h3 className="text-lg font-bold text-gray-800">{t("choose_tour")}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {groupProducts.map((variant) => (
            <div key={variant.group_product_id} className="p-4 space-y-3">
              <div>
                <h4 className="font-bold text-gray-900 text-base">{variant.Title}</h4>
                <p className="text-sm text-gray-600 mt-1">{variant.Description}</p>
              </div>
              {variant.highlights && variant.highlights.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">{t("highlights")}</h5>
                  {variant.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle size={12} />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-lg font-bold text-gray-900">{variant.Starting_price}</span>
                  <span className="text-sm text-gray-500 ml-1">{t("per_person")}</span>
                </div>
                <button
                  onClick={() => onVariantSelect(variant)}
                  className="bg-[#D3202D] hover:bg-[#D3202D] text-white text-sm px-4 py-2 rounded-xl font-semibold shadow"
                >
                  {t("choose")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-800 text-sm uppercase font-semibold">
            <tr>
              <th className="p-4">{t("tour_type")}</th>
              <th className="p-4">{t("highlights")}</th>
              <th className="p-4">{t("starting_price")}</th>
              <th className="p-4 text-center">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {groupProducts.map((variant) => (
              <tr key={variant.group_product_id} className="border-b hover:bg-blue-50 transition">
                <td className="p-4">
                  <div className="font-bold text-gray-900">{variant.Title}</div>
                  <div className="text-xs text-gray-500 mt-1">{variant.Description}</div>
                </td>
                <td className="p-4 space-y-2">
                  {variant.highlights?.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={14} />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </td>
                <td className="p-4 font-bold text-gray-900 text-lg">
                  {variant.Starting_price}
                  <span className="text-sm font-normal text-gray-500"> {t("per_person")}</span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => onVariantSelect(variant)}
                    className="bg-[#D3202D] text-white text-sm px-5 py-2 rounded-xl font-semibold shadow"
                  >
                    {t("choose")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

TourVariants.displayName = "TourVariants"

export default TourVariants
