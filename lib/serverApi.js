import { apiRequest } from "@/lib/clientApi";

export async function getProductDetailSSR(id) {
  const product = await apiRequest({ endpoint: `product/${id}/1`, method: "GET" });
  const tieredPricing = await apiRequest({ endpoint: `product_tiered_pricing/${id}`, method: "GET" });
  return { product, tieredPricing };
}

export async function getTourMapSSR(id, langId = 1) {
  const res = await apiRequest({ endpoint: `tour_location/${id}/${langId}`, method: "GET" });
  return res?.data?.markers || [];
}
