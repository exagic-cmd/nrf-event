import React, { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

function FilterSection({
  mode = "desktop",
  title,
  options = [],
  showMore = true,
  onOptionClick,
  resetKey,
  selectedOptions = [],
}) {
  const { t } = useTranslation("daytour");

  const isPriceFilter = title === t("filterSection.pricePerNight");

  const [showAllOptions, setShowAllOptions] = useState(false);
  const [checkedOptions, setCheckedOptions] = useState(selectedOptions);

  useEffect(() => {
    if (mode === "mobile") {
      setCheckedOptions(selectedOptions);
    }
  }, [selectedOptions, resetKey, mode]);

  useEffect(() => {
    if (mode === "desktop") {
      setCheckedOptions(selectedOptions);
    }
  }, [resetKey, mode]);

  const displayedOptions =
    showAllOptions || options.length <= 3
      ? options
      : options.slice(0, 3);

  const handleCheckboxChange = (label) => {
    let updated = [];

    if (checkedOptions.includes(label)) {
      updated = checkedOptions.filter((item) => item !== label);
    } else {
      updated = [...checkedOptions, label];
    }

    setCheckedOptions(updated);

    // On desktop, call parent immediately
    if (mode === "desktop" && onOptionClick) {
      onOptionClick(title, label);
    }
    // On mobile, call parent only if you want live preview (usually you don't)
  };

  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">{title}</h4>

      <ul className="space-y-1 text-sm">
        {displayedOptions.map(({ label, count }) => (
          <li key={label} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checkedOptions.includes(label)}
              onChange={() => handleCheckboxChange(label)}
              className="w-4 h-4 rounded-sm bg-white checked:bg-[#FE6F4F] appearance-none border border-gray-300 checked:border-[#FE6F4F] relative cursor-pointer
              before:content-['✓'] before:absolute before:left-[2px] before:top-[-2px] before:text-white before:text-[12px] before:opacity-0 checked:before:opacity-100"
            />
            <span>{label}</span>
            {count !== undefined && (
              <span className="ml-auto text-xs text-gray-400">{count}</span>
            )}
          </li>
        ))}
      </ul>

      {isPriceFilter && (
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">{t("filterSection.min")}</label>
            <input
              type="number"
              placeholder="0"
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#FE6F4F]"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">{t("filterSection.max")}</label>
            <input
              type="number"
              placeholder="500+"
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#FE6F4F]"
            />
          </div>
        </div>
      )}

      {showMore && !isPriceFilter && options.length > 3 && (
        <p
          className="text-xs text-[#FE6F4F] mt-1 cursor-pointer"
          onClick={() => setShowAllOptions(!showAllOptions)}
        >
          {showAllOptions ? t("filterSection.viewLess") : t("filterSection.viewMore")}
        </p>
      )}
    </div>
  );
}

export default FilterSection;
