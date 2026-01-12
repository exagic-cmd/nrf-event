import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { getFullImageUrl } from "@/utils/imageService";
import dynamic from "next/dynamic";
import ExpireHoldModal from "./ExpireHoldModal";
import { toast } from "react-toastify";

const CartDrawerContent = dynamic(() => import("./CartDrawerContent"));

const AccommodationTimerBubble = () => {
  const { items, extendHoldForItem, removeItem } = useCartStore();
  const { setDrawerContent, openDrawer } = useDrawerStore();
  const [timeNow, setTimeNow] = useState(Date.now());
  const [expiredQueue, setExpiredQueue] = useState([]);
  const [modalItem, setModalItem] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTimeNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // detect newly expired holds and queue them
    const now = Date.now();
    const accommodationHolds = items.filter((i) => i.type === "accommodation" && i.holdExpiresAt);
    const newlyExpired = accommodationHolds.filter((i) => i.holdExpiresAt <= now && !expiredQueue.includes(i.key) && (!modalItem || modalItem.key !== i.key));
    if (newlyExpired.length > 0) {
      setExpiredQueue((q) => [...q, ...newlyExpired.map((i) => i.key)]);
    }
  }, [items, timeNow, expiredQueue, modalItem]);

  useEffect(() => {
    if (!modalItem && expiredQueue.length > 0) {
      const key = expiredQueue[0];
      const item = items.find((i) => i.key === key);
      if (item) setModalItem(item);
      else setExpiredQueue((q) => q.slice(1));
    }
  }, [expiredQueue, modalItem, items]);

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
            <Clock className="w-3 h-3" />  <span>{active?.hotel_info?.roomsDetails?.length} rooms on hold — expires in <strong>{mins}:{secs}.</strong></span>
          </div>
        </div>
      </button>

      {modalItem && (
        <ExpireHoldModal
          open={!!modalItem}
          item={modalItem}
          onClose={() => {
            // simply close modal but keep in queue so it can be shown again if needed
            setModalItem(null);
          }}
          onExtend={async () => {
            const res = await extendHoldForItem(modalItem.key);
            if (res.success) {
              toast.success("Hold extended successfully for 7 minutes!");
            } else {
              toast.error(`Failed to extend hold: ${res.message || "Unknown error"}`);
            }
            setExpiredQueue((q) => q.filter((k) => k !== modalItem.key));
            setModalItem(null);
          }}
          onRelease={async () => {
            removeItem(modalItem.key);
            toast.info("Accommodation released from your cart.");
            setExpiredQueue((q) => q.filter((k) => k !== modalItem.key));
            setModalItem(null);
          }}
        />
      )}
    </>
  );
};

export default AccommodationTimerBubble;
