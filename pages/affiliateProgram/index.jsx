import React from "react";
import "@/styles/globals.css";
import Layout from "@/components/layout/Layout";
import FAQItem from "@/components/affiliate/faqs";
import BannerSection from "@/components/affiliate/BannerSection";
import AffiliateDiscloserSection from "@/components/affiliate/AffiliateDiscloserSection";
import EarningPotentialSection from "@/components/affiliate/EarningPotentialSection";
import LinkCardSection from "@/components/affiliate/LinkcardSection";
import ProgamWorkSection from "@/components/affiliate/ProgamWorkSection";
import AffiliateSection from "@/components/affiliate/section";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export default function ToursAffiliateProgram() {
  return (
    <div className="overflow-x-hidden scroll-smooth">
      <Layout>
        <div className="mt-16">
          <BannerSection />
        </div>

        {/* <div className="mx-4 md:mx-8 my-14">
          <AffiliateDiscloserSection />
        </div> */}
        
         
<div className="mx-4 md:mx-8 mb-14">
          <AffiliateSection/>
        </div>
         <div className=" my-14">
          <EarningPotentialSection />
        </div>
       <div className="mx-4 md:mx-24 my-14">
          <ProgamWorkSection />
        </div>

        {/* <div className="mx-4 md:mx-8 my-14">
          <LinkCardSection />
        </div> */}

       
        {/* <div className="mx-4 md:mx-8 my-14">
          <FAQItem />
        </div> */}
        
      </Layout>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['affiliateProgram','common'])),
    },
  };
}

