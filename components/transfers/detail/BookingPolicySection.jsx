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
 const { tieredPricingData, bookedProductDetail,fetchTermsConditions, fetchCancellationPolicy } = useProductStore();
 
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [cancellationText, setCancellationText] = useState("");

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

  useEffect(() => {
    if (productId) {
      fetchCancellationPolicy(productId, languageId).then((res) =>
        setCancellationText(res?.data?.cancellationpolicies?.description || "")
      );
    }
  }, [productId, languageId, fetchCancellationPolicy]);

  if (loading) {
    return (
      <div className="p-4 text-muted-foreground">
        {t("booking_section.loading")}
      </div>
    );
  }
  return (
    <div className="bg-surface rounded p-0" id="policy">
        {cancellationText && (
              <p className="md:text-sm text-sm py-2 text-foreground whitespace-pre-line">{cancellationText}</p>
            )}
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
                ? "bg-primary border-primary"
                : "border-border bg-surface"
            }`}
          >
            {isSelected && <Check size={14} className="text-white font-semibold" />}
          </span>
        </label>

        {/* Label Text */}
        <label
          htmlFor="termsCheckbox"
          className="text-foreground text-sm md:text-base"
        >
          {t("terms_conditions.accept_text")}{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setOpenModal(true);
            }}
            className="text-primary underline"
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
          <div className="bg-surface rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-muted-foreground"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {t("terms_conditions.title")}
            </h2>
            <div className="max-h-80 overflow-y-auto text-foreground whitespace-pre-line text-sm leading-relaxed">
              {terms}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setOpenModal(false)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary-hover"
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
