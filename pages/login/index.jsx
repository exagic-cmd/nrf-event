import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Layout from "@/components/layout/Layout";
import useUserStore from "@/store/useAuthStore"; 
import RegisterPage from "@/components/auth/Register";
import ForgotPasswordModals from "@/components/auth/ForgotPasswordModals";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useLocalizedRouter } from "@/components/localizedRouter";

export default function SignInPage() {
  const { t } = useTranslation("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const { loginUser, error: storeError, loading } = useUserStore();
  const { localizedPush } = useLocalizedRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setLocalError(t("requiredFields"));
      return;
    }

    setLocalError("");
    const result = await loginUser({ email, password });

    if (result.success) {
      localizedPush("/order"); 
    } else {
      setLocalError(result.error || t("invalidCredentials"));
    }
  };
useEffect(() => {
  useUserStore.setState({ error: null });
}, []);

  return (
    <Layout>
      {!showRegister ? (
        <div className="min-h-screen bg-surface-muted w-full py-14 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
          <div className="flex flex-col md:flex-row bg-surface rounded-lg shadow-lg w-full max-w-5xl h-[559px] overflow-hidden">
            {/* Left: Sign-in Form */}
            <div className="w-full h-full md:w-1/2 m-2">
              <div className="py-8 px-4">
                <h1 className="text-2xl font-bold mb-1">{t("title")}</h1>
                <p className="text-muted-foreground text-sm mb-6">{t("subtitle")}</p>

                {/* Errors */}
                {(localError || storeError) && (
                  <p className="text-red-500 text-sm mb-4">
                    {localError || storeError}
                  </p>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="mb-8">
                    <label
                      htmlFor="email"
                      className="block text-sm mb-1 font-medium"
                    >
                      {t("email")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-2 border border-border rounded"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-8">
                    <label
                      htmlFor="password"
                      className="block text-sm mb-1 font-medium"
                    >
                      {t("password")}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="w-full p-2 border border-border rounded pr-10"
                        placeholder="•••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2.5 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember + Forgot password */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        className="mr-2"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm text-muted-foreground"
                      >
                        {t("remember")}
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      {t("forgotPassword")}
                    </button>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className={`w-full bg-primary text-white p-3 rounded-md transition-colors ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-primary"
                    }`}
                    disabled={loading}
                  >
                    {loading ? t("signingIn") : t("signIn")}
                  </button>
                </form>

                {/* Switch to Register */}
                <div className="text-center text-sm mt-4">
                  <span className="text-muted-foreground">{t("noAccount")} </span>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setShowRegister(true)}
                  >
                    {t("signUp")}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Banner */}
            <div className="hidden md:block md:w-1/2 h-full">
              <div className="w-full h-full relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Pic.png`}
                  alt="Banner"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <RegisterPage onBack={() => setShowRegister(false)} />
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModals
          onClose={() => setShowForgotPasswordModal(false)}
        />
      )}
    </Layout>
  );
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['auth','common'])),
    },
  };
}
