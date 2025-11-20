import { MinusIcon } from "lucide-react";
import {useState,useEffect} from "react"
import { useTranslation } from "next-i18next"
const PassengerModal = ({
  open,
  adults,
  child,
  pricingList,
  adultsError,
  childError,
  onClose,
  onApply,
}) => {
  if (!open) return null;
  const { t } = useTranslation("daytour");
  // This logic is made more robust to prevent errors when pricingList is empty.
  // It avoids calling Math.min/max on an empty array, which would result in Infinity/-Infinity.
  const paxList =
    pricingList
      ?.flatMap((p) => [p.min_pax, p.max_pax])
      .filter((p) => typeof p === "number") || [];

  const minPax = paxList.length > 0 ? Math.min(...paxList) : 1;
  const maxPax = paxList.length > 0 ? Math.max(...paxList) : 10; // Using a sensible default max
const [localAdults, setLocalAdults] = useState(adults);
const [localChild, setLocalChild] = useState(child);
const [updated, setUpdated] = useState({ adults: 1, child: 0 });
const [paxError, setPaxError] = useState("")
 const handleInc = (field) => {
  if (localAdults + localChild >= maxPax) return;

  if (field === "adults") setLocalAdults(prev => prev + 1);
  if (field === "child") setLocalChild(prev => prev + 1);
};

const handleDec = (field) => {
  if (field === "adults" && localAdults > 1) setLocalAdults(prev => prev - 1);
  if (field === "child" && localChild > 0) setLocalChild(prev => prev - 1);
};


  useEffect(() => {
  if (open) {
    setLocalAdults(adults);
    setLocalChild(child);
  }
}, [open, adults, child]);

const handleCancel = () => {
  onClose();
};
const handleApply = () => {
  const totalPax = localAdults + localChild;

  // Rule 1: at least one adult
  if (localAdults < 1) {
    setPaxError("At least one adult is required.");
    return;
  }

  // Rule 2: Ensure total passengers minPax
  if (totalPax < minPax) {
    setPaxError(`Minimum ${minPax} passengers required.`);
    return;
  }
  setPaxError("");
  onApply(localAdults, localChild);
};



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold text-[#D3202D] mb-4">{t('selectParticipants')}</h2>
        
        <div className="text-xs flex items-center gap-1 text-gray-700 mb-4">
          {t('pax')} ({t('min')} {minPax} <MinusIcon size={12} /> {t('max')} {maxPax})
        </div>

        {/* Adults */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="text-base font-medium text-gray-800">{t('adultsModal')}</div>
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-full bg-gray-200 text-xl font-bold flex items-center justify-center hover:bg-gray-300 transition"
              onClick={() => handleDec("adults")}
disabled={localAdults <= 1}
              type="button"
            >-</button>
            <span className="w-6 text-center font-medium">{localAdults}</span>
            <button
              className="w-9 h-9 rounded-full bg-[#D3202D] text-white text-xl font-bold flex items-center justify-center transition"
              onClick={() => handleInc("adults")}
              disabled={localAdults + localChild >= maxPax}
              type="button"
            >+</button>
          </div>
        </div>

        {/* Child */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="text-base font-medium text-gray-800">{t('childrenModal')}</div>
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-full bg-gray-200 text-xl font-bold flex items-center justify-center hover:bg-gray-300 transition"
              onClick={() => handleDec("child")}
              disabled={localChild <= 0}
              type="button"
            >-</button>
            <span className="w-6 text-center font-medium">{localChild}</span>
            <button
              className="w-9 h-9 rounded-full bg-[#D3202D] text-white text-xl font-bold flex items-center justify-center  transition"
              onClick={() => handleInc("child")}
              disabled={localAdults + localChild >= maxPax}
              type="button"
            >+</button>
          </div>
        </div>

        {/* Errors */}
        {(adultsError || childError) && (
          <div className="text-xs text-red-500 mb-2">
            {adultsError || childError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            onClick={handleCancel}
            type="button"
          >
           {t('cancel')}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-[#D3202D] text-white font-medium transition"
           disabled={!!adultsError || !!childError || (localAdults + localChild < minPax)}
            onClick={handleApply}
            type="button"
          >
            {t('apply')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerModal;
