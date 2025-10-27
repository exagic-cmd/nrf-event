"use client"

import { useTranslation } from "next-i18next"
import { useState, useEffect } from "react"
import { Clock, Shield, MapPin, Users, Car, Headphones } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TransferBenefitsSection() {
  const { t } = useTranslation("common")
  const benefits = t("transferBenefits.benefits", { returnObjects: true }) || []
  const icons = [Clock, Shield, MapPin, Users, Car, Headphones]


  const [current, setCurrent] = useState(0)


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % benefits.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [benefits.length])

  return (
    <section className="w-full py-12 md:py-24 lg:py-24 bg-black relative overflow-hidden">
      {/* Background images */}
      <img
        src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1756794120/External%20Links/businesswoman-getting-taxi-cab.jpg"
        alt="Singapore Airport"
        className="absolute top-10 left-0 w-52 h-52 object-cover opacity-10 -translate-x-1/4 rotate-3 hidden sm:block rounded-xl"
      />
      <img
        src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1756794127/External%20Links/full-shot-people-traveling-together.jpg"
        alt="Luxury Car"
        className="absolute bottom-1/2 right-0 w-36 h-36 object-cover opacity-10 translate-y-1/2 rotate-45 hidden sm:block rounded-xl"
      />

      <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
        {/* Heading */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="font-bold tracking-tighter text-3xl md:text-4xl text-white">
              {t("transferBenefits.title")}{" "}
              <span className="text-[#CC9A55]">{t("transferBenefits.title2")}</span>
            </h2>
            <p className="max-w-[900px] md:text-lg/relaxed text-sm/relaxed md:px-0 px-4 text-white">
              {t("transferBenefits.subtitle")}
            </p>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(benefits) &&
            benefits.map((benefit, index) => {
              const IconComponent = icons[index] || Car
              return (
                <Card
                  key={index}
                  className="border-2 text-black border-gray-100 hover:border-orange-200 bg-[#CC9A55] transition-colors duration-300 hover:shadow-lg"
                >
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="p-2 bg-[#fad6a2] rounded-full text-black">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{benefit.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow pt-2">
                    <p className="text-sm font-medium text-black mb-2">{benefit.feature}</p>
                    <CardDescription className="text-black text-base leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
        </div>

        {/* Mobile Slider */}
        <div className="block sm:hidden relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {benefits.map((benefit, index) => {
              const IconComponent = icons[index] || Car
              return (
                <div key={index} className="min-w-full px-4">
                  <Card className="border-2 text-black border-gray-100 bg-[#CC9A55]">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="p-2 bg-[#fad6a2] rounded-full text-black">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg font-semibold">{benefit.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow pt-2">
                      <p className="text-sm font-medium text-black mb-2">{benefit.feature}</p>
                      <CardDescription className="text-black text-sm leading-relaxed">
                        {benefit.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>

     
          <div className="flex justify-center mt-4 space-x-2">
            {benefits.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full ${
                  current === index ? "bg-[#CC9A55]" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
