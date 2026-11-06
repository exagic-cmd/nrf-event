import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const CartDrawerContent = dynamic(() => import("./CartDrawerContent"));

const CartBubble = () => {
  const router = useRouter();
  const { items } = useCartStore();
  const { openDrawer, setDrawerContent, justAdded, setJustAdded } = useDrawerStore();
  const [show, setShow] = useState(false);
  const [shaking, setShaking] = useState(false);


  useEffect(() => {
  const isCheckoutPage = router.pathname.includes("checkout") || router.pathname.includes("paynow");
  setShow(items.length > 0 && !isCheckoutPage);
}, [items, router.pathname]);


  useEffect(() => {
    setShow(items.length > 0);
  }, [items]);

  useEffect(() => {
    if (!justAdded) return;
    setShaking(true);
    const timer = setTimeout(() => {
      setShaking(false);
      setJustAdded(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [justAdded, setJustAdded]);

  if (!show) return null;

  const handleClick = () => {
    setDrawerContent(<CartDrawerContent />);
    openDrawer();
  };

  return (
    <div className="fixed bottom-[30px] right-5 z-40">
      {/* Ripple rings — continuous pulse while items are in the cart */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full bg-primary/30 animate-ping"
        style={{ animationDuration: "2.6s", animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute inset-0 rounded-full bg-primary/20 animate-ping"
        style={{ animationDuration: "2.6s", animationDelay: "1.3s", animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
        aria-hidden="true"
      />

      <button
        onClick={handleClick}
        aria-label={`Open cart (${items.length} item${items.length === 1 ? "" : "s"})`}
        className={`relative bg-surface border border-b-black shadow-md rounded-full p-3 flex items-center justify-center hover:bg-muted transition ${
          shaking ? "animate-cart-shake" : ""
        }`}
      >
        <div className="relative">
          <ShoppingCart size={24} className="text-primary" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary/30 text-primary font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              {items.length}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

export default CartBubble;
