import React, { useRef, useState, useEffect } from "react";
import Gallery from "@/components/product/Gallery";
import ReviewSummary from "@/components/product/ProductInfo/ReviewProduct";
import TabsNavigations from "@/components/product/TabsNavigations";
import MapView from "@/components/common/Map";
import SeeMoreDetail from "@/components/product/ProductInfo/SeeMoreDetail"
import {
  Phone,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Coffee,
  Star,
  X,
  Heart,
  Clock,
  Calendar,
} from "lucide-react";

// Example usage:
const HotelPage = ({ onClose }) => {
  const images = [
    "https://cdn.pixabay.com/photo/2017/09/04/18/00/marina-bay-of-singapore-2714866_640.jpg",
    "https://cdn.pixabay.com/photo/2017/08/31/09/40/singapore-2699987_640.jpg",
    "https://cdn.pixabay.com/photo/2016/01/10/19/49/singapore-1132358_640.jpg",
    "https://cdn.pixabay.com/photo/2021/09/13/02/57/singapore-6619969_640.jpg",
  ];
const [showDetailModal , setshowDetailModal] = useState(false)
  const refs = {
    overviewI: useRef(null),
    amenitiesI: useRef(null),
    policiesI: useRef(null),
    locationI: useRef(null),
    reviewsI: useRef(null),
  };

  const center = {
    lat: 1.3521,
    lng: 103.8198,
  };


  const scrollToSection = (section) => {
    const headerOffset = 100; 
    const element = refs[section]?.current;
    if (element) {
      const y =
        element.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  const [currentSection, setCurrentSection] = useState("overviewI");
  useEffect(() => {
    const handleScroll = () => {
      const sections = Object.keys(refs);

      for (const section of sections) {
        const element = refs[section]?.current;
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setCurrentSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [refs]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Modal Content */}
      <div className="bg-surface rounded-lg shadow-xl w-full max-h-[90vh] overflow-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl">
        {/* Header with selected filters */}
        <div className="p-4 border-b ">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-semibold">
                Intercontinental Robertson Quay
              </h1>
              <div className="flex items-center mt-1 text-sm">
                <span className="flex items-center text-yellow-500 mr-2">
                  <Star className="w-4 h-4 fill-current" />
                  4.0
                </span>
                <span className="text-muted-foreground mr-2">(1124 reviews)</span>
                <span className="text-muted-foreground">• 1 Nanson Rd, Singapore</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-[#FE6F4F]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Gallery images={images} />
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1">
              <TabsNavigations
                tabs={[
                  "Overview",
                  "Amenities",
                  "Policies",
                  "Location",
                  "Reviews",
                ]}
                onTabClick={(tab) => scrollToSection(tab.toLowerCase())}
              />

              <div className="px-4">
                {/* Overview Section */}
                <section id="overview" ref={refs.overviewI} className="py-6">
                  <h2 className="text-lg font-medium mb-4">Overview</h2>
                  <p className="text-muted-foreground">
                    Enjoy sophistica­ted riverfront living at Intercont­inental
                    Robe­rtson Quay Singapore­. Chic and ove­rlooking the
                    Singapore­ River, our hote­l boasts 225 studios and suites,
                    a Me­diterranean-inspire­d restaurant, e­legant bars and a
                    rooftop swimming pool.
                  </p>
                  <button  onClick={()=> setshowDetailModal(true)} className="text-surface-foreground mt-2 underline">See More</button>
                </section>

                {/* Amenities Section */}
                <section
                  id="amenities"
                  ref={refs.amenitiesI}
                  className="py-6 border-t"
                >
                  <h2 className="text-lg font-medium mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-muted-foreground">
                      <Wifi className="w-5 h-5 mr-2" />
                      <span>Free WiFi</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Utensils className="w-5 h-5 mr-2" />
                      <span>Restaurant</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Car className="w-5 h-5 mr-2" />
                      <span>Parking</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Coffee className="w-5 h-5 mr-2" />
                      <span>Bar</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-5 h-5 mr-2" />
                      <span>Room Service</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Heart className="w-5 h-5 mr-2" />
                      <span>Fitness Center</span>
                    </div>
                  </div>
                  <button className="text-blue-600 text-sm mt-4 font-medium">
                    See All Amenities
                  </button>
                </section>

                {/* Policies Section */}
                <section
                  id="policies"
                  ref={refs.policiesI}
                  className="py-6 border-t"
                >
                  <h2 className="text-lg font-medium mb-4">Policies</h2>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="w-1/2">
                        <h3 className="font-medium text-muted-foreground">Check-in</h3>
                        <div className="flex items-center mt-1">
                          <Clock className="w-4 h-4 text-muted-foreground mr-1" />
                          <p className="text-muted-foreground">From 3:00 PM</p>
                        </div>
                      </div>
                      <div className="w-1/2">
                        <h3 className="font-medium text-muted-foreground">Check-out</h3>
                        <div className="flex items-center mt-1">
                          <Clock className="w-4 h-4 text-muted-foreground mr-1" />
                          <p className="text-muted-foreground">Until 12:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Location Section */}
                <section
                  id="location"
                  ref={refs.locationI}
                  className="py-6 border-t"
                >
                  <h2 className="text-lg font-medium mb-4">Location</h2>
                  <div className="flex items-center mb-2">
                    <MapPin className="w-5 h-5 text-muted-foreground mr-2" />
                    <p className="text-muted-foreground">
                      1 Nanson Rd, Singapore 238909
                    </p>
                  </div>
                  <div className="h-64 rounded-lg overflow-hidden">
                     <MapView center={center} zoom={10}  />
                  </div>
                </section>

                {/* Reviews Section */}
                <section
                  id="reviews"
                  ref={refs.reviewsI}
                  className="py-6 border-t"
                >
                  <h2 className="text-lg font-medium mb-4">Reviews</h2>
                  <ReviewSummary />
                </section>
              </div>
            </div>

            <div className="hidden lg:block w-80 p-4">
              <div className="border rounded-lg p-4 sticky top-4">
                <h3 className="font-medium text-lg mb-4">Book Now</h3>
                <div className="space-y-3">
                  <div className=" flex justify-between">
                    <div className=" flex-col border rounded p-3">
                      <div className="flex justify-between space-x-3">
                        <p className="text-sm text-muted-foreground">Check in</p>
                        <Calendar size={18} />
                      </div>
                      <p className="font-medium">May 9, 2025</p>
                    </div>
                    <div className=" flex-col border rounded p-3">
                      <div className="flex justify-between space-x-3">
                        <p className="text-sm text-muted-foreground">Check out</p>
                        <Calendar size={18} />
                      </div>
                      <p className="font-sm">May 10, 2025</p>
                    </div>
                  </div>
                  <div className="border rounded p-3">
                    <p className="text-sm text-muted-foreground">Guests</p>
                    <div className="flex justify-between">
                      <p className="font-medium">2 Adults, 0 Child</p>
                     
                    </div>
                  </div>
                </div>
                <button className="mt-4 bg-orange-500 text-white rounded-lg px-4 py-2 w-full font-medium">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
         {/* Compare Modal */}
       {showDetailModal && (
            <SeeMoreDetail onClose={() =>setshowDetailModal (false)}            
            />
          )}
      </div>
    </div>
  );
};

export default HotelPage;
