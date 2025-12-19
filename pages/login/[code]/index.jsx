// pages/login/[code].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useUserStore from "@/store/useAuthStore";
import Loading2Svg from "@/components/common/Loader2Svg";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function LoginWithCodePage() {
  const router = useRouter();
  const { code } = router.query;
  const { verifyQrCode, user, loading, error } = useUserStore();
  const { t } = useTranslation("order");
  const [status, setStatus] = useState(t("verifying"));

  useEffect(() => {
    if (!code) return;

    async function handleVerify() {
      const result = await verifyQrCode(code);

      if (result.success) {
        setStatus(t("loginSuccess"));
        setTimeout(() => router.replace("/"), 1500);
      } else {
        setStatus(t("invalidOrExpired"));
        setTimeout(() => router.replace("/"), 2000);
      }
    }

    handleVerify();
  }, [code, t, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div>
        {loading ? (
          <Loading2Svg />
        ) : (
          <p className={error ? "text-red-500" : "text-gray-800"}>{status}</p>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "order"])),
    },
  };
}
