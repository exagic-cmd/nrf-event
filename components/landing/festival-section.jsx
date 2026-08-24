import { useTranslation } from "next-i18next"
import { CalendarDays, Sparkles, PartyPopper, Utensils } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

 export function FestivalSection() {
  const { t } = useTranslation("common")
  const festivals = t("festivalSection.festivals", { returnObjects: true }) || []
   const icons = [PartyPopper, CalendarDays, CalendarDays, Utensils, Sparkles, Sparkles]


  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Background Images - Increased visibility and adjusted for smaller screens */}
      <img
        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/premium_photo-1698500034175-3520e1021c2f.avif`}
        alt="Traditional building"
        className="absolute top-10 left-0 w-52 h-52 object-cover opacity-10 -translate-x-1/4 rotate-3 hidden sm:block rounded-xl"
      />
      <img
        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/photo-1541379889336-70f26e4c4617.avif`}
        alt="Vibrant street scene"
        className="absolute top-20 right-0 w-64 h-64 object-cover opacity-10 translate-x-1/4 -rotate-6 hidden sm:block rounded-xl"
      />
      <img
        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/photo-1527843320645-baeb96e80b5a.avif`}
        alt="Colorful traditional fabrics"
        className="absolute bottom-10 left-1/4 w-40 h-40 object-cover opacity-10 rotate-15 hidden sm:block rounded-xl"
      />
      <img
        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/photo-1697124949788-857cb46e94dc.avif`}
        alt="Person with traditional fan"
        className="absolute bottom-20 right-1/4 w-44 h-44 object-cover opacity-10 -rotate-15 hidden sm:block rounded-xl"
      />
      <img
        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/premium_photo-1666299721610-5853da3427ac.avif`}
        alt="Illuminated city structures"
        className="absolute top-1/2 left-0 w-32 h-32 object-cover opacity-10 -translate-y-1/2 -rotate-45 hidden sm:block rounded-xl"
      />
      <img
        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/premium_photo-1698500034175-3520e1021c2f.avif`} // Reusing one of the images for more coverage
        alt="Traditional building"
        className="absolute bottom-1/2 right-0 w-36 h-36 object-cover opacity-10 translate-y-1/2 rotate-45 hidden sm:block rounded-xl"
      />

      <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
             {t('festivalSection.title')}
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t('festivalSection.subtitle')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(festivals) && festivals.map((festival, index) => {
            const IconComponent = icons[index] || CalendarDays
            return (
              <Card key={index} className="...">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {festival.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow pt-2">
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    <CalendarDays className="inline-block w-4 h-4 mr-1 text-gray-500" />
                    {festival.period}
                  </p>
                  <CardDescription className="text-gray-700 text-base leading-relaxed">
                    {festival.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
// export async function getStaticProps({ locale }) {
//   return {
//     props: {
//       ...(await serverSideTranslations(locale, ['common'])),
//     },
//   };
// }
