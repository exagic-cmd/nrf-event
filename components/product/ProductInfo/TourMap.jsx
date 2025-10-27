import { useState } from 'react';

// Reusable ItineraryTimeline component
const ItineraryTimeline = ({ 
  stops, 
  title = "Tour Itinerary",
  customColor = null,
  secondaryColor = "white"
}) => {
  const [expandedStop, setExpandedStop] = useState(null);
  
  // Use custom color if provided, otherwise use the default classes
  const colorStyles = customColor ? {
    bgCircle: { backgroundColor: customColor },
    bgHeader: { backgroundColor: customColor },
    textTitle: { color: customColor },
    textBtn: { color: customColor },
    borderLine: { borderColor: customColor }
  } : null;

  const toggleExpand = (id) => {
    if (expandedStop === id) {
      setExpandedStop(null);
    } else {
      setExpandedStop(id);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div style={colorStyles ? colorStyles.bgHeader : {}} className={`p-4 text-${secondaryColor} ${!colorStyles ? 'bg-green-600' : ''}`}>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        
        <div className="p-4">
          <div className="relative">
            {stops.map((stop, index) => (
              <div key={stop.id} className="mb-8">
                {/* Timeline connector */}
                {index < stops.length - 1 && (
                  <div 
                    style={colorStyles ? colorStyles.borderLine : {}} 
                    className={`absolute ml-6 mt-12 border-l-2 h-16 z-0 ${!colorStyles ? 'border-green-500' : ''}`}
                  ></div>
                )}
                
                {/* Stop content */}
                <div className="flex">
                  {/* Circle marker with number */}
                  <div className="relative z-10 flex-shrink-0">
                    <div 
                      style={colorStyles ? colorStyles.bgCircle : {}}
                      className={`flex items-center justify-center w-12 h-12 rounded-full text-${secondaryColor} font-bold text-xl ${!colorStyles ? 'bg-green-500' : ''}`}
                    >
                      {stop.id}
                    </div>
                  </div>
                  
                  {/* Stop details */}
                  <div className="ml-4 flex-grow">
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleExpand(stop.id)}
                    >
                      {stop.time && (
                        <p className="text-gray-600 font-medium">{stop.time}</p>
                      )}
                      <h2 
                        style={colorStyles ? colorStyles.textTitle : {}}
                        className={`text-xl font-bold ${!colorStyles ? 'text-green-800' : ''}`}
                      >
                        {stop.title}
                      </h2>
                      <p className="text-gray-600">{stop.duration}</p>
                      
                      <div className={`mt-2 text-gray-700 ${expandedStop === stop.id ? '' : 'line-clamp-2'}`}>
                        {stop.description}
                      </div>
                      
                      {stop.description.length > 100 && (
                        <button 
                          style={colorStyles ? colorStyles.textBtn : {}}
                          className={`mt-1 font-medium ${!colorStyles ? 'text-green-600 hover:text-green-800' : ''}`}
                        >
                          {expandedStop === stop.id ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                    
                    {/* Distance to next stop */}
                    {stop.distance && (
                      <div className="mt-3 flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        {stop.distance}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo implementation
export default function SingaporeItinerary() {
  const itineraryStops = [
    {
      id: 1,
      time: null,
      title: "Singapore's Botanical Garden",
      duration: "Stop Time 45 Minutes | Free Admission",
      description: "Proceed to Singapore's first UNESCO World Heritage Site - the Singapore Botanic Gardens and walk through the National Orchid Garden, which boasts a sprawling display of 60,000 orchid plants.",
      distance: "25 Minutes 6968 Meters"
    },
    {
      id: 2,
      time: "08:55 AM",
      title: "Thian Hock Keng Temple",
      duration: "Stop Time 25 Minutes | Admission Included",
      description: "Visit Thian Hock Keng Temple, one of Singapore's oldest Buddhist-Taoist temples, before driving past Chinatown.",
      distance: "10 Minutes 6739 Meters"
    },
    {
      id: 3,
      time: "08:30 AM",
      title: "The Robertson House by The Crest Location",
      duration: "Stop Time 30 | Starting Point",
      description: "The activity will start from our coordination center here.",
      distance: null
    },
    {
      id: 4,
      time: "09:15 AM",
      title: "Merlion Park",
      duration: "Stop Time 30 Minutes | Free Admission",
      description: "Explore the city by driving around the Civic District, passing by the Padang, Singapore Cricket Club, the historic Parliament House, and the National Gallery Singapore. The Gallery consists of the former Supreme Court Building and the City Hall. Next, stop at Merlion Park and enjoy the impressive views of Marina Bay. Do not miss out on this picture-taking opportunity with The Merlion, a mythological creature that is part lion and part fish.",
      distance: "15 Minutes 1240 Meters"
    },
    {
      id: 5,
      time: "09:45 AM",
      title: "Kampong Glam",
      duration: "Stop Time 45 Minutes | Free Admission",
      description: "Kampong Glam, is an area where modernity meets tradition. This district has history dates back to Singapore's colonial era as the allocated area to the Malay, Arab, and Bugis communities.",
      distance: null
    }
  ];
  
  // Example usage with Singapore itinerary data and custom color
  return (
    <ItineraryTimeline 
      stops={itineraryStops} 
      title="Singapore Tour Itinerary"
      customColor="[#CC9A55]"
      secondaryColor="white"
    />
  );
}