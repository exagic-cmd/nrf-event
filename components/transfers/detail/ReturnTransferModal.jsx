import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import formatPrice from "@/lib/formatPrice";
const ReturnTransferModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedTransfer,
}) => {
  const { t } = useTranslation('transfer');

  if (!isOpen || !selectedTransfer) return null;

  // Calculate savings
  const oneWayPrice = parseFloat(selectedTransfer?.final_promo_price || selectedTransfer?.final_price || 0);
  const twoWayPrice = parseFloat(selectedTransfer?.two_way_promo_price || selectedTransfer?.two_way_price || 0);
  const returnPrice = twoWayPrice - oneWayPrice;
  const twoSeparatePrice = oneWayPrice * 2;
  const savingsAmount = twoSeparatePrice - twoWayPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-surface p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-primary">
          {t('returnTransfer.addReturnTransfer')}
        </h2>
        
        <div className="mb-6">
          <div className="bg-muted p-4 rounded-lg mb-4">
            <p className="text-muted-foreground font-medium">
              {t('returnTransfer.savingsMessage')} for {selectedTransfer?.currency} {formatPrice(returnPrice)}
            </p>
           
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-md bg-secondary hover:bg-secondary transition-colors"
          >
            {t('returnTransfer.noThanks')}
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground transition-colors"
          >
            {t('returnTransfer.yesPlease')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnTransferModal;
