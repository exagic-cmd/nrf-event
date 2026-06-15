"use client" // This component needs to be a client component for useState

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
export function MustDoSection() {
  const allMustDos = [
    {
      id: 1,
      name: "The 10 Tastings of Singapore: Street Food",
      image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}c_thumb,g_face/v1617894191/TourEast/img/landmark_images/enknzzhwkfweepwy1s0s.webp`,
      localImages: ["/placeholder.svg?height=40&width=40&text=L1", "/placeholder.svg?height=40&width=40&text=L2"],
      rating: 4.5,
      reviews: 689,
      duration: "3 hours",
      type: "food tours",
      location: "Singapore",
      description:
        "Ready to taste the best food in Singapore? Satisfy your cravings for local food and culture with highlights along the way, together with a foodie host. Enjoy 10 delicious and typical tastings that range from sweet to savory as well as drinks on ...",
      price: 65.11,
      category: "Culinary Delights",
    },
    {
      id: 2,
      name: "Full Coverage Singapore City Tour",
      image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}c_thumb,g_face/v1617894191/TourEast/img/landmark_images/landmark_421_1052.jpg`,
      localImages: ["/placeholder.svg?height=40&width=40&text=L3", "/placeholder.svg?height=40&width=40&text=L4"],
      rating: 4.0,
      reviews: 410,
      duration: "4 hours",
      type: "city highlight tours",
      location: "Singapore",
      description:
        "Ready for a jam-packed tour, full of history, culture, stories, and sights? Checkmark from your travel bucket list all your must-sees of Singapore, because if there's a Withlocals tour that shows you all the city's ins and outs, it's this complete and...",
      price: 64.36,
      category: "City & Culture",
    },
    {
      id: 3,
      name: "Gardens by the Bay & Marina Bay Sands",
      image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}c_thumb,g_face/v1617894191/TourEast/img/products/products_images/p2o7rtmiuh6koev0fyya.webp`,
      localImages: ["/placeholder.svg?height=40&width=40&text=L5", "/placeholder.svg?height=40&width=40&text=L6"],
      rating: 4.8,
      reviews: 750,
      duration: "5 hours",
      type: "sightseeing",
      location: "Singapore",
      description:
        "Explore the iconic Supertrees, Cloud Forest, and Flower Dome at Gardens by the Bay, then ascend to the SkyPark at Marina Bay Sands for breathtaking city views. A perfect blend of nature and urban marvels.",
      price: 89.99,
      category: "Nature & Gardens",
    },
    {
      id: 4,
      name: "Sentosa Island Adventure Pass",
      image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}c_thumb,g_face/v1617894191/TourEast/img/products/products_images/farfm2cuhwwf11eakmek.webp`,
      localImages: ["/placeholder.svg?height=40&width=40&text=L7", "/placeholder.svg?height=40&width=40&text=L8"],
      rating: 4.3,
      reviews: 520,
      duration: "Full Day",
      type: "theme park",
      location: "Sentosa Island",
      description:
        "Unlock a day of excitement on Sentosa Island! This pass gives you access to Universal Studios Singapore, S.E.A. Aquarium, and Adventure Cove Waterpark. Perfect for families and thrill-seekers.",
      price: 120.0,
      category: "Entertainment & Fun",
    },
    {
      id: 5,
      name: "Night Safari Experience",
      image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}c_thumb,g_face/v1617894191/TourEast/img/products/products_images/rosrtxxqd42semkvjbzh.webp`,
      localImages: ["/placeholder.svg?height=40&width=40&text=L9", "/placeholder.svg?height=40&width=40&text=L10"],
      rating: 4.7,
      reviews: 900,
      duration: "3 hours",
      type: "wildlife",
      location: "Singapore Zoo",
      description:
        "Embark on a unique nocturnal adventure at the world's first night zoo. Witness over 2,500 animals in their naturalistic habitats under the moonlight. A truly unforgettable experience for all ages.",
      price: 49.0,
      category: "Wildlife",
    },
  ]

  const [activeCategory, setActiveCategory] = useState("All")

  // Get unique categories from the data, and add "All"
  const categories = ["All", ...new Set(allMustDos.map((item) => item.category))]

  // Filter must-do items based on the active category
  const filteredMustDos =
    activeCategory === "All" ? allMustDos : allMustDos.filter((item) => item.category === activeCategory)

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 relative z-10">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
              Things You Must Do in Singapore
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Don't miss these iconic experiences that define a trip to the Lion City.
            </p>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-6 w-max">
            {filteredMustDos.length > 0 ? (
              filteredMustDos.map((item) => (
                <div key={item.id} className="relative w-[320px] flex-shrink-0">
                  {/* Main white card content - removed offset orange background */}
                  <Card
                    className="relative z-10 flex flex-col h-full rounded-xl overflow-hidden shadow-lg" // Simplified border radius
                  >
                    {/* Image section */}
                    <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                      {" "}
                      {/* Adjusted border radius for top of image */}
                      <img
                        src={getImageUrl(item.image) || "/placeholder.svg"}
                        alt={item.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                      {/* Number overlay */}
                      <div className="absolute top-0 left-0 bg-white text-orange-500 text-3xl font-bold p-4 rounded-br-xl">
                        {item.id}
                      </div>
                      
                    </div>

                    {/* Text content section */}
                    <CardContent className="p-4 flex flex-col flex-grow">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-1">{item.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <div className="flex text-orange-500">
                          {[...Array(Math.floor(item.rating))].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                          {item.rating % 1 !== 0 && <Star className="w-4 h-4 fill-current text-orange-300" />}{" "}
                        </div>
                        <span className="ml-2 text-gray-500">{item.reviews} reviews</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.duration} | {item.type} | {item.location}
                      </p>
                      <CardDescription className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-4">
                        {item.description}
                      </CardDescription>
                      
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-600">No activities found for this category.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
