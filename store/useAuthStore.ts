// store/useUserStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiRequest } from "@/lib/clientApi";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      qrCode: null,
      loading: false,
      error: null,
      resetToken: "",

      // 🔹 Register new user
// 🔹 Register new user
registerUser: async (formData) => {
  set({ loading: true, error: null });
  try {
    const response = await apiRequest({
      endpoint: "customer/register",
      method: "POST",
      data: formData,
    });

    const userData = response.customer || response.data?.customer;
    const token = response.token || userData?.access_token;
    if (!userData || !token) throw new Error("Invalid register response");

    set({ user: userData, token, loading: false });
    return { success: true, user: userData, token };
  } catch (err) {
    let errorMsg = "Registration failed";

    if (err.response?.data) {
      const data = err.response.data;
      if (data.errors) {
        const firstError = Object.values(data.errors)[0][0];
        errorMsg = firstError;
      } else if (data.message) {
        errorMsg = data.message;
      }
    } else if (err.message) {
      errorMsg = err.message;
    }

    set({ error: errorMsg, loading: false });
    return { success: false, error: errorMsg };
  }
},

      // 🔹 Login user
      loginUser: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await apiRequest({
            endpoint: "customer/login",
            method: "POST",
            data: credentials,
          });

          const userData = response.customer || response.data?.customer;
          const token = response.token || userData?.access_token;
          if (!userData || !token) throw new Error("Invalid login response");

          set({ user: userData, token, loading: false });
          return { success: true, user: userData, token };
        } catch (err) {
  const errorMessage = err.message || "Something went wrong";
  set({ error: errorMessage, loading: false });
  return { success: false, error: errorMessage };
}
      },

      // 🔹 QR Code verification login
      verifyQrCode: async (code) => {
        set({ loading: true, error: null });
        try {
          const response = await apiRequest({
            endpoint: "auth/qr/verify",
            method: "POST",
            data: { code },
          });
          if (!response.success || !response.data?.access_token) {
            throw new Error(response.message || "Invalid QR code");
          }

          const userData = response.data;
          const token = response.data.access_token;
 set({ user: userData, token, qrCode: code, loading: false });
          return { success: true, user: userData, token };
        } catch (err) {
          set({
            error: err.response?.data?.message || err.message || "QR verification failed",
            loading: false,
          });
          return { success: false, error: err.message };
        }
      },
      fetchUserProfile: async () => {
        set({ loading: true, error: null });
        try {
          const res = await apiRequest({
            endpoint: "customer/show",
            method: "GET",
            headers: get().getAuthHeader(),
          });

          const userData = res.customer || res.data?.customer || res.data;
          if (!userData) throw new Error("Failed to fetch user profile");

          set({ user: userData, loading: false });
          return { success: true, user: userData };
        } catch (err) {
          set({
            error: err.response?.data?.message || err.message || "Failed to load profile",
            loading: false,
          });
          return { success: false, error: err.message };
        }
      },
      updateUserProfile: async (payload) => {
        set({ loading: true, error: null });
        try {
          const res = await apiRequest({
            endpoint: "customer/update",
            method: "PUT",
            headers: get().getAuthHeader(),
            data: payload,
          });

          const updatedUser = res.customer || res.data?.customer || payload;
          set({ user: updatedUser, loading: false });

          return { success: true, user: updatedUser };
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message || "Update failed",
            loading: false,
          });
          return { success: false, error: error.message };
        }
      },
      submitReview: async (payload) => {
        try {
          const res = await apiRequest({
            endpoint: "add_user_review",
            method: "POST",
            headers: get().getAuthHeader(),
            data: payload,
          });

          const reviews = get().reviews || [];
          set({ reviews: [...reviews, res] });

          return res;
        } catch (error) {
          console.error("Error submitting review:", error);
          throw error;
        }
      },
      forgotPassword: async (email, language_id = 1) => {
        set({ loading: true, error: null });
        try {
          const response = await apiRequest({
            endpoint: `forgot-password?language_id=${language_id}`,
            method: "POST",
            data: { email, language_id },
          });
          set({ loading: false });
          return { success: true, token: response.token };
        } catch (err) {
          const errorMessage = err.message || "Something went wrong";
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },
      resetPassword: async ({ email, token, password, password_confirmation, language_id = 1 }) => {
        set({ loading: true, error: null });
        try {
          await apiRequest({
            endpoint: `reset-password?language_id=${language_id}`,
            method: "POST",
            data: { email, token, password, password_confirmation ,language_id},
          });
          set({ loading: false });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          });
          return { success: false, error: error.message };
        }
      },

      // 🔹 Logout
      logout: () => {
        set({ user: null, token: null });
      },

  
      getAuthHeader: () => {
        const token = get().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    {
      name: "auth-storage", 
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;
