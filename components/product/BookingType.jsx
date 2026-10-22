import React, { useEffect } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useCartStore } from "@/store/useCartStore";
import { useScrollToTop } from '@/hooks/use-scroll-top';

const BookingType = ({ id, category_id }) => {
  useScrollToTop();
  const { localizedPush } = useLocalizedRouter();
  const { itemToEdit } = useCartStore();

  useEffect(() => {
    if (!id || !category_id) return;

    const query = itemToEdit ? { edit: "true" } : {};

    if (category_id === 2) {
      localizedPush({
        pathname: `/transfer-booking/${id}`,
        query,
      });
    } else {
      localizedPush({
        pathname: `/booking/${id}`,
        query,
      });
    }
  }, [id, category_id]);

  return null; 
};

export default BookingType;