// pages/404.js
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default function Custom404() {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-700 px-4">
   
      <h1 className="text-7xl font-extrabold text-[#CC9A55] drop-shadow-sm">
        404
      </h1>


      <h2 className="mt-4 text-2xl md:text-3xl font-semibold">
        {t("404_title")}
      </h2>

      <p className="mt-2 text-gray-500">{t("404_message")}</p>

     
      <Link href="/" passHref>
        <p className="mt-6 px-6 py-3 rounded-xl bg-[#CC9A55] text-white font-medium shadow-md  transition-all duration-300">
          {t("go_home")}
        </p>
      </Link>
    </div>
  );
}
