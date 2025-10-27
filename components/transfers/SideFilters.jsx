import { useTransferStore } from "@/store/useTransferStore"
import { useTranslation } from "next-i18next"
import RouteSummary from "@/components/transfers/detail/RouteSummary"

function SideFilters() {
  const { searchParams } = useTransferStore()
  const { t } = useTranslation("transfer", "daytour")

  return (
    <div className="w-full md:w-[260px] space-y-4">
      {/* Location Summary Box */}
      <RouteSummary
        pickup={searchParams?.pickup}
        dropoff={searchParams?.dropoff}
        t={t}
        title={t("booking.pickup")}
      />

      {searchParams?.tripType === "round-trip" && (
        <RouteSummary pickup={searchParams?.dropoff} dropoff={searchParams?.pickup} t={t} title={t("booking.return")} />
      )}

      {/* Filters Section */}
      {/* <div className="bg-white border p-4 rounded-xl space-y-5 shadow-sm">
        <FilterSection
          title={t("filters.pricePerNight")}
          options={[
            { label: "SGD 0 - SGD 100", count: 120 },
            { label: "SGD 100 - SGD 500", count: 87 },
            { label: "SGD 500 +", count: 56 },
          ]}
          showMore={false}
        />

        <FilterSection
          title={t("filters.seats")}
          options={[
            { label: "0 - 2", count: 231 },
            { label: "3 - 4", count: 45, checked: true },
            { label: "5 - 6", count: 54 },
          ]}
        />

        <FilterSection
          title={t("filters.type")}
          options={[
            { label: t("filters.shared"), count: 231 },
            { label: t("filters.private"), count: 45, checked: true },
            { label: t("filters.rideshared"), count: 54 },
          ]}
        />

        <FilterSection
          title={t("filters.vehicle")}
          options={[
            { label: t("filters.sedan"), count: 231 },
            { label: t("filters.suv"), count: 45, checked: true },
            { label: t("filters.van"), count: 54 },
          ]}
        />

        <FilterSection
          title={t("filters.class")}
          options={[
            { label: t("filters.economy"), count: 231 },
            { label: t("filters.business"), count: 45 },
            { label: t("filters.luxury"), count: 54 },
          ]}
        />

        <FilterSection
          title={t("filters.starRating")}
          options={[
            { label: t("filters.1star"), count: 12 },
            { label: t("filters.2star"), count: 24 },
            { label: t("filters.3star"), count: 42 },
            { label: t("filters.4star"), count: 31 },
            { label: t("filters.5star"), count: 20 },
          ]}
        />
      </div> */}
    </div>
  )
}

export default SideFilters
