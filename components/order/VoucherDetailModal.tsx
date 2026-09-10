import {
  X,
  Download,
  ExternalLink,
  QrCode,
  Calendar,
  Users,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState, useEffect } from "react";
import { Voucher } from "@/store/useVoucherStore";

interface VoucherDetailModalProps {
  voucher: Voucher;
  onClose: () => void;
}

const VoucherDetailModal = ({ voucher, onClose }: VoucherDetailModalProps) => {
  const { t } = useTranslation("order", "common");
  const [downloading, setDownloading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const detectBrowser = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    return {
      isIOS: /iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && navigator.maxTouchPoints > 1),
      isAndroid: /Android/.test(ua),
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
    };
  };

  const handleDownload = async () => {
    if (!voucher.file_path) return;

    setDownloading(true);
    const browser = detectBrowser();
    const url = voucher.file_path;
    const filename = `${voucher.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;

    try {
      if (browser.isIOS) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (browser.isMobile) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          if (!document.hidden) {
            window.open(url, "_blank");
          }
        }, 500);
      } else {
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/pdf" },
          });

          if (!response.ok) throw new Error("Network response was not ok");

          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = filename;
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();

          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          }, 100);
        } catch (fetchError) {
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned":
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case "redeemed":
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case "expired":
        return <XCircle className="w-4 h-4 text-primary" />;
      default:
        return <AlertCircle className="w-4 h-4 text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    return "text-primary bg-primary/10 border border-primary/30";
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 sm:p-4"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, margin: 0 }}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl max-w-sm w-full my-4 sm:my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="bg-primary text-primary-foreground p-3 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-start gap-2.5 pr-8">
            {voucher.type === "voucher" ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                {voucher.redemption?.sku?.image ? (
                  <img
                    src={voucher.redemption.sku.image}
                    alt={voucher.redemption.sku.description}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </div>
            )}

            <div className="flex-1">
              <p className="text-xs text-white/80 mb-0.5">
                {voucher.type === "voucher" ? t("pdf_voucher") : t("qr_code_voucher")}
              </p>
              <h2 className="text-base sm:text-lg font-bold leading-tight">{voucher.title}</h2>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 p-3 space-y-2.5 text-sm" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Booking Details */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
              {t("booking_details")}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t("service_date")}</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {formatDate(voucher.itinerary.date)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t("passengers")}</p>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-primary" />
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {voucher.itinerary.adults}{t("adult_short")}
                    {voucher.itinerary.children > 0 && `, ${voucher.itinerary.children}${t("child_short")}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code or PDF Download */}
          {voucher.type === "qr" && voucher.qr_link ? (
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2.5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t("qr_code")}
              </h3>

              <div className="bg-surface p-3 rounded-lg border-2 border-primary">
                <div className="w-full aspect-square flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                      voucher.qr_link
                    )}`}
                    alt="QR Code"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>

              {voucher.redemption && (
                <p className="text-lg text-center text-primary font-mono font-bold mt-2">
                  {voucher.redemption.code}
                </p>
              )}
            </div>
          ) : (
            voucher.type === "voucher" &&
            voucher.file_path && (
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2.5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2"> {/* No static text here */}
                  {t("download_voucher")}
                </h3>

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full px-3 py-2 bg-[#CC9A55] text-white rounded-lg hover:bg-[#B88A45] transition-colors flex items-center justify-center gap-2 text-xs font-medium disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t("downloading")}
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      {t("download_pdf")}
                    </>
                  )}
                </button>
              </div>
            )
          )}

          {/* Redemption Details */}
          {voucher.redemption && (
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2.5 space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("redemption_details")}
              </h3>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(voucher.redemption.status)} {/* No static text here */}
                  <span className="text-xs text-gray-600 dark:text-gray-300">{t("status")}</span>
                </div> {/* No static text here */}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    voucher.redemption.status
                  )}`}
                >
                  {t(voucher.redemption.status.toLowerCase())}
                </span>
              </div>

              {/* Valid Days */}
              {voucher.redemption.sku.valid_days && voucher.redemption.sku.valid_days.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("valid_days")}</p>
                  <div className="flex flex-wrap gap-1">
                    {voucher.redemption.sku.valid_days.map((day) => (
                      <span
                        key={day}
                        className="px-2 py-0.5 bg-[#CC9A55]/10 text-[#CC9A55] rounded-full text-xs font-medium"
                      >
                        {day.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid Time */}
              {voucher.redemption.sku.is_time_specific && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-[#CC9A55]" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("valid_time")}</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatTime(voucher.redemption.sku.valid_time_from)} -{" "}
                      {formatTime(voucher.redemption.sku.valid_time_to)}
                    </p>
                  </div>
                </div>
              )}

              {/* SKU Description */}
              {voucher.redemption.sku.description && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t("description")}</p>
                  <p className="text-xs text-gray-900 dark:text-white leading-relaxed">
                    {voucher.redemption.sku.description}
                  </p>
                </div>
              )}

              {/* Terms & Conditions - Collapsible */}
              {voucher.redemption.sku.terms_conditions && (
                <div className="border-t border-gray-300 dark:border-slate-600 pt-2">
                  <button
                    onClick={() => setShowTerms(!showTerms)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {t("terms_conditions")}
                    </p>
                    {showTerms ? (
                      <ChevronUp className="w-4 h-4 text-[#CC9A55]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#CC9A55]" />
                    )}
                  </button>

                  {showTerms && (
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mt-1.5">
                      {voucher.redemption.sku.terms_conditions}
                    </p>
                  )}
                </div>
              )}

              {/* Redeemed At */}
              {voucher.redemption.redeemed_at && (
                <div className="pt-1.5 border-t border-gray-300 dark:border-slate-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("redeemed")} {formatDate(voucher.redemption.redeemed_at)}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VoucherDetailModal;
