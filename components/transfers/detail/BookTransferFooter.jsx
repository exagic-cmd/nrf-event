import React from 'react'
import { Check } from 'lucide-react';

function BookTransferFooter({ pricing, onBookTransferClick })
{
  return (
    <>
     <div className="bg-surface rounded-lg p-6 shadow-sm">
    <h2 className="text-xl font-bold mb-4">Book a transfer</h2>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center text-green-600">
        <Check className="w-6 h-6 mr-2" />
        <span className="font-medium">Just one more step</span>
      </div>
    <button
  onClick={onBookTransferClick}
  className="bg-primary text-primary-foreground font-medium px-6 py-3 rounded-md hover:bg-primary-hover transition-colors"
>
  Book now
</button>

    </div>
    <p className="text-xs text-muted-foreground mt-4">
      By clicking "Book now", you accept fare rules and data processing for contract conclusion.By clicking the "Proceed to payment" button, you accept fare rules. and confirm the consent of the personal data owner to processing of the data in order to conclude a contract of carriage.
    </p>
  </div>
    </>
  )
}

export default BookTransferFooter