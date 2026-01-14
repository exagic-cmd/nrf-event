import { ChevronDown, NotebookPen, BadgeCheck, Ban, CheckCircle, XCircle } from "lucide-react"
import { useTranslation } from "next-i18next"

const TourAccordion = ({ apiData }) => {
  const { t } = useTranslation("daytour")

  const normalizeText = (text) =>
    text
      ?.replace(/[‘’‛‹›]/g, "'")
      ?.replace(/[“”«»]/g, '"')
      ?.replace(/–|—/g, "-")
      ?.replace(/<br\s*\/?>/gi, " ")
      ?.trim() || ""

  const cleanTextWithBreaks = (text) =>
    text?.replace(/<br\s*\/?>/gi, "\n").trim() || ""

  const inclusionsRaw = cleanTextWithBreaks(apiData.product_description?.inclusion)
  const exclusionsRaw = cleanTextWithBreaks(apiData.product_description?.exclusion)

  const inclusions = inclusionsRaw.split("\n").filter(Boolean)
  const exclusions = exclusionsRaw.split("\n").filter(Boolean)

  return (
    <div className="bg-white rounded-lg p-5  shadow-sm">
      {/* Included Section */}
      <h3 className="font-semibold text-[#D3202D] mb-3 text-lg">{t("whatsIncluded")}</h3>
      <ul className="space-y-2 mb-6">
        {inclusions.length > 0 ? (
          inclusions.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-black text-sm">
              <CheckCircle className="text-[#D3202D] mt-1 flex-shrink-0" size={16} />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-sm">{t("noInclusionsAvailable")}</p>
        )}
      </ul>

      {/* Excluded Section */}
      <h3 className="font-semibold text-[#D3202D] mb-3 text-lg">{t("whatsExcluded")}</h3>
      <ul className="space-y-2">
        {exclusions.length > 0 ? (
          exclusions.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-black text-sm">
              <XCircle className="text-[#D3202D] mt-1 flex-shrink-0" size={16} />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <p className="text-gray-white text-sm">{t("noExclusionsAvailable")}</p>
        )}
      </ul>
    </div>
  )
}

export default TourAccordion
