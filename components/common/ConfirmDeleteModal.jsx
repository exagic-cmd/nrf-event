import React from "react";
import { useTranslation } from "next-i18next";

const ConfirmDeleteModal = ({ itemTitle, onCancel, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("deleteItemTitle")}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t("deleteConfirmation")}{" "}
          <span className="inline-block max-w-[200px] truncate align-middle font-medium text-gray-800">
            {itemTitle}
          </span>{" "}
          {t("fromCart")}?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#CC9A55] text-white rounded "
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
