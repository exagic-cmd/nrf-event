import { Globe } from "lucide-react";
import { useTranslation } from "next-i18next";

export function Preloader() {
  const { t } = useTranslation("common");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">

        {/* Generic loading icon */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary-foreground" />

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />

          <Globe
            size={34}
            strokeWidth={1.8}
            className="text-primary"
          />
        </div>

        {/* Loading text */}
        <p className="mt-5 text-lg font-semibold text-gray-700">
          {t("loading") || "Loading..."}
        </p>

        

      </div>
    </div>
  );
}