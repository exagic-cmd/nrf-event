import { X } from 'lucide-react';

export default function SeeMoreDetail({ onClose ,longDesc}) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-surface rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
      {/* Header - fixed height */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl ml-2 font-bold">Detail Description</h2>
        <button 
          className="text-muted-foreground hover:text-muted-foreground transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Content area - flexible with scroll */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-muted-foreground px-2 text-justify">
          {longDesc}
        </p>
      </div>
    </div>
  </div>
  );
}