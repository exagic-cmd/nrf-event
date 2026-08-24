import { useState, useEffect } from "react";
import useUserStore from "@/store/useAuthStore"; 
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "next-i18next";
import { useLocalizedRouter } from "@/components/localizedRouter";

export default function RegisterPage() {
  const { t } = useTranslation("auth");
  const { localizedPush } = useLocalizedRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
    branch_id: 2,
    country_id: 1,
    city_id: 1,
    phone: "",
  });

  const [localError, setLocalError] = useState("");
  const { registerUser, error: storeError, loading } = useUserStore();

 useEffect(() => {
  useUserStore.setState({ error: null });
}, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🔹 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.password_confirmation
    ) {
      setLocalError(t("fillAllFields"));
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setLocalError(t("passwordsDontMatch"));
      return;
    }

    setLocalError("");

    const result = await registerUser({
      ...formData,
      username: formData.name, 
    });

    if (result.success) {
      localizedPush("/order"); 
    } else {
      setLocalError(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] w-full py-14 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg w-full max-w-5xl h-[559px] overflow-hidden">
        {/* Left: Banner */}
        <div className="hidden md:block md:w-1/2 justify-items-center">
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Pic.png`}
            alt="Register Banner"
            className="inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-8">
          <h1 className="text-2xl font-bold mb-1">{t("register")}</h1>
          <p className="text-white text-sm mb-6">{t("createAccount")}</p>

          {(localError || storeError) && (
            <p className="text-red-500 text-sm mb-4">
              {localError || storeError}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm mb-1">
                {t("fullName")}
              </label>
              <input
                type="text"
                name="name"
                className="w-full p-2 border border-gray-200 rounded"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                name="email"
                className="w-full p-2 border border-gray-200 rounded"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label htmlFor="contact_number" className="block text-sm mb-1">
                {t("contactNumber")}
              </label>
              <PhoneInput
                country={'sg'}
                value={formData.phone}
                onChange={(phone) =>
                  setFormData({ ...formData, phone: phone })
                }
                inputStyle={{
                  width: "100%",
                  borderRadius: "4px",
                  borderColor: "#D1D5DB",
                  padding: "12px 42px",
                }}
                containerStyle={{ width: "100%" }}
                inputProps={{
                  name: "contact_number",
                  required: true,
                }}
              />
            </div>

            {/* Password + Confirm */}
            <div className="flex space-x-4">
              <div className="mb-4 w-full">
                <label htmlFor="password" className="block text-sm mb-1">
                  {t("password")}
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full p-2 border border-gray-200 rounded"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-6 w-full">
                <label
                  htmlFor="password_confirmation"
                  className="block text-sm mb-1"
                >
                  {t("confirmPassword")}
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  className="w-full p-2 border border-gray-200 rounded"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#D3202D] text-white  p-3 rounded-md transition-colors ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#D3202D]"
              }`}
            >
              {loading ? t("registering") : t("register")}
            </button>
          </form>

          {/* Already have an account */}
          <div className="text-center text-sm mt-4">
            <span className="text-black">{t("alreadyHaveAccount")} </span>
            <a
              href="/login"
              className="text-[#D3202D] hover:underline"
            >
              {t("signIn")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
