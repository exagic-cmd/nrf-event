// components/DownloadItineraryButton.jsx
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItineraryPDF from './ItineraryPDF';
import FileSaver from 'file-saver';

const DownloadItineraryButton = ({ itineraryData }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      // Generate PDF as blob
      const blob = await pdf(<ItineraryPDF itineraryData={itineraryData} />).toBlob();
      
      // Save the file
      FileSaver.saveAs(blob, `${itineraryData.trip_title.replace(/ /g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600"
      title="Download itinerary"
      disabled={isGenerating}
    >
      {isGenerating ? (
        <div className="flex items-center justify-center">
        <svg
          className="animate-spin h-12 w-12 text-blue-900" // Increased size to h-8 w-8
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="12"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
};

export default DownloadItineraryButton;