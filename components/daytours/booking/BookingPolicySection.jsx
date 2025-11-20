import React, { useEffect, useState } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useTranslation } from "next-i18next";
import useLanguageStore from "@/store/useLanguageStore";

export default function BookingPolicySection({
  selectedOptions,
  setAvailablePolicyIds,
  setSelectedOptions,
  productId,
  errors,
  setErrors,
}) {
  const { t } = useTranslation("daytour");
  const { languageId } = useLanguageStore.getState();
  const { fetchBookingNotes, fetchCancellationPolicy, fetchTermsConditions } =
    useProductStore();

  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [cancellation, setCancellation] = useState("");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(null); // which modal is open

  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    Promise.all([
      fetchBookingNotes(productId, languageId).then((res) =>
        setNotes(res?.data?.bookingnotes?.description || "")
      ),
      fetchTermsConditions(productId, languageId).then((res) =>
        setTerms(res?.data?.termconditions?.description || "")
      ),
      fetchCancellationPolicy(productId, languageId).then((res) =>
        setCancellation(res?.data?.cancellationpolicies?.description || "")
      ),
    ]).finally(() => setLoading(false));
  }, [productId, languageId]);

  const allOptions = [
    {
      title: t("terms_conditions.title"),
      description: terms,
      label: t("terms_conditions.label"),
      id: "terms_conditions",
      required: true,
    },
  
  ];

  const options = allOptions.filter((opt) => opt.description?.trim() !== "");

  useEffect(() => {
    if (setAvailablePolicyIds) {
      setAvailablePolicyIds(["terms_conditions"]);
    }
  }, [terms]);

  const handleSelect = (checked, id) => {
    let updated = checked
      ? [...selectedOptions, id]
      : selectedOptions.filter((i) => i !== id);
    setSelectedOptions(updated);

    const requiredIds = ["terms_conditions"];
    const allAccepted = requiredIds.every((rid) => updated.includes(rid));

    if (allAccepted && setErrors) {
      setErrors(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-500">{t("booking_section.loading")}</div>;
  }

  return (
    <div className="  oerflow-hidden p-1 space-y-5">
      {options.map((opt) => {
        const isSelected = selectedOptions.includes(opt.id);
        return (
          <div key={opt.id}>
            {opt.required ? (
             
              <div className="flex items-start gap-3">
                <label
                  htmlFor={`check-${opt.id}`}
                  className="relative flex items-center cursor-pointer mt-1"
                >
                  <input
                    type="checkbox"
                    id={`check-${opt.id}`}
                    checked={isSelected}
                    onChange={(e) => handleSelect(e.target.checked, opt.id)}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <span
                    className={`flex items-center justify-center w-5 h-5 border-2 rounded-sm transition-all duration-200 ${
                      isSelected
                        ? "bg-[#D3202D] border-[#D3202D]"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <Check size={14} className="text-white font-semibold" />
                    )}
                  </span>
                </label>

                <label
                  htmlFor={`check-${opt.id}`}
                  className="text-gray-800 text-sm md:text-base leading-relaxed"
                >
                  {t("terms_conditions.accept_text")}{" "}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenModal(opt.id);
                    }}
                    className="text-[#D3202D] underline"
                  >
                    {opt.title}
                  </button>{" "}
                  *
                </label>
              </div>
            ) : (
            
              <details className="group text-gray-700">
                <summary className="flex items-center justify-between cursor-pointer list-none select-none text-sm md:text-base font-medium">
                  <span>{opt.title}</span>
                  <ChevronDown
                    className="text-gray-400 transition-transform duration-300 group-open:rotate-180"
                    size={18}
                  />
                </summary>
                <div className="mt-3 pr-1 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {opt.description}
                  <div className="mt-2 text-xs text-gray-500 italic">
                    {opt.label}
                  </div>
                </div>
              </details>
            )}
          </div>
        );
      })}

     
      {errors && (
        <div className="text-red-500 text-sm mt-2 font-medium">
          {t("booking_section.error_required")}
        </div>
      )}

    
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setOpenModal(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {options.find((o) => o.id === openModal)?.title}
            </h2>
            <div className="max-h-80 overflow-y-auto text-gray-800 whitespace-pre-line text-sm leading-relaxed">
              {options.find((o) => o.id === openModal)?.description}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setOpenModal(null)}
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
