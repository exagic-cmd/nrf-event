import React, { useEffect, useState } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Layout from "@/components/layout/Layout";
import PayNow from "@/components/transfers/paynow";
import LoaderSvg from "@/components/common/Loader2Svg";
import { useCartStore } from "@/store/useCartStore";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const PayNowPage = () => {
  const { localizedPush,localizedReplace } = useLocalizedRouter();
    const router = useRouter();

  const { t } = useTranslation('daytour');
  const { items } = useCartStore();
  const [allowed, setAllowed] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const fromBooking = sessionStorage.getItem("fromBooking");
    if (fromBooking === "true") {
      setAllowed(true);
    } else {
      setAllowed(false);
      setTimeout(() => {
        localizedReplace("/");
      }, 3000);
    }
    setCheckingAccess(false);
  }, [router]);

  if (checkingAccess) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoaderSvg />
        </div>
      </Layout>
    );
  }

  if (!allowed) {
    return (
      <Layout>
        <div className=" bg-[#D0E9FF] flex items-center justify-center min-h-screen text-center px-4">
          <div>
            <h2 className="text-xl font-semibold text-black mb-2">
              {t('unauthorized')}
            </h2>
            <p className="text-black">{t('redirecting')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // if (items.length === 0) {
  //   return (
  //     <Layout>
  //       <div className=" bg-[#D0E9FF] flex items-center justify-center min-h-screen text-center px-4">
  //         <div>
  //           <h2 className="text-xl font-semibold text-white mb-2">
  //             {t('noItemsInCart')}
  //           </h2>
  //           <button
  //             onClick={() => localizedPush("/")}
  //             className="bg-[#D3202D] text-white px-4 py-2 rounded-lg"
  //           >
  //             {t("goBack")}
  //           </button>
  //         </div>
  //       </div>
  //     </Layout>
  //   );
  // }

  return (
    <Layout>
      <div className= "bg-[#D0E9FF] mt-12 min-h-screen">
        <div className="max-w-6xl bg-[#D0E9FF] mx-auto px-4 py-8 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">           
              <PayNow />          
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ locale }) {
  try {
    return {
      props: {
        ...(await serverSideTranslations(locale ?? "en", ["common", "daytour"])),
      },
    };
  } catch (error) {
    console.error("❌ Error in getServerSideProps (PayNowPage):", error);
    return {
      props: {
        error: "i18n_load_failed",
      },
    };
  }
}


export default PayNowPage;