// utils/tierPricing.js
export const calculateTierPricing = (
  adultCount = 0,
  childCount = 0,
  tieredPricingData = {}
) => {
  const pricingList = tieredPricingData?.tieredPricing?.data?.product_pricing || [];

  const totalPax = adultCount + childCount;

  const selectedTier =
    pricingList.find(
      (t) =>
        totalPax >= Number(t.min_pax) && totalPax <= Number(t.max_pax)
    ) || pricingList[0] || {};

  const adultPrice =
    selectedTier.adult_promo_price > 0
      ? selectedTier.adult_promo_price
      : selectedTier.adult_price || 0;

  const childPrice =
    selectedTier.child_promo_price > 0
      ? selectedTier.child_promo_price
      : selectedTier.child_price || 0;

  const totalAdult = adultCount * adultPrice;
  const totalChild = childCount * childPrice;

  return {
    selectedTier,
    adultPrice,
    childPrice,
    totalAdult,
    totalChild,
    total: totalAdult + totalChild,
  };
};
