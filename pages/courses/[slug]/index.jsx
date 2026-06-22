"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Play, Clock, Users, BookOpen } from "lucide-react"
import Pagination from "@/components/common/Pagination"
import { series } from "@/lib/data"
import { series2 } from "@/lib/data2"
const courseContent = {
  "introduction-to-singapore": {
    title: "Introduction to Singapore",
    headerImage: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1755081484/External+Links/Introduction_to_Singapore.jpg`,
    
    sections: series,
  },
  "singapore-for-leisure-travel": {
    title: "Singapore for Leisure Travel",
    headerImage: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1755081490/External+Links/Singapore_for_Leisure_Travel.jpg`,
    sections: series2, 
  },
  "singapore-as-mices-destination": {
    title: "Singapore as a MICE Destination",
    headerImage: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1755081485/External+Links/Singapore_as_a_MICE_Destination.jpg`,
 
    sections: series, 
  },
  "cruising-from-singapore": {
    title: "Cruising From Singapore",
    headerImage: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1755081483/External+Links/Cruising_From_Singapore.jpg`,
    
    sections: series, 
  },
}

export default function CoursePage() {
  const router = useRouter()
 const params = useParams()
const slug = params?.slug


  const [currentPage, setCurrentPage] = useState(1)
  const sectionsPerPage = 1

  const course = courseContent[slug]


  if (!slug) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
      </div>
    </div>
  )
}
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Button onClick={() => router.push("/")}>Back to Courses</Button>
        </div>
      </div>
    )
  }

  const allSections = course.sections

  const totalPages = Math.ceil(allSections.length / sectionsPerPage)
  const startIndex = (currentPage - 1) * sectionsPerPage
  const currentSections = allSections.slice(startIndex, startIndex + sectionsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#FE6F4F]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Courses</span>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-[#FE6F4F] border-[#FE6F4F]">
                Section {currentPage} of {totalPages}
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="relative">
        {course.headerVideo ? (
          <div className="relative h-96 bg-black">
            <video className="w-full h-full object-cover" controls poster={course.headerImage}>
              <source src={course.headerVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white">
                <Play className="w-6 h-6 mr-2" />
                Play Course Video
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative h-96">
            <Image src={course.headerImage || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{totalPages} Sections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Self-paced</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Beginner Level</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentSections.map((section, index) => (
            <div key={section.heading || index} className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-[#FE6F4F]/10 text-[#FE6F4F] hover:bg-[#FE6F4F]/20">
                    Section {startIndex + index + 1}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    {Math.round(((startIndex + index + 1) / allSections.length) * 100)}% Complete
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{section.heading}</h2>
              </div>

              {/* Video or Image Section */}
              {section.video ? (
                <div className="mb-8">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={section.video.replace("youtu.be/", "youtube.com/embed/")}
                      className="w-full h-full"
                      allowFullScreen
                      title={section.heading}
                    />
                  </div>
                </div>
              ) : section.img && section.img !== "/png" && section.img !== "" ? (
                <div className="mb-8">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={section.img || "/placeholder.svg"}
                      alt={section.heading}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : null}

              {/* Content Section */}
              <div className="space-y-6">
                <div className=" max-w-none">
                  {section.points.split("\n").map((paragraph, pIndex) => {
                    if (paragraph.trim() === "") return null
                    if (paragraph.includes("DO YOU KNOW?")) {
                      return (
                        <div key={pIndex} className="bg-blue-50 border-l-4 border-blue-400 p-2 my-1">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">?</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-blue-800 text-sm">
                                {paragraph.replace("DO YOU KNOW?", "DO YOU KNOW?").trim()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    }

                  
                    // Handle bullet points
                    if (paragraph.startsWith("*")) {
                      return (
                        <div key={pIndex} className="flex items-start">
                          <div className="flex-shrink-0 w-2 h-2 bg-[#ffae9c] rounded-full mt-2 mr-4"></div>
                          <p className="text-gray-500 text-sm mt-1">{paragraph.replace("*", "").trim()}</p>
                        </div>
                      )
                    }

                    // Regular paragraphs
                    return (
                      <p key={pIndex} className="text-gray-700 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    )
                  })}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Section Progress</span>
                  <span>
                    {startIndex + index + 1} of {allSections.length}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#FE6F4F] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((startIndex + index + 1) / allSections.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

         
          <div className="mt-12">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>

          {/* Course Completion */}
          {currentPage === Math.ceil(allSections.length / sectionsPerPage) && (
            <div className="bg-gradient-to-r from-[#FE6F4F] to-[#FE6F4F]/80 text-white rounded-lg p-8 text-center mt-8">
              <h3 className="text-2xl font-bold mb-4">🎉 Congratulations!</h3>
              <p className="text-lg mb-6">You have successfully completed "{course.title}"</p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={() => setCurrentPage(1)}
                >
                  Restart Course
                </Button>
                <Button className="bg-white text-[#FE6F4F] hover:bg-gray-100" onClick={() => router.push("/")}>
                  Back to Courses
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
