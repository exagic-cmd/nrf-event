import { useTranslation } from "next-i18next";
import FilterSection from "@/components/common/FilterSection";

const FilterSidebar = ({ mode, onFilterChange, resetKey, currentFilters = {} }) => {
  const { t } = useTranslation("daytour");

  const handleOptionClick = (title, label) => {
    onFilterChange(title, label);
  };

  return (
    <div className="w-full md:w-[223px] bg-white border p-2 rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 bg-gray-100 px-2 py-2 rounded-t-xl">
        <h3 className="text-lg font-semibold">{t("filterSidebar.title")}</h3>
        <button
          className="text-sm text-black hover:text-gray-600"
          onClick={() => onFilterChange(null, null, true)}
        >
          {t("filterSidebar.clearAll")}
        </button>
      </div>

      <FilterSection
        key={`reset-${resetKey}-preference`}
        resetKey={resetKey}
        title={t("filterSidebar.preferenceActivities.title")}
        options={[
          { label: t("filterSidebar.preferenceActivities.bonding") },
          { label: t("filterSidebar.preferenceActivities.selfDiscovery") },
          { label: t("filterSidebar.preferenceActivities.romantic") },
          { label: t("filterSidebar.preferenceActivities.adventure") },
          { label: t("filterSidebar.preferenceActivities.relaxing") },
          { label: t("filterSidebar.preferenceActivities.animals") },
          { label: t("filterSidebar.preferenceActivities.local") },
          { label: t("filterSidebar.preferenceActivities.family") },
        ]}
        onOptionClick={handleOptionClick}
        selectedOptions={currentFilters["Preference Activities"] || []}
        mode={mode}
      />

      <FilterSection
        key={`reset-${resetKey}-physical`}
        resetKey={resetKey}
        title={t("filterSidebar.physicalAspects.title")}
        options={[
          { label: t("filterSidebar.physicalAspects.someWalking") },
          { label: t("filterSidebar.physicalAspects.plentyWalking") },
          { label: t("filterSidebar.physicalAspects.hikingCycling") },
          { label: t("filterSidebar.physicalAspects.jungleTrekking") },
          { label: t("filterSidebar.physicalAspects.waterSports") },
        ]}
        onOptionClick={handleOptionClick}
        selectedOptions={currentFilters["Physical Aspects"] || []}
        mode={mode}
      />

      <FilterSection
        key={`reset-${resetKey}-inclusions`}
        resetKey={resetKey}
        title={t("filterSidebar.inclusionExclusion.title")}
        options={[
          { label: t("filterSidebar.inclusionExclusion.meals") },
          { label: t("filterSidebar.inclusionExclusion.guidedTour") },
          { label: t("filterSidebar.inclusionExclusion.audioTour") },
          { label: t("filterSidebar.inclusionExclusion.selfTour") },
          { label: t("filterSidebar.inclusionExclusion.returnTransfer") },
          { label: t("filterSidebar.inclusionExclusion.pickup") },
          { label: t("filterSidebar.inclusionExclusion.admissionTickets") },
          { label: t("filterSidebar.inclusionExclusion.familyTime") },
        ]}
        onOptionClick={handleOptionClick}
        selectedOptions={currentFilters["Inclusion Exclusion Activity"] || []}
        mode={mode}
      />

      <FilterSection
        key={`reset-${resetKey}-sdg`}
        resetKey={resetKey}
        title={t("filterSidebar.sdg.title")}
        options={[
          { label: t("filterSidebar.sdg.green") },
          { label: t("filterSidebar.sdg.animalFriendly") },
          { label: t("filterSidebar.sdg.localCommunity") },
          { label: t("filterSidebar.sdg.charity") },
        ]}
        showMore={false}
        onOptionClick={handleOptionClick}
        selectedOptions={currentFilters["SDG Preference"] || []}
        mode={mode}
      />

      <FilterSection
        key={`reset-${resetKey}-intensity`}
        resetKey={resetKey}
        title={t("filterSidebar.intensity.title")}
        options={[
          { label: t("filterSidebar.intensity.slow") },
          { label: t("filterSidebar.intensity.fast") },
          { label: t("filterSidebar.intensity.balanced") },
          { label: t("filterSidebar.intensity.extreme") },
        ]}
        onOptionClick={handleOptionClick}
        selectedOptions={currentFilters["Activity Intensity"] || []}
        mode={mode}
      />
    </div>
  );
};

export default FilterSidebar;
