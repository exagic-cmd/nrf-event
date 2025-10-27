import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useCartStore } from "@/store/useCartStore";
import { useScrollToTop } from '@/hooks/use-scroll-top';

const BookingType = ({ id, category_id }) => {
  useScrollToTop();
  const router = useRouter();
  const { itemToEdit } = useCartStore();

  useEffect(() => {
    if (!id || !category_id) return;

    const query = itemToEdit ? { edit: "true" } : {};

    if (category_id === 2) {
      router.push({
        pathname: `/transfer-booking/${id}`,
        query,
      });
    } else {
      router.push({
        pathname: `/booking/${id}`,
        query,
      });
    }
  }, [id, category_id]);

  return null; 
};

export default BookingType;