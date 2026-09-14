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
  isPackageTour = false,
  packageData = {},
}) => {
  if (!open) return null;
  const { t } = useTranslation("daytour");
  // This logic is made more robust to prevent errors when pricingList is empty.
  // It avoids calling Math.min/max on an empty array, which would result in Infinity/-Infinity.
  const paxList =
    pricingList
      ?.flatMap((p) => [Number(p.min_pax), Number(p.max_pax)])
      .filter((p) => !isNaN(p)) || [];

  const minPax = paxList.length > 0 ? Math.min(...paxList) : 1;
  const maxPax = paxList.length > 0 ? Math.max(...paxList) : 20; // Using a sensible default max
const [localAdults, setLocalAdults] = useState(adults);
const [localChild, setLocalChild] = useState(child);

const [localAdultsSharing, setLocalAdultsSharing] = useState(packageData.twin_sharing || 0);
const [localAdultsPrivate, setLocalAdultsPrivate] = useState(packageData.single_sharing || 0);
const [localChildWithBed, setLocalChildWithBed] = useState(packageData.child_with_bed || 0);
const [localChildWithoutBed, setLocalChildWithoutBed] = useState(packageData.child_without_bed || 0);

const [paxError, setPaxError] = useState("")

const totalPax = isPackageTour 
  ? (localAdultsSharing + localAdultsPrivate + localChildWithBed + localChildWithoutBed)
  : (localAdults + localChild);

const localAdultsSum = isPackageTour ? (localAdultsSharing + localAdultsPrivate) : localAdults;

 const handleInc = (field) => {
  if (totalPax >= maxPax) return;

  if (field === "adults") setLocalAdults(prev => prev + 1);
  if (field === "child") setLocalChild(prev => prev + 1);

  if (field === "twin_sharing") setLocalAdultsSharing(prev => prev + 1);
  if (field === "single_sharing") setLocalAdultsPrivate(prev => prev + 1);
  if (field === "child_with_bed") setLocalChildWithBed(prev => prev + 1);
  if (field === "child_without_bed") setLocalChildWithoutBed(prev => prev + 1);
};

const handleDec = (field) => {
  if (field === "adults" && localAdults > 1) setLocalAdults(prev => prev - 1);
  if (field === "child" && localChild > 0) setLocalChild(prev => prev - 1);

  if (field === "twin_sharing" && localAdultsSharing > 0) setLocalAdultsSharing(prev => prev - 1);
  if (field === "single_sharing" && localAdultsPrivate > 0) setLocalAdultsPrivate(prev => prev - 1);
  if (field === "child_with_bed" && localChildWithBed > 0) setLocalChildWithBed(prev => prev - 1);
  if (field === "child_without_bed" && localChildWithoutBed > 0) setLocalChildWithoutBed(prev => prev - 1);
};


  useEffect(() => {
  if (open) {
    const initialTwin = packageData.twin_sharing || 0;
    const initialSingle = packageData.single_sharing || 0;
    const initialCWB = packageData.child_with_bed || 0;
    const initialCWOB = packageData.child_without_bed || 0;
    const currentTotal = initialTwin + initialSingle + initialCWB + initialCWOB;

    setLocalAdults(adults);
    setLocalChild(child);
    setLocalAdultsSharing(isPackageTour && currentTotal === 0 ? minPax : initialTwin);
    setLocalAdultsPrivate(initialSingle);
    setLocalChildWithBed(initialCWB);
    setLocalChildWithoutBed(initialCWOB);
    setPaxError("");
  }
}, [open, adults, child, packageData, minPax, isPackageTour]);

const handleCancel = () => {
  onClose();
};
const handleApply = () => {
  // Rule 1: at least one adult
  if (localAdultsSum < 1) {
    setPaxError("At least one adult is required.");
    return;
  }

  // Rule 2: Ensure total passengers minPax
  if (totalPax < minPax) {
    setPaxError(`Minimum ${minPax} passengers required.`);
    return;
  }
  setPaxError("");
  if (isPackageTour) {
    onApply({
      adults: localAdultsSharing + localAdultsPrivate,
      child: localChildWithBed + localChildWithoutBed,
      twin_sharing: localAdultsSharing,
      single_sharing: localAdultsPrivate,
      child_with_bed: localChildWithBed,
      child_without_bed: localChildWithoutBed
    });
  } else {
    onApply({ adults: localAdults, child: localChild });
  }
};



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 px-4">
      <div className="bg-card text-card-foreground rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border">
        <h2 className="text-lg font-semibold text-primary mb-4">{t('selectParticipants')}</h2>
        
        <div className="text-xs flex items-center gap-1 text-muted-foreground mb-4">
          {t('pax')} ({t('min')} {minPax} <MinusIcon size={12} /> {t('max')} {maxPax})
        </div>

        {!isPackageTour ? (
          <>
            {/* Adults */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="text-base font-medium text-foreground">{t('adultsModal')}</div>
              <div className="flex items-center gap-2">
                <button
                  className="w-9 h-9 rounded-full bg-muted text-xl font-bold flex items-center justify-center hover:bg-secondary transition"
                  onClick={() => handleDec("adults")}
                  disabled={localAdults <= 1}
                  type="button"
                >-</button>
                <span className="w-6 text-center font-medium">{localAdults}</span>
                <button
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center transition"
                  onClick={() => handleInc("adults")}
                  disabled={totalPax >= maxPax}
                  type="button"
                >+</button>
              </div>
            </div>

            {/* Child */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="text-base font-medium text-foreground">{t('childrenModal')}</div>
              <div className="flex items-center gap-2">
                <button
                  className="w-9 h-9 rounded-full bg-muted text-xl font-bold flex items-center justify-center hover:bg-secondary transition"
                  onClick={() => handleDec("child")}
                  disabled={localChild <= 0}
                  type="button"
                >-</button>
                <span className="w-6 text-center font-medium">{localChild}</span>
                <button
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center transition"
                  onClick={() => handleInc("child")}
                  disabled={totalPax >= maxPax}
                  type="button"
                >+</button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {[
              { label: t("twinSharing"), field: "twin_sharing", value: localAdultsSharing },
              { label: t("singleSharing"), field: "single_sharing", value: localAdultsPrivate },
              { label: t("childWithBed"), field: "child_with_bed", value: localChildWithBed },
              { label: t("childWithoutBed"), field: "child_without_bed", value: localChildWithoutBed },
            ].map((item) => (
              <div key={item.field} className="flex items-center justify-between gap-4">
                <div className="text-base font-medium text-foreground">{item.label}</div>
                <div className="flex items-center gap-2">
                  <button
                    className="w-9 h-9 rounded-full bg-muted text-xl font-bold flex items-center justify-center hover:bg-secondary transition"
                    onClick={() => handleDec(item.field)}
                    disabled={item.value <= 0}
                    type="button"
                  >-</button>
                  <span className="w-6 text-center font-medium">{item.value}</span>
                  <button
                    className="w-9 h-9 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center transition"
                    onClick={() => handleInc(item.field)}
                    disabled={totalPax >= maxPax}
                    type="button"
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Errors */}
        {(adultsError || childError || paxError) && (
          <div className="text-xs text-destructive mb-2 mt-2">
            {adultsError || childError || paxError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-secondary transition"
            onClick={handleCancel}
            type="button"
          >
           {t('cancel')}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium transition"
            disabled={!!adultsError || !!childError || totalPax < minPax}
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
