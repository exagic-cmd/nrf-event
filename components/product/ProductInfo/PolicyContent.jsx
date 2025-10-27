import { X } from 'lucide-react';

export default function PolicyModal({ onClose, content }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white min-h-64 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cancellation Policy</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-gray-700 whitespace-pre-line px-4 text-justify">
            {content || "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
}
