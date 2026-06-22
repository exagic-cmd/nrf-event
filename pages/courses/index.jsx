"use client";

import { useState } from "react";
import SingaporeCoursesList from "@/components/courses/SingaporeCoursesList";
import SingaporeCourseDetail from "@/components/courses/SingaporeCourseDetail";
import {getFullImageUrl} from "@/utils/imageService";

const courses = [
  {
    id: 1,
    title: "Introduction to Singapore",
    description: "Discover the fundamentals of Singapore's culture, history, and attractions",
    image: getFullImageUrl("v1755081484/External+Links/Introduction_to_Singapore.jpg"),
    level: "Beginner",
    enrolled: "2.1K",
    rating: 4.8
  },
  {
    id: 2,
    title: "Singapore for Leisure Travel",
    description: "Explore leisure activities, attractions, and experiences for tourists",
    image: getFullImageUrl("v1755081490/External+Links/Singapore_for_Leisure_Travel.jpg"),
    duration: "20-30 minutes", 
    level: "Beginner",
    enrolled: "1.3K",
    rating: 4.9
  },
  {
    id: 3,
    title: "Singapore as a MICE destination",
    description: "Learn about Singapore's meetings, incentives, conferences & exhibitions",
    image: getFullImageUrl("v1755081485/External+Links/Singapore_as_a_MICE_Destination.jpg"),
    duration: "25-35 minutes",
    level: "Intermediate", 
    enrolled: "890",
    rating: 4.7
  },
  {
    id: 4,
    title: "Cruising From Singapore",
    description: "Discover cruise options and maritime experiences from Singapore",
    image: getFullImageUrl("v1755081483/External+Links/Cruising_From_Singapore.jpg"),
    duration: "18-25 minutes",
    level: "Beginner",
    enrolled: "756",
    rating: 4.6
  }
]

const faqData = [
  {
    question: "What are the prerequisites for these courses?",
    answer: "No prior experience is required. These courses are designed for travel professionals, tourism students, and anyone interested in learning about Singapore as a destination."
  },
  {
    question: "How long does it take to complete all courses?",
    answer: "The complete Singapore Destination Specialist program takes approximately 2-3 hours to complete, depending on your pace and engagement with the materials."
  },
  {
    question: "Will I receive a certificate upon completion?",
    answer: "Yes, upon successful completion of all courses and passing the assessments, you will receive a Singapore Destination Specialist certificate."
  },
  {
    question: "Are the courses available in multiple languages?",
    answer: "Currently, all courses are available in English. We are working on adding more language options in the future."
  },
  {
    question: "Can I access the courses on mobile devices?",
    answer: "Our courses are fully responsive and can be accessed on any device - desktop, tablet, or mobile phone."
  }
]

export default function SingaporeCoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  return selectedCourse
    ? (
     <div className="mt-12">
       <SingaporeCourseDetail
      
        course={courses.find(c => c.id === selectedCourse)}
        onBack={() => setSelectedCourse(null)}
      />
     </div>
    )
    : (
       <div className="mt-12">
      <SingaporeCoursesList
        courses={courses}
        faqData={faqData}
        onCourseClick={(id) => setSelectedCourse(id)}
      />
      </div>
    );
}
