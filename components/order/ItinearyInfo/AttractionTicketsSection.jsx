"use client"
import React, { useState } from 'react';
import { Ticket, Download, X, FileText, Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';

const AttractionTicketsSection = ({ tickets }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  if (!tickets || tickets.length === 0) return null;

  const { t } = useTranslation("order");
  const handleDownload = async (url, filename, id) => {
    setDownloadingId(id);
    try {
      // Direct download attempt via new tab/link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    } finally {
      // Feedback delay
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <Ticket size={20} />
        {t("view_admission_tickets", { count: tickets.length })}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted">
              <div>
                <h3 className="text-xl font-bold text-foreground">{t("admission_tickets")}</h3>
                <p className="text-sm text-muted-foreground">{t("available_for_download")}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Ticket List */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-surface border-2 border-border rounded-2xl hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="text-primary" size={24} />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-gray-800 truncate">{ticket.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
                        {ticket.mime_type === 'application/pdf' ? t("pdf_ticket") : t("e_voucher")}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDownload(ticket.file_path, `${ticket.title}.pdf`, ticket.id)}
                    disabled={downloadingId === ticket.id}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {downloadingId === ticket.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {t("download")}
                  </button>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 text-center">
              <p className="text-xs text-gray-500 mb-4">{t("tickets_ready_note")}</p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors"
              >
                {t("close", { ns: "common" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttractionTicketsSection;