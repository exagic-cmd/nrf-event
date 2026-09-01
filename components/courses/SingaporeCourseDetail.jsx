"use client"

import { ChevronLeft, Users, Clock, Globe, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"



export default function SingaporeCourseDetail({ course, onBack }) {
  const router = useRouter()

  if (!course) return null
const slugify = (text) => {
    if (!text) return "";
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") 
      .replace(/[^\w-]+/g, "") 
      .replace(/--+/g, "-") 
      .replace(/^-+/, "") 
      .replace(/-+$/, ""); 
  };
  const handleStartCourse = () => {
    router.push(`/courses/${slugify(course.title)}`)
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Navigation */}
      <nav className="bg-surface shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center space-x-2 text-muted-foreground hover:text-[#FE6F4F]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Courses</span>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">Home / Destinations / {course.title}</div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-foreground">ABOUT THIS COURSE</h1>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <Users className="w-3 h-3 mr-1" />
                    Go get enrolled in this course
                  </Badge>
                </div>

                <div className="flex gap-6 mb-8">
                  <div className="flex-shrink-0">
                    <Image
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      width={300}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-4 uppercase">{course.title}</h2>
                    <p className="text-muted-foreground mb-4">
                      Whether you're a nature lover, culture buff, thrill-seeker or cocktail enthusiast, Singapore has a
                      wide selection of leisure offerings within easy reach.
                    </p>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">In this Module, you will learn about:</h3>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• various places of interests in the neighbourhoods and precincts</li>
                        <li>• attractions in the city and on Sentosa</li>
                        <li>• interesting walking tours</li>
                        <li>• shopping, dining and nightlife experiences</li>
                        <li>• where to indulge in luxuries</li>
                      </ul>
                    </div>
                  </div>
                </div>
   <div className="lg:col-span-1 mx-44 ">
            <div className="sticky top-8">
              <div className="bg-surface rounded-lg p-6">
                <Button
                  className="w-full bg-[#FE6F4F] hover:bg-[#FE6F4F]/90 text-white font-semibold py-3 text-lg"
                  size="lg"
                  onClick={handleStartCourse}
                >
                  START THIS COURSE
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
                {/* FAQ Section */}
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">FAQ'S</h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="covid" className="bg-muted rounded-lg px-4">
                      <AccordionTrigger className="text-left font-medium">
                        UPDATE ON COVID-19 SITUATION IN SINGAPORE
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Singapore has implemented comprehensive health and safety measures. All attractions and
                        facilities follow strict sanitization protocols. Visitors should check current entry
                        requirements and health guidelines before traveling.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="sg-clean" className="bg-muted rounded-lg px-4">
                      <AccordionTrigger className="text-left font-medium">WHAT IS SG CLEAN</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        SG Clean is a national sanitation and hygiene standard that ensures high cleanliness and public
                        health standards across Singapore's tourism establishments, including hotels, attractions, and
                        F&B outlets.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Course Details */}
                <div className="border-t pt-6 mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-6 h-6 text-muted-foreground rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-surface rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-foreground">LEVEL</div>
                      <div className="text-sm text-muted-foreground">{course.level}</div>
                    </div>
                    <div>
                      <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-sm font-medium text-foreground">COMMITMENT</div>
                      <div className="text-sm text-muted-foreground">{course.duration}</div>
                    </div>
                    <div>
                      <Globe className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-sm font-medium text-foreground">LANGUAGE</div>
                      <div className="text-sm text-muted-foreground">English</div>
                    </div>
                    <div>
                      <div className="w-6 h-6 mx-auto mb-2 text-muted-foreground">🏆</div>
                      <div className="text-sm font-medium text-foreground">HOW TO PASS</div>
                      <div className="text-sm text-muted-foreground">Pass the quizzes on the way</div>
                    </div>
                    {/* <div>
                      <div className="flex justify-center mb-2">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#FE6F4F] text-[#FE6F4F]" />
                        ))}
                      </div>
                      <div className="text-sm font-medium text-foreground">USER RATING</div>
                      <div className="text-sm text-muted-foreground">{course.rating}</div>
                    </div> */}
                   
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
       
        </div>
      </div>
    </div>
  )
}
