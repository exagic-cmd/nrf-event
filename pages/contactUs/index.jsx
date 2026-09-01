import React, { useState } from "react";
import "@/styles/globals.css";
import Layout from "@/components/layout/Layout";
import MapView from "@/components/common/Map";
import { apiRequest } from "@/lib/clientApi";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
const ContactUsPage = () => {
  const { t } = useTranslation("common");

  const center = {
    lat: 1.3521,
    lng: 103.8198,
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    accepted_terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMessage("");

    if (!formData.name || !formData.email || !formData.message) {
      setResponseMessage({ type: "error", text: t("contact.validation.fields") });
      return;
    }

    if (!formData.accepted_terms) {
      setResponseMessage({ type: "error", text: t("contact.validation.terms") });
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest({
        endpoint: "contactUs",
        method: "POST",
        data: formData,
      });

      if (response.success) {
        setResponseMessage({ type: "success", text: response.message });
        setFormData({ name: "", email: "", message: "", accepted_terms: false });
      } else {
        setResponseMessage({ type: "error", text: response.message || t("contact.error.generic") });
      }
    } catch (error) {
      console.error("API Error:", error);
      setResponseMessage({ type: "error", text: t("contact.error.generic") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 mt-4 px-0 md:px-6 lg:px-8 mx-0 md:mx-8 lg:mx-8 xl:mx-12 flex justify-center items-center">
        <div className="bg-card text-card-foreground overflow-hidden mx-0 w-full grid grid-cols-1 lg:grid-cols-2">
          {/* Form Section */}
          <div className="p-8 md:p-16 sm:p-8">
            <h2 className="text-3xl font-semibold text-primary mb-4">{t("contact.title")}</h2>
            <p className="text-muted-foreground mb-6">{t("contact.subtitle")}</p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {responseMessage && (
                <p
                  className={`text-sm mt-2 text-center ${
                    responseMessage.type === "success" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {responseMessage.text}
                </p>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  {t("contact.name")}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={t("contact.namePlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  {t("contact.email")}
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={t("contact.emailPlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground">
                  {t("contact.message")}
                </label>
                <textarea
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={t("contact.messagePlaceholder")}
                ></textarea>
              </div>

              <div className="flex items-start">
                <input
                  id="accepted_terms"
                  type="checkbox"
                  checked={formData.accepted_terms}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="accepted_terms" className="ml-2 text-sm text-muted-foreground">
                  {t("contact.terms")}
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center py-3 px-16 rounded-full text-white ${
                    loading ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-primary-hover"
                  }`}
                >
                  {loading ? t("contact.submitting") : t("contact.submit")}
                </button>
              </div>
            </form>
          </div>

          {/* Map Section */}
          <div className="p-6 pt-24">
            <MapView center={center} zoom={10} height="384px" />
          </div>
        </div>
      </div>
    </Layout>
  );
};
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])), 
    },
  };
}

export default ContactUsPage;
