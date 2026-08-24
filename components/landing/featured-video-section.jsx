"use client"

import { useTranslation } from "next-i18next"
import { Button } from "@/components/ui/button"
import { Globe, Camera, MapPin, Compass, Sparkles } from "lucide-react"

export function FeaturedVideoSection() {
  const { t } = useTranslation("common") 
  const instagramReelEmbedUrl = "https://www.instagram.com/reel/DKcFcKrMX5t/embed/"

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 relative z-10 overflow-hidden">
      {/* Background Icons */}
      <Camera className="absolute top-1/4 left-10 w-8 h-8 text-gray-300/30 animate-float" />
      <MapPin className="absolute bottom-1/3 right-12 w-7 h-7 text-gray-300/30 animate-float-delayed" />
      <Compass className="absolute top-1/2 left-1/4 w-9 h-9 text-gray-300/20 animate-float" />
      <Sparkles className="absolute bottom-1/4 left-1/3 w-6 h-6 text-gray-300/40 animate-float-delayed" />
      <Globe className="absolute top-20 right-20 w-10 h-10 text-gray-300/20 animate-float" />

      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12">
          {/* Left Column: Text Content */}
          <div className="md:w-1/2 bg-white p-8 rounded-xl shadow-md border border-gray-200 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center space-x-2 mb-4 ">
              <img className="w-44 h-10" src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}Logo_1__1_-removebg-preview.png`} alt="" />
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 mb-4">
              {t("videoSection.title")}
            </h2>
            <p className="text-gray-700 md:text-lg leading-relaxed mb-8">
              {t("videoSection.description")}
            </p>
          </div>

          {/* Right Column: Instagram Reel Embed */}
          <div className="md:w-1/2 w-full flex justify-center items-center">
            <div className="w-full max-w-sm h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <iframe
                src={instagramReelEmbedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title={t("videoSection.titleVideo")}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
