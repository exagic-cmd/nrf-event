import { Download, ExternalLink, QrCode, FileText, Loader2, X } from 'lucide-react';
import { useState } from 'react';

const VouchersAndQRSection = ({ vouchers }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);

  if (!vouchers || vouchers.length === 0) {
    return null;
  }

  const pdfVouchers = vouchers.filter(v => v.type === 'voucher' && v.file_path);

  const detectBrowser = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    
    return {
      isIOS: /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1),
      isAndroid: /Android/.test(ua),
      isSafari: /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua),
      isFirefox: /Firefox/.test(ua) || /FxiOS/.test(ua),
      isChrome: /Chrome/.test(ua) || /CriOS/.test(ua),
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    };
  };

  const handleDownload = async (url, filename, voucherId) => {
    setLoadingStates(prev => ({ ...prev, [voucherId]: true }));
    
    const browser = detectBrowser();
    
    try {
      // iOS Safari and iOS Chrome - must open in new tab due to restrictions
      if (browser.isIOS) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Android and other mobile browsers - try download attribute first
      if (browser.isMobile) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Fallback for browsers that don't support download attribute
        setTimeout(() => {
          if (!document.hidden) {
            window.open(url, '_blank');
          }
        }, 500);
        return;
      }

      // Desktop browsers - fetch and create blob for better control
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/pdf',
          },
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
      } catch (fetchError) {
        // Fallback to direct link if fetch fails
        console.warn('Fetch failed, using direct link:', fetchError);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Final fallback - just open the URL
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setLoadingStates(prev => ({ ...prev, [voucherId]: false }));
    }
  };

  const handleQROpen = async (voucher) => {
    setShowQRModal(voucher);
  };

  const handleSelectVoucher = (voucherId) => {
    setSelectedVouchers(prev => {
      if (prev.includes(voucherId)) {
        return prev.filter(id => id !== voucherId);
      }
      return [...prev, voucherId];
    });
  };

  const handleSelectAll = () => {
    if (selectedVouchers.length === pdfVouchers.length) {
      setSelectedVouchers([]);
    } else {
      setSelectedVouchers(pdfVouchers.map(v => v.id));
    }
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    const vouchersToDownload = selectedVouchers.length > 0 
      ? pdfVouchers.filter(v => selectedVouchers.includes(v.id))
      : pdfVouchers;

    const browser = detectBrowser();

    try {
      if (browser.isIOS) {
        // iOS: Open each PDF in new tab with delay to avoid popup blocking
        for (let i = 0; i < vouchersToDownload.length; i++) {
          const voucher = vouchersToDownload[i];
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = voucher.file_path;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, i * 500);
        }
      } else if (browser.isMobile) {
        // Android and other mobile: Try download with fallback
        for (let i = 0; i < vouchersToDownload.length; i++) {
          const voucher = vouchersToDownload[i];
          await handleDownload(
            voucher.file_path,
            `${voucher.title}_${voucher.id}.pdf`,
            voucher.id
          );
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      } else {
        // Desktop browsers: Sequential downloads
        for (const voucher of vouchersToDownload) {
          await handleDownload(
            voucher.file_path,
            `${voucher.title}_${voucher.id}.pdf`,
            voucher.id
          );
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } catch (error) {
      console.error('Batch download error:', error);
    } finally {
      setDownloadingAll(false);
      setSelectedVouchers([]);
    }
  };

  return (
    <>
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <h2 className="text-md font-semibold text-gray-900">Vouchers & QR Codes</h2>
        
        {pdfVouchers.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 text-xs sm:text-sm text-[#D3202D] hover:bg-[#D3202D]/10 rounded-lg transition-colors whitespace-nowrap"
            >
              {selectedVouchers.length === pdfVouchers.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#D3202D] text-white rounded-lg hover:bg-[#B88A45] transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {downloadingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Downloading...</span>
                  <span className="sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">
                    {selectedVouchers.length > 0 ? `Download (${selectedVouchers.length})` : 'Download All'}
                  </span>
                  <span className="sm:hidden">
                    {selectedVouchers.length > 0 ? `(${selectedVouchers.length})` : 'All'}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {vouchers.map((voucher, index) => (
          <div
            key={voucher.id}
            className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border transition-colors ${
              selectedVouchers.includes(voucher.id)
                ? 'border-[#D3202D] bg-[#D3202D]/5'
                : 'border-gray-200 hover:border-[#D3202D]'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {voucher.type === 'voucher' && pdfVouchers.length > 1 && (
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedVouchers.includes(voucher.id)}
                    onChange={() => handleSelectVoucher(voucher.id)}
                    className="peer w-4 h-4 appearance-none border-2 border-gray-300 rounded cursor-pointer checked:bg-[#D3202D] checked:border-[#D3202D] focus:ring-2 focus:ring-[#D3202D] focus:ring-offset-1"
                  />
                  <svg
                    className="absolute top-0 left-0 w-4 h-4 pointer-events-none hidden peer-checked:block text-white"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              
              {voucher.type === 'voucher' ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#D3202D]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#D3202D]" />
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#D3202D]/10 flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-[#D3202D]" />
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {voucher.title}
                </p>
                <p className="text-xs text-gray-500">
                  {voucher.type === 'voucher' ? 'PDF Document' : 'QR Code Link'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0 ml-2">
              {voucher.type === 'voucher' && voucher.file_path && (
                <button
                  onClick={() => handleDownload(voucher.file_path, `${voucher.title}_${voucher.id}.pdf`, voucher.id)}
                  disabled={loadingStates[voucher.id] || downloadingAll}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#D3202D] text-white rounded-lg hover:bg-[#B88A45] transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download PDF"
                >
                  {loadingStates[voucher.id] ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
              )}
              
              {voucher.type === 'qr' && voucher.qr_link && (
                <button
                  onClick={() => handleQROpen(voucher)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#D3202D] text-white rounded-lg hover:bg-[#B88A45] transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-medium"
                  title="Show QR Code"
                >
                  <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 p-3 bg-[#D3202D]/10 border border-[#D3202D]/30 rounded-lg">
        <p className="text-xs sm:text-sm text-[#D3202D]">
          <strong>Note:</strong> {(() => {
            const browser = detectBrowser();
            if (browser.isIOS) {
              return 'On iPhone/iPad, PDFs will open in Safari. Tap the share icon (⬆) and select "Save to Files" to download.';
            } else if (browser.isAndroid) {
              return 'On Android, files will be saved to your Downloads folder. Check your notification panel or Files app.';
            } else {
              return 'Please keep these files accessible during your trip.';
            }
          })()}
        </p>
      </div>
    </div>

    {/* QR Code Modal */}
    {showQRModal && (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowQRModal(null)}
      >
        <div 
          className="bg-white rounded-xl p-6 max-w-sm w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowQRModal(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-8">
            {showQRModal.title}
          </h3>
          
          <div className="bg-white p-4 rounded-lg border-2 border-[#D3202D] mb-4 relative">
            <div className="w-full aspect-square flex items-center justify-center">
                {loadingStates[`qr-${showQRModal.id}`] !== false && !loadingStates[`qr-error-${showQRModal.id}`] && (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-[#D3202D] animate-spin" />
                    <p className="text-sm text-gray-600">Loading QR Code...</p>
                </div>
                )}
    
        {loadingStates[`qr-error-${showQRModal.id}`] && (
            <div className="flex flex-col items-center gap-2 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Failed to load QR Code</p>
                <p className="text-xs text-gray-600">Please try opening the link directly</p>
            </div>
            )}
            
            <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(showQRModal.qr_link)}`}
            alt="QR Code"
            className={`w-full h-auto ${loadingStates[`qr-${showQRModal.id}`] !== false || loadingStates[`qr-error-${showQRModal.id}`] ? 'hidden' : 'block'}`}
            onLoad={() => setLoadingStates(prev => ({ ...prev, [`qr-${showQRModal.id}`]: false }))}
            onLoadStart={() => setLoadingStates(prev => ({ ...prev, [`qr-${showQRModal.id}`]: true }))}
            onError={() => setLoadingStates(prev => ({ ...prev, [`qr-${showQRModal.id}`]: false, [`qr-error-${showQRModal.id}`]: true }))}
            />
        </div>
        </div>
          
          <p className="text-sm text-gray-600 mb-4 text-center">
            Scan this QR code with your device
          </p>
          
          <button
            onClick={() => window.open(showQRModal.qr_link, '_blank', 'noopener,noreferrer')}
            className="w-full px-4 py-2.5 bg-[#D3202D] text-white rounded-lg hover:bg-[#B88A45] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Open Link Directly
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default VouchersAndQRSection;