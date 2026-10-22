import LandingPage from "./index";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default LandingPage;

export async function getServerSideProps({ locale, params }) {
  return {
    props: {
      routeEventSlug: params?.slug || null,
      ...(await serverSideTranslations(locale, ["common", "transfers"])),
    },
  };
}
