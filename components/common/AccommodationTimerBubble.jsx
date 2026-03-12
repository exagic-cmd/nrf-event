import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { getFullImageUrl } from "@/utils/imageService";
import dynamic from "next/dynamic";
import ExpireHoldModal from "./ExpireHoldModal";
import { toast } from "react-toastify";
import { useRouter } from "next/router";


const CartDrawerContent = dynamic(() => import("./CartDrawerContent"));

const AccommodationTimerBubble = () => {
  const router = useRouter();
  const { items, extendHoldForItem, removeItem } = useCartStore();
  const { setDrawerContent, openDrawer } = useDrawerStore();
  const [timeNow, setTimeNow] = useState(Date.now());
  const [expiredQueue, setExpiredQueue] = useState([]);
  const [itemToExtend, setItemToExtend] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);
  const [processingKeys, setProcessingKeys] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setTimeNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Prevent detection during redirect
    if (sessionStorage.getItem("accommodationRedirecting")) return;
    
    // detect newly expired holds and queue them
    const now = Date.now();
    const accommodationHolds = items.filter((i) => i.type === "accommodation" && i.holdExpiresAt);
    const newlyExpired = accommodationHolds.filter((i) => i.holdExpiresAt <= now && !expiredQueue.includes(i.key) && (!modalItem || modalItem.key !== i.key) && !processingKeys.includes(i.key));
    if (newlyExpired.length > 0) {
      setExpiredQueue((q) => [...q, ...newlyExpired.map((i) => i.key)]);
    }
  }, [items, timeNow, expiredQueue, modalItem, processingKeys]);

  useEffect(() => {
    if (!modalItem && expiredQueue.length > 0) {
      const key = expiredQueue[0];
      const item = items.find((i) => i.key === key);
      // Don't show modal if we're in redirect flow
      if (item && !sessionStorage.getItem("accommodationRedirecting")) {
        setModalItem(item);
      } else if (!item) {
        setExpiredQueue((q) => q.slice(1));
      }
    }
  }, [expiredQueue, modalItem, items]);

  useEffect(() => {
    if (!itemToExtend) return;

    const extendLogic = async () => {
      const isStuba = !!itemToExtend.hotel_info?.stuba_response;
      
      console.log('🔄 Extend Logic triggered - isStuba:', isStuba, 'bookingData:', !!itemToExtend.bookingData);

      if (isStuba && itemToExtend.bookingData) {
        // Set flag to prevent modal from re-appearing during redirect
        setIsProcessingRedirect(true);
        // Set sessionStorage flag to prevent re-detection during redirect
        sessionStorage.setItem("accommodationRedirecting", "true");
        // Re-booking flow for Stuba
        console.log('📍 Stuba redirect flow initiated');
        const bookingData = { ...itemToExtend.bookingData, isRebooking: true, replaceKey: itemToExtend.key };
        sessionStorage.setItem("accommodationBookingData", JSON.stringify(bookingData));
        //toast.info("Your session expired. Please re-confirm to keep your room.");
        // Delay redirect to allow modal to close and toast to appear
        setTimeout(() => {
          console.log('🚀 Redirecting to booking page');
          // DO NOT remove flag here - let the new page clean it up
          router.push(`/accommodation/booking/${itemToExtend.bookingData.accommodationId}`);
          // Remove from processing keys AFTER redirect is initiated
          setProcessingKeys((k) => k.filter((key) => key !== itemToExtend.key));
          // Reset the trigger after redirect
          setItemToExtend(null);
        }, 500);
      } else {
        // Existing extend flow for non-stuba items
        console.log('⏱️ Standard extend flow for non-Stuba item');
        const res = await extendHoldForItem(itemToExtend.key);
        if (res.success) {
            toast.success("Reservation extended successfully for 7 minutes!");
        } else {
          toast.error(`Failed to extend hold: ${res.message || "Unknown error"}`);
        }
        // Remove from processing keys for non-Stuba items
        setProcessingKeys((k) => k.filter((key) => key !== itemToExtend.key));
        // Reset the trigger
        setItemToExtend(null);
      }
    };

    extendLogic();
  }, [itemToExtend, extendHoldForItem, router]);

  const accommodationHolds = items.filter((i) => i.type === "accommodation" && i.holdExpiresAt);
  if (!accommodationHolds || accommodationHolds.length === 0) return null;

  // Prefer the accommodation with the smallest positive remaining time.
  // If none have positive remaining, pick the one with the earliest expiry timestamp.
  const positive = accommodationHolds.filter((i) => i.holdExpiresAt - timeNow > 0);
  let active;
  if (positive.length > 0) {
    active = positive.reduce((min, cur) => {
      const rMin = min.holdExpiresAt - timeNow;
      const rCur = cur.holdExpiresAt - timeNow;
      return rCur < rMin ? cur : min;
    }, positive[0]);
  } else {
    active = accommodationHolds.reduce((min, cur) => (cur.holdExpiresAt < min.holdExpiresAt ? cur : min), accommodationHolds[0]);
  }

  const remaining = Math.max(0, active.holdExpiresAt - timeNow);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000).toString().padStart(2, "0");

  const img = getFullImageUrl(active.image) || getFullImageUrl(active.vehicle?.image) || "/default-hotel.png";

  return (
    <>
      <button
        onClick={() => {
          setDrawerContent(<CartDrawerContent />);
          openDrawer();
        }}
        className="fixed bottom-4 left-4 z-40 bg-white border shadow-md rounded-xl p-3 flex items-center gap-3 max-w-xs"
      >
        <img src={img} alt={active.productTitle || active.title} className="w-10 h-10 rounded-md object-cover border" />
        <div className="text-left">
          <div className="text-sm font-medium">{active.productTitle || active.title || "Accommodation"}</div>
          <div className="text-xs text-gray-600 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />  <span>{active?.hotel_info?.roomsDetails?.length} { active?.hotel_info?.roomsDetails?.length === 1 ? 'room' : 'rooms' } reserved — expires in <strong>{mins}:{secs}.</strong></span>
          </div>
        </div>
      </button>

      {modalItem && !isProcessingRedirect && (
        <ExpireHoldModal
          open={!!modalItem}
          item={modalItem}
          onClose={() => {
            // simply close modal but keep in queue so it can be shown again if needed
            setModalItem(null);
          }}
          onConfirm={() => {
            console.log('🔘 "Yes, reserve" button clicked - closing modal now');
            // Capture the item BEFORE any state changes
            const itemToExtendNow = modalItem;
            // Mark as processing to prevent re-queuing
            setProcessingKeys((k) => [...k, itemToExtendNow.key]);
            // FIRST: Remove from queue to prevent it from re-appearing
            setExpiredQueue((q) => q.filter((k) => k !== itemToExtendNow.key));
            // SECOND: Close the modal immediately
            setModalItem(null);
            // THIRD: Queue the extension logic for the next cycle
            setTimeout(() => {
              console.log('⏰ Processing extend after modal close');
              setItemToExtend(itemToExtendNow);
            }, 0);
          }}
          onRelease={async () => {
            removeItem(modalItem.key);
            toast.info("Accommodation removed from your cart.");
            setExpiredQueue((q) => q.filter((k) => k !== modalItem.key));
            setProcessingKeys((k) => k.filter((key) => key !== modalItem.key));
            setModalItem(null);
          }}
        />
      )}
    </>
  );
};

export default AccommodationTimerBubble;
