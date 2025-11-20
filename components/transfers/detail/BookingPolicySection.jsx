import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useTranslation } from "next-i18next";
import useLanguageStore from "@/store/useLanguageStore";

function BookingPolicySection({
  selectedOptions,
  setSelectedOptions,
  productId,
  errors,
  setErrors,
}) {
  const { t } = useTranslation("daytour");
  const { languageId } = useLanguageStore.getState();
  const { fetchTermsConditions } = useProductStore();

  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    fetchTermsConditions(productId, 1)
      .then((res) => {
        setTerms(res?.data?.termconditions?.description || "");
      })
      .finally(() => setLoading(false));
  }, [productId, languageId]);

  const optionId = "terms_conditions";
  const isSelected = selectedOptions.includes(optionId);

  const handleSelect = (checked) => {
    let updated = checked
      ? [...selectedOptions, optionId]
      : selectedOptions.filter((i) => i !== optionId);

    setSelectedOptions(updated);

    if (checked && setErrors) {
      setErrors(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-gray-500">
        {t("booking_section.loading")}
      </div>
    );
  }

  return (
    <div className="bg-white rounded p-0">
      <div className="flex items-center gap-3">
        {/* ✅ Custom Checkbox */}
        <label
          htmlFor="termsCheckbox"
          className="relative flex items-center cursor-pointer"
        >
          <input
            type="checkbox"
            id="termsCheckbox"
            checked={isSelected}
            onChange={(e) => handleSelect(e.target.checked)}
            className="absolute opacity-0 w-0 h-0"
          />
          <span
            className={`flex items-center justify-center w-5 h-5 border-2 rounded-sm transition-all duration-200 
            ${
              isSelected
                ? "bg-[#D3202D] border-[#D3202D]"
                : "border-gray-300 bg-white"
            }`}
          >
            {isSelected && <Check size={14} className="text-white font-semibold" />}
          </span>
        </label>

        {/* Label Text */}
        <label
          htmlFor="termsCheckbox"
          className="text-gray-800 text-sm md:text-base"
        >
          {t("terms_conditions.accept_text")}{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setOpenModal(true);
            }}
            className="text-[#D3202D] underline"
          >
            {t("terms_conditions.title")}
          </a>{" "}
          *
        </label>
      </div>

      {/* Error Message */}
      {errors && (
        <div className="text-red-500 text-sm mt-3 font-medium">
          {t("booking_section.error_required")}
        </div>
      )}

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {t("terms_conditions.title")}
            </h2>
            <div className="max-h-80 overflow-y-auto text-gray-800 whitespace-pre-line text-sm leading-relaxed">
              {terms}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setOpenModal(false)}
                className="bg-[#D3202D] text-white px-4 py-2 rounded-md text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPolicySection;
