import { ChevronDown, NotebookPen, BadgeCheck, Ban, CheckCircle, XCircle } from "lucide-react"
import { useTranslation } from "next-i18next"

const TourAccordion = ({ apiData }) => {
  const { t } = useTranslation("daytour")
const normalizeText = (text) =>
  text
    ?.replace(/[‘’‛‹›]/g, "'") 
    ?.replace(/[“”«»]/g, '"') 
    ?.replace(/–/g, "-") 
    ?.replace(/—/g, "-") 
    ?.replace(/<br\s*\/?>/gi, " ") 
    ?.trim() || "";
  const cleanText = (text) =>
    text?.replace(/<br\s*\/?>/gi, " ").trim() || ""


  const cleanTextWithBreaks = (text) =>
    text
      ?.replace(/<br\s*\/?>/gi, "\n") 
      ?.trim() || ""

  const description = normalizeText(apiData.product_description?.short_desc)
  const inclusionsRaw = cleanTextWithBreaks(apiData.product_description?.inclusion)
  const exclusionsRaw = cleanTextWithBreaks(apiData.product_description?.exclusion)

  const inclusions = inclusionsRaw.split("\n").filter(Boolean)
  const exclusions = exclusionsRaw.split("\n").filter(Boolean)

  const sections = [
    {
      title: "Inclusions & Exclusions",
      inclusions: inclusions,
      exclusions: exclusions,
      Icon: BadgeCheck,
      type: "inclusion_exclusion",
    },
  ]

  return (
    <div className="space-y-3">
      {sections.map((section, index) => {
        const SectionIcon = section.Icon
        
        return (
          <details
            key={index}
            className="bg-[#D3202D] rounded-lg border border-gray-200 shadow-sm overflow-hidden group"
            open={index === 0}
          >
            <summary className="cursor-pointer p-4 sm:p-4  transition-colors duration-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SectionIcon className="text-black" size={20} />
                <span className="font-semibold text-black text-base sm:text-lg">
                  {section.title}
                </span>
              </div>
              <div className="text-gray-50 transform transition-transform duration-200 group-open:rotate-180">
                <ChevronDown size={18} />
              </div>
            </summary>

            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-100 bg-blue-50">
              {section.type === 'inclusion_exclusion' ? (
                <div>
                  <h3 className="font-semibold text-black mb-2">{t("whatsIncluded")}</h3>
                  <ul className="space-y-2 mb-4">
                    {section.inclusions?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-black text-sm">
                        <CheckCircle
                          className="text-[#D3202D] mt-1 flex-shrink-0"
                          size={14}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <h3 className="font-semibold text-black mb-2">{t("whatsExcluded")}</h3>
                  <ul className="space-y-2">
                    {section.exclusions?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-black text-sm">
                        <XCircle
                          className="text-[#D3202D] mt-1 flex-shrink-0"
                          size={14}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : section.type === "list" ? (
                <ul className="space-y-2">
                  {section.content?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-black text-sm">
                      <ItemIcon
                        className={`${section.itemIconClass} mt-1 flex-shrink-0`}
                        size={14}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-black text-sm whitespace-pre-wrap">
                  {section.content}
                </div>
              )}
            </div>
          </details>
        )
      })}
    </div>
  )
}

export default TourAccordion
