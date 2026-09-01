// components/ui/SideDrawer.jsx
import { useEffect } from "react";
import { useTranslation } from "next-i18next"; 

const SideDrawer = ({ isOpen, onClose, title = "Side Drawer", children }) => {
    const { t } = useTranslation("common"); 
  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-background text-foreground z-50 shadow-lg transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{t('cart')}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">{children}</div>
      </div>
    </>
  );
};

export default SideDrawer;
