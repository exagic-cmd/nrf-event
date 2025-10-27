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
  const { openDrawer, setDrawerContent } = useDrawerStore();
  const [show, setShow] = useState(false);


  useEffect(() => {
  const isCheckoutPage = router.pathname.includes("checkout") || router.pathname.includes("paynow");
  setShow(items.length > 0 && !isCheckoutPage);
}, [items, router.pathname]);


  useEffect(() => {
    setShow(items.length > 0);
  }, [items]);

  if (!show) return null;

  const handleClick = () => {
    setDrawerContent(<CartDrawerContent />);
    openDrawer();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-[70px] border-b border-black right-5 z-40 bg-white border shadow-md rounded-full p-3 flex items-center justify-center hover:bg-gray-100 transition"
    >
      <div className="relative">
         <ShoppingCart size={24} className="text-[#CC9A55]" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-orange-100 text-[#CC9A55] font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
            {items.length}
          </span>
        )}
      </div>
    </button>
  );
};

export default CartBubble;
