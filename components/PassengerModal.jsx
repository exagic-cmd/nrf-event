import React, { useState, useEffect } from "react";

export default function PassengerModal({ isOpen, onClose, passengerInfo, onUpdate }) {
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [error, setError] = useState("");

  const maxCapacity = passengerInfo?.max_capacity || 99;

  useEffect(() => {
    if (passengerInfo) {
      setAdults(passengerInfo.adults || 0);
      setChildren(passengerInfo.children || 0);
      setError("");
    }
  }, [passengerInfo, isOpen]);

  if (!isOpen) return null;

  const total = adults + children;

  const validateRules = (newAdults, newChildren) => {
    if (newAdults < 1) {
      return "At least 1 adult is required.";
    }
    if (newChildren > 0 && newAdults === 0) {
      return "Children cannot travel without an adult.";
    }
    if (newAdults + newChildren > maxCapacity) {
      return `Maximum capacity of ${maxCapacity} exceeded.`;
    }
    return "";
  };

  const handleAdultsChange = (val) => {
    const safeVal = Math.max(0, val); // clamp at 0
    const err = validateRules(safeVal, children);
    if (err) {
      setError(err);
    } else {
      setAdults(safeVal);
      setError("");
    }
  };

  const handleChildrenChange = (val) => {
    const safeVal = Math.max(0, val); // clamp at 0
    const err = validateRules(adults, safeVal);
    if (err) {
      setError(err);
    } else {
      setChildren(safeVal);
      setError("");
    }
  };

  const handleSave = () => {
    if (!error) {
      onUpdate({ adults, children });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Select Passengers</h2>
<p className="text-sm text-muted-foreground mb-4">Max pax allowed are ({maxCapacity} adult & child)</p>
        {/* Adults */}
        <div className="flex items-center justify-between py-3 border-b">
          <span className="text-muted-foreground font-medium">Adults</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdultsChange(adults - 1)}
              className="px-3 py-1 bg-secondary rounded-md"
            >
              -
            </button>
            <span>{adults}</span>
            <button
              type="button"
              onClick={() => handleAdultsChange(adults + 1)}
              className="px-3 py-1 bg-secondary rounded-md"
              disabled={total >= maxCapacity}
            >
              +
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between py-3">
          <span className="text-muted-foreground font-medium">Children</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleChildrenChange(children - 1)}
              className="px-3 py-1 bg-secondary rounded-md"
            >
              -
            </button>
            <span>{children}</span>
            <button
              type="button"
              onClick={() => handleChildrenChange(children + 1)}
              className="px-3 py-1 bg-secondary rounded-md"
              disabled={total >= maxCapacity}
            >
              +
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-primary mt-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-brand-secondary text-white hover:bg-[#cb913f]"
            disabled={!!error}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
