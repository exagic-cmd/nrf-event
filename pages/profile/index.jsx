"use client";
import { useEffect, useState } from "react";
import {
  Calendar,
  ShoppingBag,
  Star,
  Settings,
  Bell,
  LogOut,
  Pencil,
  X,
} from "lucide-react";
import ProtectedRoute from "@/components/order/ProtectedRoute";
import useUserStore from "@/store/useAuthStore";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const UserProfileScreen = () => {
  const {
    user,
    token,
    fetchUserProfile,
    updateUserProfile,
    loading,
    error,
    logout,
  } = useUserStore();

  const { t } = useTranslation("order");

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token, fetchUserProfile]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user?.name || "",
        username: user?.username || "",
        email: user?.email || "",
        phone: user?.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const res = await updateUserProfile(form);
    if (res.success) {
      fetchUserProfile();
      setEditMode(false);
    }
  };

  const handleDiscard = () => {
    setForm({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setEditMode(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getMembershipDuration = () => {
    if (!user?.joining_time) return "—";
    const joinDate = new Date(user.joining_time);
    const now = new Date();

    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const years = now.getFullYear() - joinDate.getFullYear();
    let months = now.getMonth() - joinDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years > 0) {
      return `${years} year${years > 1 ? "s" : ""} ${months > 0 ? `and ${months} month${months > 1 ? "s" : ""}` : ""}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? "s" : ""}`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    } else {
      return "Just joined";
    }
  };

  if (loading && !user) return <p className="p-8">{t("loadingProfile")}</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{t("myProfile")}</h1>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{t("logout")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-[#D3202D] to-[#eca94c] px-6 pt-2 text-white relative">
                  <div className="relative flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                        {getInitials(user?.name)}
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-center">{user?.name}</h2>
                    <p className="text-white/80 text-sm">@{user?.username}</p>
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats + Status */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t("accountStatus")}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user?.user_status === "registered"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user?.user_status || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t("verification")}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user?.verification_status === "verified"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user?.verification_status === "verified"
                          ? t("verified")
                          : t("unverified")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t("memberSince")}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getMembershipDuration()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-11">
                {/* Header with edit button */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("personalInformation")}
                  </h3>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                  ) : (
                    <button
                      onClick={handleDiscard}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>

                {/* Editable fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  {["name", "username", "email", "phone"].map((field) => (
                    <div key={field} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {t(field)}
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          name={field}
                          value={form[field]}
                          onChange={handleChange}
                          className="w-full border p-3 rounded-lg"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <span className="text-gray-900">{user?.[field] || "—"}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Save/Discard */}
                {editMode && (
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={handleDiscard}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      {t("discard")}
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-[#D3202D] text-white rounded"
                    >
                      {t("save")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

// 🔹 Small helper component for read-only fields
const InfoField = ({ icon, label, value }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
      {icon}
      <span>{label}</span>
    </label>
    <div className="p-3 bg-gray-50 rounded-lg border">
      <span className="text-gray-900">{value || "—"}</span>
    </div>
  </div>
);

export default UserProfileScreen;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "order"])),
    },
  };
}