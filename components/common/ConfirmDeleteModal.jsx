import React from "react";
import { useTranslation } from "next-i18next";

const ConfirmDeleteModal = ({ itemTitle, onCancel, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-6 max-w-sm w-full shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("deleteItemTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("deleteConfirmation")}{" "}
          <span className="inline-block max-w-[200px] truncate align-middle font-medium text-foreground">
            {itemTitle}
          </span>{" "}
          {t("fromCart")}?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-secondary"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-primary text-white rounded "
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
