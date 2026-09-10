import { FileText, QrCode, Calendar, Users, Loader2, Ticket } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { Voucher } from "@/store/useVoucherStore";
import VoucherDetailModal from "./VoucherDetailModal";

interface VouchersListProps {
  vouchers: Voucher[];
  loading: boolean;
}

const VouchersList = ({ vouchers, loading }: VouchersListProps) => {
  const { t } = useTranslation("order");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl shadow-sm p-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" /> {/* No static text here */}
          <p className="text-muted-foreground text-sm">{t("loading_vouchers")}</p>
        </div>
      </div>
    );
  }

  if (!vouchers || vouchers.length === 0) {
    return null;
  }

  const capitalize = (str: string) => {
    if (!str) return str;
    // If it's something like "qr Code", handle it gracefully
    if (str.toLowerCase().startsWith('qr')) return 'QR' + str.slice(2); // This is a specific formatting, not a translatable string
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <Ticket className="w-6 h-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("my_vouchers")}
          </h2>
        </div>

        {/* Vouchers Grid - 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vouchers.map((voucher) => (
            <div
              key={voucher.voucher_id}
              onClick={() => setSelectedVoucher(voucher)}
              className="group relative cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Ticket Container */}
              <div className="relative flex bg-white shadow-lg hover:shadow-2xl transition-shadow" style={{ borderRadius: '0 12px 12px 0', overflow: 'visible' }}>
                {/* Top Cut - at golden/white junction */}
                <div className="absolute w-4 h-4 bg-black rounded-full" style={{ left: '64px', top: '-8px', transform: 'translateX(-50%)', zIndex: 20 }} />

                {/* Bottom Cut - at golden/white junction */}
                <div className="absolute w-4 h-4 bg-black rounded-full" style={{ left: '64px', bottom: '-8px', transform: 'translateX(-50%)', zIndex: 20 }} />

                {/* Left Side - Colored Strip */}
                <div className="relative flex-shrink-0 w-16 bg-primary flex flex-col items-center justify-center py-5 px-2">
                  {/* Type Label */}
                  <div className="text-center flex-1 flex items-center justify-center">
                    <p className="text-base font-extrabold text-white uppercase tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                      {voucher.type === "voucher" ? t("voucher") : t("qr_code")}
                    </p>
                  </div>
                </div>

                {/* Right Side - Voucher Details */}
                <div className="flex-1 p-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-3">
                      <h3 className="text-lg font-bold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {capitalize(voucher.title)}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {capitalize(voucher.redemption?.sku?.description || voucher.itinerary.product_title)}
                      </p>
                    </div>

                    {/* Status Badge - Only for QR with redemption */}
                    {voucher.type === "qr" && voucher.redemption && (
                      <div className="flex-shrink-0">
                        <span className="inline-block px-3 py-1.5 bg-[#CC9A55]/15 text-[#CC9A55] border border-[#CC9A55]/40 rounded-md text-xs font-bold uppercase tracking-wide">
                          {voucher.redemption.status === "Paid" ? t("confirmed") : capitalize(voucher.redemption.status)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#CC9A55] flex-shrink-0" />
                      <span className="text-sm text-gray-700 font-medium">
                        {new Date(voucher.itinerary.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#CC9A55] flex-shrink-0" />
                      <span className="text-sm text-gray-700 font-medium">
                        {voucher.itinerary.adults} {t("adult")}{voucher.itinerary.adults > 1 ? "" : ""}
                        {voucher.itinerary.children > 0 &&
                          `, ${voucher.itinerary.children} ${voucher.itinerary.children > 1 ? t("children") : t("child")}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 border-2 border-[#CC9A55] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </>
  );
};

export default VouchersList;
