"use client";

import React from "react";
import { Plane, Search, Users, Clock, CheckCircle } from "lucide-react";
import { useTranslation } from "next-i18next"; 

function TransferBookingPlaceholder() {
  const { t } = useTranslation("transfer"); 
  return (
    <div className="flex flex-col bg-surface pb-12 rounded-xl md:mx-12 items-center justify-center py-20 text-center px-4">
      <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6">
        <Search size={48} className="text-primary" />
      </div>

      <h2 className="text-2xl font-semibold text-primary">
        {t("placeholder.heading")}
      </h2>

      <p className="mt-2 text-white max-w-md">
        {t("placeholder.description")}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 w-full max-w-2xl">
        <FeatureItem icon={<Users className="w-5 h-5 text-primary" />} label={t("placeholder.features.multiplePassengers")} />
        <FeatureItem icon={<Plane className="w-5 h-5 text-primary" />} label={t("placeholder.features.luggageFriendly")} />
        <FeatureItem icon={<Clock className="w-5 h-5 text-primary" />} label={t("placeholder.features.flexibleTiming")} />
        <FeatureItem icon={<CheckCircle className="w-5 h-5 text-primary" />} label={t("placeholder.features.freeCancellation")} />
      </div>
    </div>
  );
}

function FeatureItem({ icon, label }) {
  return (
    <div className="flex flex-col items-center text-sm text-white">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted border border-border mb-2">
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );
}

export default TransferBookingPlaceholder;
