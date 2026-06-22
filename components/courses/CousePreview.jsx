"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Clock, Users, Star, ArrowRight } from "lucide-react"
import Image from "next/image"


export default function SingaporeCoursesList({ courses, faqData, onCourseClick }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-[#FE6F4F] to-[#FE6F4F]/80 text-white">
        <div className="absolute inset-0">
          <Image
            src={ `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1744797479/External+Links/nkfcjd8vlm4vcphzt5vv.svg` }
            alt="Singapore Skyline"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Singapore Destination Specialist</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Master the art of selling Singapore as a premier destination. Learn about attractions, culture, cuisine,
              and experiences that make Singapore unique.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                4 Comprehensive Courses
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                Professional Certificate
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                Self-Paced Learning
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Offered */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Courses Offered</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive curriculum designed to make you a Singapore destination expert
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 shadow-md"
                onClick={() => onCourseClick(course.id)}
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-[#FE6F4F] hover:bg-[#FE6F4F]">{course.level}</Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-[#FE6F4F] transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolled}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-[#FE6F4F] text-[#FE6F4F]" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#FE6F4F] hover:text-[#FE6F4F] hover:bg-[#FE6F4F]/10 p-0"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All You Need to Know */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All You Need to Know</h2>
            <p className="text-lg text-gray-600">
              Frequently asked questions about our Singapore Destination Specialist program
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-[#FE6F4F] py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#FE6F4F] to-[#FE6F4F]/80 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Become a Singapore Expert?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travel professionals who have enhanced their expertise with our comprehensive program
          </p>
          <Button size="lg" className="bg-white text-[#FE6F4F] hover:bg-gray-100 font-semibold px-8 py-3 text-lg">
            Start Your Journey Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}
