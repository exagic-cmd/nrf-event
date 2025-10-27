import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UAParser } from "ua-parser-js";
import { trackAgentRedirect } from "@/lib/clientApi";

interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
}

interface IPInfo {
  ip: string;
  city: string;
  country: string;
  region: string;
  org: string;
  timezone: string;
}

interface AffiliateStoreState {
  refId: string | null;
  refType: string | null;
  track_agent_id: number | null;
  source: string | null;
  campaign: string | null;
  productId: string | null;

  setRefInfo: (
    refId: string,
    refType: string,
    source?: string,
    campaign?: string,
    productId?: string
  ) => void;

  trackAffiliateRedirect: (router: any) => Promise<void>;
}

export const useAffiliateStore = create<AffiliateStoreState>()(
  persist(
    (set, get) => ({
      refId: null,
      refType: null,
      track_agent_id: null,
      source: null,
      campaign: null,
      productId: null,

      setRefInfo: (
        refId,
        refType,
        source = null,
        campaign = null,
        productId = null
      ) => set({ refId, refType, source, campaign, productId }),

      trackAffiliateRedirect: async (router: any): Promise<void> => {
        const srNo = router.query["sr-no"];
        const type = router.query["type"];
        const source = router.query["source"] || null;
        const campaign =
          router.query["campaign"] || router.query["compaign"] || null;
        const productId = router.query.id || router.query.productId || null;

        if (!srNo || type !== "affiliate") {
          console.log("⏭️ No affiliate params found, skipping tracking");
          return;
        }
        const {
          refId,
          refType,
          source: storedSource,
          campaign: storedCampaign,
          productId: storedProductId,
        } = get();

        if (
          refId === srNo &&
          refType === type &&
          storedSource === source &&
          storedCampaign === campaign &&
          storedProductId === productId
        ) {
          console.log("🔄 Same affiliate data already stored, skipping tracking");
          return;
        }

        try {
          const fullUrl = `https://app.airporttransfers.ai${router.asPath}`;

          let visitorNumber = localStorage.getItem("visitorNumber");
          if (!visitorNumber) {
            visitorNumber = crypto.randomUUID();
            localStorage.setItem("visitorNumber", visitorNumber);
          }

          const parser = new UAParser();
          const result = parser.getResult();

          const deviceInfo: DeviceInfo = {
            browser: result.browser.name || "unknown",
            browserVersion: result.browser.version || "unknown",
            os: result.os.name || "unknown",
            osVersion: result.os.version || "unknown",
            deviceType: result.device.type || "desktop",
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
          };

          let ipInfo: IPInfo | {} = {};
          try {
            const res = await fetch('https://api64.ipify.org?format=json');
            const data = await res.json();

            if (data && data.ip) {
              ipInfo = data;
            }
          } catch (error) {
            console.warn("⚠️ Failed to fetch IP:", error);
          }

          console.log("🌍 Tracking payload:", {
            agentId: srNo,
            visitorNumber,
            fullUrl,
            agentType: type,
            productId,
            source,
            campaign,
            deviceInfo,
            ipInfo,
          });

          const response = await trackAgentRedirect({
            agentId: srNo,
            visitorNumber,
            fullUrl,
            agentType: type,
            productId,
            source,
            campaign,
            deviceInfo,
            ipInfo
          });

          if (response?.success && response.data) {
            console.log("Affiliate tracked successfully:", response.data);

            set({
              refId: srNo,
              refType: type,
              source,
              campaign,
              productId,
              track_agent_id: response.data.id,
            });
          } else {
            let errorMessage = "Unknown error while tracking affiliate";
            if (response?.message) {
              if (typeof response.message === "string") {
                errorMessage = response.message;
              } else if (typeof response.message === "object" && response.message !== null) {
                const errorKey = Object.keys(response.message)[0];
                errorMessage = response.message[errorKey]?.[0] || JSON.stringify(response.message);
              }
            }
            console.error("Failed to track affiliate redirect:", errorMessage);
          }
        } catch (error) {
          console.error("Affiliate redirect failed:", error);
        }
      },
    }),
    {
      name: "zustand-affiliate",
    }
  )
);
