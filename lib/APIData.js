import { title } from "process";

export const 
  best_places_to_visit= [
    {
      "id": 1,
      "title": "Gardens by the Bay",
      "img": "https://cdn.pixabay.com/photo/2017/06/22/20/47/singapore-2432477_640.jpg",
      "link": "https://www.gardensbythebay.com.sg",
      "price": "140",
      "review": "4.2(56k)"
    },
    {
      "id": 2,
      "title": "Marina Bay Sands SkyPark",
      "img": "https://cdn.pixabay.com/photo/2014/11/08/12/32/singapore-522091_1280.jpg",
      "link": "https://www.marinabaysands.com",
      "price": "226",
      "review": "3.9(48k)"
    },
    {
      "id": 3,
      "title": "Singapore Botanic Gardens",
      "img": "data:image/jpeg;base64,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",
      "link": "https://www.nparks.gov.sg/gardens-parks-and-nature/parks-and-nature-reserves/singapore-botanic-gardens",
      "price": "122",
      "review": "4.8(62k)"
    },
    {
      "id": 4,
      "title": "Sentosa Island",
      "img": "https://www.pelago.co/img/collections/sentosa-island/1016-0548_sentosa-island-singapore-xlarge.jpg",
      "link": "https://www.sentosa.com.sg",
      "price": "340",
      "review": "4.9(70k)"
    }
  ]
  export const
  top_things_to_do =  [
    {
      "id": 5,
      "title": "Try the Singapore Sling at Long Bar",
      "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9EbiLAZmYgNL0N7x5sinx76SduUao5KqceA&s",
      "link": "https://www.raffles.com/singapore/dining/long-bar/",
      "price": "300",
      "review": "4.4(35k)"
    },
    {
      "id": 6,
      "title": "Explore Hawker Centres (e.g., Newton, Maxwell)",
      "img": "https://syfaganjarstory.com/wp-content/uploads/2022/12/Maxwell-Food-Centre_reg.webp",
      "link": "https://www.visitsingapore.com/en_au/editorials/hawker-centres-in-singapore/",
      "price": "155",
      "review": "4.7(50k)"
    },
    {
      "id": 7,
      "title": "Visit ArtScience Museum",
      "img": "https://blogs.stringssg.com/wp-content/uploads/2024/01/art-science-musuem.jpeg",
      "link": "https://www.marinabaysands.com/museum.html",
      "price": "519",
      "review": "4.5(40k)"
    },
    {
      "id": 8,
      "title": "Experience the Spectra Light & Water Show",
      "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDYzg_wPboM4os5LpqyER8KzSx75qZhpc9pg&s",
      "link": "https://www.marinabaysands.com/attractions/spectra.html",
      "price": "345",
      "review": "45k"
    }
  ]
  export const
  historical_places =  [
    {
      "id": 9,
      "title": "Thian Hock Keng Temple",
      "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcWZnHzI5LoROMDvnMQORk6wqZcf6cZ_s48g&s",
      "link": "http://www.thianhockkeng.com.sg",
      "price": "200",
      "review": "4.7(22k)"
    },
    {
      "id": 10,
      "title": "National Museum of Singapore",
      "img": "https://res.klook.com/images/fl_lossy.progressive,q_65/c_fill,w_1295,h_720/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/e75d2145-National-Museum-of-Singapore/NationalMuseumofSingapore-Klook.jpg",
      "link": "https://www.nationalmuseum.sg",
      "price": "230",
      "review": "4.2(30k)"
    },
    {
      "id": 11,
      "title": "Lau Pa Sat (Telok Ayer Market)",
      "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBCvRKZb2IIalYVLgf6micqNlRFEew9SxPIQ&s",
      "link": "https://laupasat.sg",
      "price": "344",
      "review": "4.4(18k)"
    },
    {
      "id": 12,
      "title": "Fort Siloso",
      "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQIbW5sxqxkFy4LMuZ4QJNQPhdAzaaa6tI6A&s",
      "link": "https://www.sentosa.com.sg/en/things-to-do/attractions/fort-siloso/",
      "price": "122",
      "review": "4.8(25k)"
    }
  ]

export const data = [
  {
    "id": 1,
    "title": "Sentosa Island Adventure",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/sentosa-island/sentosa-island-01.jpg",
    "price": 250,
    "duration": 2,
    "description": "Experience the thrills of Sentosa Island with visits to Universal Studios, S.E.A. Aquarium, and the Skyride."
  },
  {
    "id": 2,
    "title": "Marina Bay Marvels",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/marina-bay/marina-bay-01.jpg",
    "price": 300,
    "duration": 3,
    "description": "Explore Marina Bay Sands, Gardens by the Bay, and enjoy a river cruise along the Singapore River."
  },
  {
    "id": 3,
    "title": "Cultural Chinatown Tour",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/chinatown/chinatown-01.jpg",
    "price": 150,
    "duration": 2,
    "description": "Dive into the rich heritage of Chinatown with visits to temples, markets, and traditional eateries."
  },
  {
    "id": 4,
    "title": "Little India Exploration",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/little-india/little-india-01.jpg",
    "price": 150,
    "duration": 2,
    "description": "Immerse yourself in the vibrant colors and flavors of Little India, including temples and local markets."
  },
  {
    "id": 5,
    "title": "Singapore Zoo & Night Safari",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/singapore-zoo/singapore-zoo-01.jpg",
    "price": 200,
    "duration": 2,
    "description": "Discover wildlife at the Singapore Zoo and experience the nocturnal animals during the Night Safari."
  },
  {
    "id": 6,
    "title": "Gardens by the Bay Experience",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/gardens-by-the-bay/gardens-by-the-bay-01.jpg",
    "price": 180,
    "duration": 2,
    "description": "Stroll through the futuristic Gardens by the Bay and marvel at the Supertree Grove and Cloud Forest."
  },
  {
    "id": 7,
    "title": "Orchard Road Shopping Spree",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/orchard-road/orchard-road-01.jpg",
    "price": 200,
    "duration": 2,
    "description": "Indulge in retail therapy along Orchard Road, Singapore's premier shopping destination."
  },
  {
    "id": 8,
    "title": "Singapore Flyer & City Tour",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/singapore-flyer/singapore-flyer-01.jpg",
    "price": 220,
    "duration": 2,
    "description": "Enjoy panoramic views from the Singapore Flyer and explore key city landmarks."
  },
  {
    "id": 9,
    "title": "Historical Kampong Glam Walk",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/kampong-glam/kampong-glam-01.jpg",
    "price": 160,
    "duration": 2,
    "description": "Discover the Malay heritage in Kampong Glam, visiting the Sultan Mosque and vibrant Haji Lane."
  },
  {
    "id": 10,
    "title": "Pulau Ubin Nature Escape",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/pulau-ubin/pulau-ubin-01.jpg",
    "price": 170,
    "duration": 2,
    "description": "Experience rustic charm and nature trails on Pulau Ubin, a glimpse into Singapore's past."
  },
  {
    "id": 11,
    "title": "Jurong Bird Park Visit",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/jurong-bird-park/jurong-bird-park-01.jpg",
    "price": 190,
    "duration": 2,
    "description": "Explore the world's largest bird park by number of birds, featuring over 5,000 birds across 400 species."
  },
  {
    "id": 12,
    "title": "ArtScience Museum Exploration",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/artscience-museum/artscience-museum-01.jpg",
    "price": 180,
    "duration": 2,
    "description": "Engage with interactive exhibits at the ArtScience Museum, where art meets science and technology."
  },
  {
    "id": 13,
    "title": "Singapore River Cruise",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/singapore-river/singapore-river-01.jpg",
    "price": 160,
    "duration": 2,
    "description": "Enjoy a scenic cruise along the Singapore River, passing by historical landmarks and modern skyscrapers."
  },
  {
    "id": 14,
    "title": "Botanic Gardens Leisure Day",
    "image": "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/singapore-botanic-gardens/singapore-botanic-gardens-01.jpg",
    "price": 150,
    "duration": 2,
    "description": "Relax in the lush Singapore Botanic Gardens, a UNESCO World Heritage Site with diverse flora."
  },
  {
    id: 8,
    title: "Singapore Flyer & City Tour",
    images: [
      "https://unsplash.com/photos/singapore-flyer-1.jpg",
      "https://unsplash.com/photos/singapore-flyer-2.jpg",
      "https://unsplash.com/photos/singapore-flyer-3.jpg",
      "https://unsplash.com/photos/singapore-flyer-4.jpg",
    ],
    price: 220,
    duration: 2,
    description:
      "Enjoy panoramic views from the Singapore Flyer and explore key city landmarks.",
  },
  {
    id: 9,
    title: "Historical Kampong Glam Walk",
    images: [
      "https://www.gettyimages.com/photos/kampong-glam-singapore-1.jpg",
      "https://www.gettyimages.com/photos/kampong-glam-singapore-2.jpg",
      "https://www.gettyimages.com/photos/kampong-glam-singapore-3.jpg",
    ],
    price: 220,
    duration: 2,
    description: "Enjoy historically",
  },
  {
    id: 10,
    title: "River Safari Expedition",
    images: [
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/river-safari/river-safari-01.jpg",
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/river-safari/river-safari-02.jpg",
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/river-safari/river-safari-03.jpg",
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/river-safari/river-safari-04.jpg",
    ],
    price: 190,
    duration: 2,
    description:
      "Cruise the River Safari and meet aquatic animals from the world’s greatest rivers including the Amazon and Nile.",
  },
  {
    id: 11,
    title: "Pulau Ubin Nature Retreat",
    images: [
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/nature-areas/pulau-ubin/pulau-ubin-01.jpg",
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/nature-areas/pulau-ubin/pulau-ubin-02.jpg",
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/nature-areas/pulau-ubin/pulau-ubin-03.jpg",
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/nature-areas/pulau-ubin/pulau-ubin-04.jpg",
    ],
    price: 160,
    duration: 1,
    description:
      "Escape to the rustic charm of Pulau Ubin, explore trails, wetlands, and traditional kampung life.",
  },
  {
    id: 12,
    title: "Adventure Cove Waterpark",
    images: [
      "https://www.rwsentosa.com/-/media/project/non-gaming/rwsentosa/attractions/adventure-cove-waterpark/gallery/acw-gallery01.jpg",
      "https://www.rwsentosa.com/-/media/project/non-gaming/rwsentosa/attractions/adventure-cove-waterpark/gallery/acw-gallery02.jpg",
      "https://www.rwsentosa.com/-/media/project/non-gaming/rwsentosa/attractions/adventure-cove-waterpark/gallery/acw-gallery03.jpg",
      "https://www.rwsentosa.com/-/media/project/non-gaming/rwsentosa/attractions/adventure-cove-waterpark/gallery/acw-gallery04.jpg",
    ],
    price: 170,
    duration: 1,
    description:
      "Get your adrenaline pumping at Adventure Cove Waterpark with thrilling slides and marine encounters.",
  },
  {
    id: 13,
    title: "ArtScience Museum Journey",
    images: [
      "https://media.timeout.com/images/105280460/image.jpg",
      "https://static.thehoneycombers.com/wp-content/uploads/sites/2/2021/10/artscience-museum-exhibitions-singapore.jpg",
      "https://cdn.thefinder.life/wp-content/uploads/2021/03/artsciencemuseum-e1614751793702.jpg",
      "https://res.klook.com/image/upload/fl_lossy.progressive,q_85/c_fill,w_680/v1609317505/blog/gjwsjdsloz1dncuogdfy.jpg",
    ],
    price: 140,
    duration: 1,
    description:
      "Explore futuristic exhibitions that blend art, science, design, media and technology at the ArtScience Museum.",
  },
  {
    id: 14,
    title: "Clarke Quay Nightlife Experience",
    images: [
      "https://media.timeout.com/images/103842698/750/422/image.jpg",
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/clarke-quay/clarke-quay-02.jpg",
      "https://static01.nyt.com/images/2021/06/13/travel/13hours-singapore/merlin_177911421_5e65a1aa-f4de-4b49-b4f6-cf5ef3fdc0cc-superJumbo.jpg",
      "https://c8.alamy.com/comp/FXF08D/clarke-quay-in-singapore-asia-FXF08D.jpg",
    ],
    price: 160,
    duration: 1,
    description:
      "Enjoy riverside dining, bars, and nightlife along the bustling Clarke Quay waterfront district.",
  },
  {
    id: 15,
    title: "Jurong Bird Paradise",
    images: [
      "https://www.mandai.com/content/dam/mandai/images/jbp/homepage/bird-paradise-homepage.jpg",
      "https://www.mandai.com/content/dam/mandai/images/jbp/visit/gallery/gallery1.jpg",
      "https://www.mandai.com/content/dam/mandai/images/jbp/visit/gallery/gallery2.jpg",
      "https://www.mandai.com/content/dam/mandai/images/jbp/visit/gallery/gallery3.jpg",
    ],
    price: 130,
    duration: 1,
    description:
      "See over 3,500 birds across 400 species in beautifully landscaped aviaries at Jurong Bird Paradise.",
  },
  {
    id: 16,
    title: "National Museum of Singapore Tour",
    images: [
      "https://www.nhb.gov.sg/nationalmuseum/-/media/nms/assets/images/homepage.jpg",
      "https://media.timeout.com/images/105280463/image.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/2/25/National_Museum_of_Singapore_2017-01_img03.jpg",
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/arts/national-museum/national-museum-01.jpg",
    ],
    price: 120,
    duration: 1,
    description:
      "Discover Singapore’s rich history and culture through immersive exhibits at the National Museum.",
  },
  {
    id: 17,
    title: "MacRitchie Treetop Walk",
    images: [
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/nature-reserves/macritchie/macritchie-01.jpg",
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/nature-reserves/macritchie/macritchie-02.jpg",
      "https://media.timeout.com/images/105215580/image.jpg",
      "https://www.timeout.com/singapore/things-to-do/the-treetop-walk-at-macritchie-reservoir",
    ],
    price: 100,
    duration: 1,
    description:
      "Take a refreshing hike through nature and walk across the famous suspension bridge canopy walk.",
  },
  {
    id: 18,
    title: "Southern Ridges Nature Trail",
    images: [
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/parks-and-nature-reserves/the-southern-ridges/southern-ridges-01.jpg",
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/parks-and-nature-reserves/the-southern-ridges/southern-ridges-02.jpg",
      "https://media.timeout.com/images/105215581/image.jpg",
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/parks-and-nature-reserves/the-southern-ridges/southern-ridges-03.jpg",
    ],
    price: 100,
    duration: 1,
    description:
      "Walk through parks and forest trails with scenic views and iconic Henderson Waves bridge.",
  },
  {
    id: 19,
    title: "Fort Canning Historical Walk",
    images: [
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/parks-and-nature-reserves/fort-canning-park/fort-canning-park-01.jpg",
      "https://www.nparks.gov.sg/-/media/nparks-real-content/places/parks-and-nature-reserves/fort-canning-park/fort-canning-park-02.jpg",
      "https://media.timeout.com/images/105215582/image.jpg",
      "https://static01.nyt.com/images/2020/11/08/travel/08Hours-FortCanning/08Hours-FortCanning-articleLarge.jpg",
    ],
    price: 110,
    duration: 1,
    description:
      "Uncover the stories of ancient kings and WWII bunkers at the historic Fort Canning Park.",
  },
  {
    id: 20,
    title: "Peranakan Heritage Trail",
    images: [
      "https://www.peranakanmuseum.org.sg/images/default-source/default-album/peranakanmuseum.jpg",
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/arts/peranakan-museum/peranakan-museum-01.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/d/d0/Peranakan_Museum_Singapore_20090215.jpg",
      "https://media.timeout.com/images/105280461/image.jpg",
    ],
    price: 130,
    duration: 1,
    description:
      "Explore Peranakan culture, fashion, and history through colorful shophouses and the Peranakan Museum.",
  },
];



export const data2 = [
  {
    transfers: [
      {
        id: 1,
        title: "Changi Airport to Hotel",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7_BW2BcI_2w5TncmUd69ptYQ2D2hfvZIDDg&s",
          "https://www.changiairport.com/content/dam/cacorp/experiences-amenities/transportation/Car-Rental.jpg",
          "https://www.changiairport.com/content/dam/cacorp/experiences-amenities/transportation/Taxi.jpg"
        ],
        price: 50,
        discount: "15%",
        duration: "30-45 mins",
        description: "Comfortable private transfer from Changi Airport to your hotel in the city.",
        fullDescription: "Enjoy a hassle-free arrival with our private airport transfer service. Your professional driver will meet you at arrivals and assist with luggage. Vehicles are air-conditioned and regularly sanitized.",
        highlights: [
          "Meet & greet service",
          "24/7 availability",
          "Luggage assistance",
          "Child seats available"
        ],
        inclusions: ["Private vehicle", "All taxes", "Tolls"],
        exclusions: ["Gratuities", "Excess luggage"],
        tourGuide: false,
        option: "2 Ways Deals",
        reviews: 1023,
        city: "Singapore",
        transferType: "Airport",
        minPax: 1,
        maxPax: 3,
        childPrice: 40,
        adultPrice: 50,
        vehicleOptions: [
          {
            type: "Sedan",
            capacity: 3
          },
          {
            type: "MPV",
            capacity: 6
          }
        ]
      },
      {
        id: 2,
        title: "Hotel to Universal Studios",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_zhyxDQYqRmlZ9JJPURXhE7eBwnukQmyfOw&s",
          "https://images.trvl-media.com/lodging/37000000/36870000/36866100/36866077/59b9a0d0.jpg?impolicy=fcrop&w=357&h=201&p=1&q=medium",
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM6OYXwI3BJp0ec8eKAChHrWsz5wmGdrobTgB3CuX5d-S94QpetDsonKPF7sNpW2p19nw&usqp=CAU",
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSBTx70nc64vLer8rYb1BgM-S_VpX4H22ZsQ&s"
        ],
        price: 30,
        discount: "10%",
        duration: "20-30 mins",
        description: "Shared ride service to Universal Studios from selected city hotels.",
        fullDescription: "Convenient shared shuttle service operating between major hotels and Universal Studios Singapore. Fixed departure times with comfortable seating and air-conditioning.",
        highlights: [
          "Multiple departure times",
          "Hotel pickup",
          "Affordable option",
          "Direct service"
        ],
        inclusions: ["Shared transfer", "Basic insurance"],
        exclusions: ["Park tickets", "Food"],
        tourGuide: false,
        option: "2 Ways Deals",
        reviews: 843,
        city: "Singapore",
        transferType: "Theme Park",
        minPax: 4,
        maxPax: 12,
        childPrice: 20,
        adultPrice: 30,
        vehicleOptions: [
          {
            type: "Minibus",
            capacity: 12
          }
        ]
      },
      {
        id: 3,
        title: "Sentosa Island",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbd50tsoawy3g2xhCn9Y5TZ39FuLiJu_rZfw&s",
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5yUlb69j42egInFdvgVG_wYvbJm-eIHk2HTabkoF55tY6mWFDRzO3w-8FNerDc7L5ttg&usqp=CAU",
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5yUlb69j42egInFdvgVG_wYvbJm-eIHk2HTabkoF55tY6mWFDRzO3w-8FNerDc7L5ttg&usqp=CAU",
       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5yUlb69j42egInFdvgVG_wYvbJm-eIHk2HTabkoF55tY6mWFDRzO3w-8FNerDc7L5ttg&usqp=CAU"
        ],
        price: 45,
        discount: "12%",
        duration: "Full Day",
        description: "Convenient return transfer to and from Sentosa Island attractions.",
        fullDescription: "Flexible transfer service allowing you to explore Sentosa Island at your own pace with return trips throughout the day. Includes access to Sentosa Express monorail.",
        highlights: [
          "Multiple return times",
          "Access to Sentosa Express",
          "All-day flexibility",
          "Beach access"
        ],
        inclusions: ["Return transfers", "Sentosa entry"],
        exclusions: ["Attraction tickets"],
        tourGuide: false,
        option: "2 Ways Deals",
        reviews: 1251,
        city: "Singapore",
        transferType: "Island",
        minPax: 1,
        maxPax: 4,
        childPrice: 30,
        adultPrice: 45,
        vehicleOptions: [
          {
            type: "Sedan",
            capacity: 4
          },
          {
            type: "MPV",
            capacity: 6
          }
        ]
      },
      {
        id: 4,
        title: "Marina Bay Sands ",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7_BW2BcI_2w5TncmUd69ptYQ2D2hfvZIDDg&s",
          "https://www.marinabaysands.com/content/dam/marinabaysands/master/main/home/hotel/hotel-tower.jpg",
          "https://www.marinabaysands.com/content/dam/marinabaysands/master/main/home/hotel/deluxe-room.jpg"
        ],
        price: 60,
        discount: "18%",
        duration: "20-40 mins",
        description: "Direct private transfer to the Marina Bay Sands Hotel from anywhere in Singapore.",
        fullDescription: "Premium transfer service exclusively for Marina Bay Sands guests. Includes luggage handling and priority access to hotel drop-off points.",
        highlights: [
          "Exclusive hotel access",
          "Luxury vehicles",
          "Priority drop-off",
          "24/7 service"
        ],
        inclusions: ["Private transfer", "Meet & greet", "Bottled water"],
        exclusions: ["Hotel stay"],
        tourGuide: false,
        option: "2 Ways Deals",
        reviews: 978,
        city: "Singapore",
        transferType: "Hotel",
        minPax: 1,
        maxPax: 3,
        childPrice: 45,
        adultPrice: 60,
        vehicleOptions: [
          {
            type: "Luxury Sedan",
            capacity: 3
          },
          {
            type: "Premium MPV",
            capacity: 6
          }
        ]
      },
      {
        id: 5,
        title: "Night Safari Transfer",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdhq08c9laPrbzIgdF7GRxzNcP1ZgbJiyDDp7OMn7y5hH_mLOr09lm1m5oeXj3-791z-E&usqp=CAU",
          "https://www.wrs.com.sg/content/dam/wrs/parks/night-safari/explore/our-animals/asian-elephant/ns-our-animals-asian-elephant-main.jpg",
          "https://www.wrs.com.sg/content/dam/wrs/parks/night-safari/explore/experiences/tram-ride/ns-experiences-tram-ride-main.jpg"
        ],
        price: 40,
        discount: "25%",
        duration: "4 hours",
        description: "Round trip transport to Night Safari, Singapore's nocturnal wildlife experience.",
        fullDescription: "Evening transfer package including round-trip transportation to Singapore's famous Night Safari. Includes tram ride ticket and scheduled return transfers.",
        highlights: [
          "Tram ride included",
          "Scheduled return",
          "Nocturnal animal viewing",
          "Cultural shows"
        ],
        inclusions: ["Return transfer", "Tram ticket"],
        exclusions: ["Food", "Guide"],
        tourGuide: false,
        option: "Luxury Transfers",
        reviews: 1333,
        city: "Singapore",
        transferType: "Attraction",
        minPax: 2,
        maxPax: 6,
        childPrice: 30,
        adultPrice: 40,
        vehicleOptions: [
          {
            type: "Minivan",
            capacity: 6
          }
        ]
      },
      {
        id: 6,
        title: "Hotel to Cruise Transfer",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTysygisRU_WM56bMgL9OYok3bTzKH92lY_w&s",
          "https://www.maritimesingapore.com/content/dam/mpa/port-facilities/mps/mps-terminal.jpg",
          "https://www.maritimesingapore.com/content/dam/mpa/port-facilities/mps/mps-terminal-interior.jpg"
        ],
        price: 35,
        discount: "8%",
        duration: "30 mins",
        description: "Seamless hotel to Marina Bay Cruise Centre transfer service.",
        fullDescription: "Reliable transfer service from your hotel to the cruise terminal with luggage assistance. Vehicles equipped for cruise passengers with extra storage space.",
        highlights: [
          "Luggage handling",
          "Timely service",
          "Extra storage",
          "Flight monitoring"
        ],
        inclusions: ["Private transfer", "Meet & greet"],
        exclusions: ["Porters"],
        tourGuide: false,
        option: "Luxury Transfers",
        reviews: 765,
        city: "Singapore",
        transferType: "Cruise",
        minPax: 1,
        maxPax: 4,
        childPrice: 25,
        adultPrice: 35,
        vehicleOptions: [
          {
            type: "MPV",
            capacity: 4
          },
          {
            type: "Van",
            capacity: 8
          }
        ]
      },
      {
        id: 7,
        title: "Private Van Transfer for Groups",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNHyTuZqJz0q5IRV_z9_u-k9QqlfSsNRMjZw&s",
          "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8",
          "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d"
        ],
        price: 80,
        discount: "10%",
        duration: "Custom",
        description: "Spacious van with professional driver for small group transfers.",
        fullDescription: "Ideal for families or small groups needing comfortable transportation around Singapore. Customizable itinerary with multiple stops available.",
        highlights: [
          "Group discount",
          "Custom itinerary",
          "Multiple stops",
          "Child seats"
        ],
        inclusions: ["Private van", "English-speaking driver"],
        exclusions: ["Attraction tickets"],
        tourGuide: false,
        option: "Star(For India)",
        reviews: 1102,
        city: "Singapore",
        transferType: "Group",
        minPax: 5,
        maxPax: 8,
        childPrice: 60,
        adultPrice: 80,
        vehicleOptions: [
          {
            type: "Van",
            capacity: 8
          }
        ]
      },
      {
        id: 8,
        title: "Luxury Limousine Transfer",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt_r6qEX99HfcX4Nf7DUOVTAsVCvoEPQZpFuSRW5kS_dsKvhYSdSb3-HJwZSyiscMOCgc&usqp=CAU",
          "https://media.istockphoto.com/id/1151120585/photo/black-luxury-sedan-car.jpg",
          "https://media.istockphoto.com/id/1334473388/photo/luxury-car-on-the-road-at-sunset.jpg"
        ],
        price: 120,
        discount: "22%",
        duration: "Custom",
        description: "Travel in style with our luxury limousine transfers for executives and VIPs.",
        fullDescription: "Premium limousine service with professional chauffeurs. Ideal for business travelers, weddings, or special occasions. Includes complimentary bottled water and WiFi.",
        highlights: [
          "Executive service",
          "Complimentary WiFi",
          "Bottled water",
          "Newspapers"
        ],
        inclusions: ["Private limousine", "Chauffeur"],
        exclusions: ["Gratuities"],
        tourGuide: false,
        option: "Star(For India)",
        reviews: 1500,
        city: "Singapore",
        transferType: "Luxury",
        minPax: 1,
        maxPax: 3,
        childPrice: 100,
        adultPrice: 120,
        vehicleOptions: [
          {
            type: "Limousine",
            capacity: 3
          },
          {
            type: "Executive Sedan",
            capacity: 3
          }
        ]
      },
      {
        id: 9,
        title: "Wheelchair Accessible Transfer",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNHyTuZqJz0q5IRV_z9_u-k9QqlfSsNRMjZw&s",
          "https://www.mobilitymojo.com/wp-content/uploads/2020/12/Wheelchair-accessible-vehicle.jpg",
          "https://www.mobilitymojo.com/wp-content/uploads/2020/12/Accessible-taxi.jpg"
        ],
        price: 55,
        discount: "14%",
        duration: "Custom",
        description: "Inclusive transport options for elderly or wheelchair-bound passengers.",
        fullDescription: "Specially equipped vehicles with wheelchair ramps/lifts and trained drivers. Suitable for passengers with mobility challenges or special needs.",
        highlights: [
          "Wheelchair access",
          "Trained staff",
          "Patient transport",
          "Door-to-door"
        ],
        inclusions: ["Accessible vehicle", "Assistance"],
        exclusions: ["Medical care"],
        tourGuide: false,
        option: "2 Ways Deals",
        reviews: 1198,
        city: "Singapore",
        transferType: "Special Needs",
        minPax: 1,
        maxPax: 2,
        childPrice: 40,
        adultPrice: 55,
        vehicleOptions: [
          {
            type: "Wheelchair Van",
            capacity: 2
          }
        ]
      },
      {
        id: 10,
        title: "Flyer Transfer",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNHyTuZqJz0q5IRV_z9_u-k9QqlfSsNRMjZw&s",
          "https://www.singaporeflyer.com/content/dam/singaporeflyer/en/gallery/singapore-flyer-gallery-01.jpg",
          "https://www.singaporeflyer.com/content/dam/singaporeflyer/en/gallery/singapore-flyer-gallery-02.jpg"
        ],
        price: 50,
        discount: "16%",
        duration: "2 hours",
        description: "To and from transfers with tickets to the iconic Singapore Flyer included.",
        fullDescription: "Complete package including round-trip transfers and admission to Asia's largest observation wheel. Enjoy panoramic views of Singapore's skyline.",
        highlights: [
          "Flyer tickets included",
          "Panoramic views",
          "Flexible timing",
          "City skyline"
        ],
        inclusions: ["Return transfer", "Flyer ticket"],
        exclusions: ["Meals"],
        tourGuide: false,
        option: "Luxury Transfers",
        reviews: 870,
        city: "Singapore",
        transferType: "Attraction",
        minPax: 1,
        maxPax: 4,
        childPrice: 35,
        adultPrice: 50,
        vehicleOptions: [
          {
            type: "Sedan",
            capacity: 4
          },
          {
            type: "MPV",
            capacity: 6
          }
        ]
      },
      {
        id: 11,
        title: "Two-Way Luxury Transfers ",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcFo5Ur8IUd69Tighl_E3rDKEik-JqmfLuHA&s",
          "https://images.unsplash.com/photo-1555215695-3004980ad54e",
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe"
        ],
        price: 200,
        discount: "20%",
        duration: "Multi-day",
        description: "Luxury Transfers package from India with two-way return and VIP features.",
        fullDescription: "Premium two-way transfer service connecting major Indian cities to Singapore. Includes airport meet & greet, lounge access, and concierge services.",
        highlights: [
          "Two-way service",
          "Lounge access",
          "Concierge",
          "Priority handling"
        ],
        inclusions: ["Return transfers", "Lounge access"],
        exclusions: ["Flights"],
        tourGuide: false,
        option: "2 Ways Deals",
        reviews: 1420,
        city: "Multi-city",
        transferType: "International",
        minPax: 1,
        maxPax: 2,
        childPrice: 150,
        adultPrice: 200,
        vehicleOptions: [
          {
            type: "Luxury Sedan",
            capacity: 2
          },
          {
            type: "Executive Van",
            capacity: 4
          }
        ]
      },
      {
        id: 12,
        title: "Garden by the Bay ",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjSIRJJBBwtWzA_RaiU2pKheBEH20kl1Y2tQ&s",
          "https://www.gardensbythebay.com.sg/content/dam/gbb-2021/image/attractions/flower-dome/01-main/flower-dome-main-01.jpg",
          "https://www.gardensbythebay.com.sg/content/dam/gbb-2021/image/attractions/cloud-forest/01-main/cloud-forest-main-01.jpg"
        ],
        price: 65,
        discount: "15%",
        duration: "3 hours",
        description: "Transfer service with admission to Gardens by the Bay's Flower Dome and Cloud Forest.",
        fullDescription: "Enjoy convenient transportation to Singapore's iconic Gardens by the Bay with included admission to the Flower Dome and Cloud Forest conservatories.",
        highlights: [
          "Conservatory tickets",
          "Supertree views",
          "Climate-controlled",
          "Horticultural displays"
        ],
        inclusions: ["Return transfer", "Conservatory tickets"],
        exclusions: ["OCBC Skyway"],
        tourGuide: false,
        option: "Nature Transfers",
        reviews: 925,
        city: "Singapore",
        transferType: "Attraction",
        minPax: 1,
        maxPax: 4,
        childPrice: 45,
        adultPrice: 65,
        vehicleOptions: [
          {
            type: "MPV",
            capacity: 6
          }
        ]
      },
      {
        id: 13,
        title: "Family Transfer",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcFo5Ur8IUd69Tighl_E3rDKEik-JqmfLuHA&s",
          "https://www.wrs.com.sg/content/dam/wrs/parks/jurong-bird-park/explore/our-animals/penguins/jbp-our-animals-penguins-main.jpg",
          "https://www.wrs.com.sg/content/dam/wrs/parks/jurong-bird-park/explore/experiences/feeding/jbp-experiences-bird-feeding-main.jpg"
        ],
        price: 55,
        discount: "18%",
        duration: "Full Day",
        description: "Family-friendly transfer service to Jurong Bird Park with flexible return times.",
        fullDescription: "Comfortable transfer service perfect for families visiting Asia's largest bird park. Includes drop-off and pick-up at convenient times with child seat options available.",
        highlights: [
          "Family-friendly",
          "Child seats",
          "Flexible timing",
          "Park tips"
        ],
        inclusions: ["Return transfer", "Park map"],
        exclusions: ["Park tickets"],
        tourGuide: false,
        option: "Family Transfers",
        reviews: 780,
        city: "Singapore",
        transferType: "Attraction",
        minPax: 2,
        maxPax: 6,
        childPrice: 35,
        adultPrice: 55,
        vehicleOptions: [
          {
            type: "Family Van",
            capacity: 6
          }
        ]
      },
      {
        id: 14,
        title: "Singapore Zoo Transfer",
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcFo5Ur8IUd69Tighl_E3rDKEik-JqmfLuHA&s",
          "https://www.wrs.com.sg/content/dam/wrs/parks/singapore-zoo/explore/our-animals/orangutan/sz-our-animals-orangutan-main.jpg",
          "https://www.wrs.com.sg/content/dam/wrs/parks/singapore-zoo/explore/experiences/feeding/sz-experiences-animal-feeding-main.jpg"
        ],
        price: 48,
        discount: "12%",
        duration: "Full Day",
        description: "Direct transfer service to Singapore Zoo with optional River Safari add-on.",
        fullDescription: "Efficient transfer to the world-famous Singapore Zoo with open-concept enclosures. Option to combine with River Safari for a full wildlife experience.",
        highlights: [
          "Early access",
          "Optional add-ons",
          "Wildlife experience",
          "Rainforest setting"
        ],
        inclusions: ["One-way transfer", "Zoo map"],
        exclusions: ["Zoo tickets"],
        tourGuide: false,
        option: "Wildlife Transfers",
        reviews: 1105,
        city: "Singapore",
        transferType: "Attraction",
        minPax: 1,
        maxPax: 4,
        childPrice: 32,
        adultPrice: 48,
        vehicleOptions: [
          {
            type: "MPV",
            capacity: 6
          }
        ]
      },
      {
        id: 15,
        title: "Chinatown Transfer",
        images: [
          "https://dynamic-media.tacdn.com/media/photo-o/2e/db/6f/03/caption.jpg?w=800&h=600&s=1",
          "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/food-drink/chinatown-food-street/chinatown-food-street-01.jpg",
          "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/chinatown/buddha-tooth-relic-temple-01.jpg"
        ],
        price: 60,
        discount: "10%",
        duration: "3 hours",
        description: "Transfer service with guided introduction to Chinatown's cultural highlights.",
        fullDescription: "More than just a transfer - includes brief guided introduction to Chinatown's temples, markets and food streets with drop-off at your preferred location.",
        highlights: [
          "Cultural introduction",
          "Temple visits",
          "Market tips",
          "Food recommendations"
        ],
        inclusions: ["Transfer", "Cultural introduction"],
        exclusions: ["Full tour"],
        tourGuide: true,
        option: "Cultural Transfers",
        reviews: 875,
        city: "Singapore",
        transferType: "Cultural",
        minPax: 1,
        maxPax: 4,
        childPrice: 40,
        adultPrice: 60,
        vehicleOptions: [
          {
            type: "Sedan",
            capacity: 4
          }
        ],
        guidedLanguage: ["English", "Mandarin"]
      }
    ],

    hotels: [
      {
        id: 1,
        title: "Marina Bay Sands",
        area: "Marina Bay",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQz8uO1iqyBF244_qIA8Q8-9qwRkJvxLN5Zw&s",
        price: 350,
        reviews: 72000,
        discount: 15,
        option: "Star(For India)",
      },
      {
        id: 2,
        title: "The Fullerton Hotel",
        area: "Central Business District",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUQPB5px9A1qPeFVVhMfzu65kscTwoujJxEQ&s",
        price: 290,
        reviews: 72000,
        discount: 20,
        option: "Star(For India)",
      },
      {
        id: 3,
        title: "Raffles Singapore",
        area: "City Hall",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiIWGUowq3mIqEGIIKMP8uGrPGTxkUB3PSNQ&s",
        price: 420,
        reviews: 72000,
        discount: 10,
        option: "Special Deals",
      },
      {
        id: 4,
        title: "Hotel Boss",
        area: "Lavender",
        image: "https://content.skyscnr.com/available/1448680742/1448680742_WxH.jpg",
        price: 110,
        reviews: 72000,
        discount: 25,
        option: "Promotion",
      },
      {
        id: 5,
        title: "Park Hotel Clarke Quay",
        area: "Clarke Quay",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTie4bRG8OYi3V8dM-pKQnDJvSg3FyuoHgPSw&s",
        price: 180,
        reviews: 72000,
        discount: 12,
        option: "Star(For India)",
      },
      {
        id: 6,
        title: "YOTEL Singapore",
        area: "Orchard Road",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwOUB_dMoFDaFMJL2nARoEBC8ZhXD6e2sB4w&s",
        price: 160,
        reviews: 72000,
        discount: 18,
        option: "Promotion",
      },
      {
        id: 7,
        title: "Village Hotel Sentosa",
        area: "Sentosa Island",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtt0cOHDhIT8qi_xZy6AXZCAk_2mcw00EnNQ&s",
        price: 200,
        reviews: 72000,
        discount: 8,
        option: "Star(For India)",
      },
      {
        id: 8,
        title: "Hotel G Singapore",
        area: "Middle Road",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhcI1HgRxgRaJAEarnaItOFhEvo4zfwu8PzA&s",
        price: 130,
        reviews: 72000,
        discount: 22,
        option: "Star(For India)",
      },
      {
        id: 9,
        title: "Mandarin Orchard",
        area: "Orchard Road",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReQmugPBpFUVSXpW-GUJAKXS6H2U9lveEcMw&s",
        price: 240,
        reviews: 72000,
        discount: 9,
        option: "Special Deals",
      },
      {
        id: 10,
        title: "InterContinental Singapore",
        area: "Bugis",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmOxFb3sJ7VpnOhukA2AFTQrfW3uhoRcbBDQ&s",
        price: 300,
        reviews: 72000,
        discount: 14,
        option: "Star(For India)",
      },
    ],
    
    activities: [
      {
        id: 1,
        title: "Night Safari",
        image: "https://i0.wp.com/traveldiaryparnashree.com/wp-content/uploads/2019/05/Nigh-safari-adventurer-tour-2.jpg?resize=800%2C450&ssl=1",
        option: "Special Discount",
        discount: "15%",
        reviews: 72000,
        description: "Explore nocturnal wildlife in a thrilling tram ride adventure.",
      },
      {
        id: 2,
        title: "Singapore River Cruise",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtelkyALDEhducKL7JN17H8PralC6N33myWw&s",
        option: "Promotion",
        discount: "10%",
        reviews: 72000,
        description: "Enjoy a scenic river ride through historic Singapore.",
      },
      {
        id: 3,
        title: "ArtScience Museum Entry",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfav7_vezsdK4I3nzrnHjtVbtn31bcejS9kw&s",
        option: "Special Discount",
        discount: "20%",
        reviews: 72000,
        description: "Interactive exhibits blending art, science, and tech.",
      },
      {
        id: 4,
        title: "Singapore Zoo",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRiBAmlvtJhplx8kUIByHu1xCHUYOtE7wjyQ&s",
        option: "Promotion",
        discount: "12%",
        reviews: 72000,
        description: "Experience one of the world’s top rainforest zoos.",
      },
      {
        id: 5,
        title: "Botanic Gardens Tour",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAKyHF22q34DlhsWQUoUaV9o7E3aPyf8p5Dg&s",
        option: "Special Discount",
        discount: "25%",
        reviews: 72000,
        description: "Relax and explore Singapore’s UNESCO-listed gardens.",
      },
      {
        id: 6,
        title: "Gardens by the Bay",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjK-0zIMARslmAkJFMvs1LSCg0ry8uFF_8xQ&s",
        option: "Promotion",
        discount: "18%",
        reviews: 72000,
        description: "Witness the futuristic Supertree Grove and Cloud Forest.",
      },
      {
        id: 7,
        title: "Cooking Class in Chinatown",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ237vRdHq2hbLav2DlJVED2rnrAi7X96eDpg&s",
        option: "Special Discount",
        discount: "20%",
        reviews: 72000,
        description: "Learn to cook local Singaporean dishes from experts.",
      },
      {
        id: 8,
        title: "Trick Eye Museum",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTPzV5XUVurWFUqpnX_hbPr7NcWfBZOhwfoA&s",
        option: "Promotion",
        discount: "15%",
        reviews: 72000,
        description: "Dive into the world of optical illusions and 3D art.",
      },
      {
        id: 9,
        title: "SkyHelix Sentosa Ride",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxfpqT-fQ6BfUnPZi5In_ow-YCLTzphCPkag&s",
        option: "Special Discount",
        discount: "10%",
        reviews: 72000,
        description: "Take in panoramic views on Singapore’s highest open-air ride.",
      },
      {
        id: 10,
        title: "Duck Tour – Land & Water",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwK9sBwxCOeRxKjIucwMlT0Bdqo6Lwm4q3xA&s",
        option: "Promotion",
        discount: "17%",
        reviews: 72000,
        description: "A unique city tour on an amphibious vehicle—by land and water.",
      },
    ]
    
  }
]
export const product = [
  {
    id: 1,
    title: "Sentosa Island Adventure",
    images: [
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/sentosa-island/sentosa-island-01.jpg",
      "https://www.sentosa.com.sg/-/media/sentosa/hero-banner/beach.jpg",
      "https://www.sentosa.com.sg/-/media/sentosa/hero-banner/universal.jpg",
      "https://www.sentosa.com.sg/-/media/sentosa/hero-banner/skyride.jpg",
    ],
    price: 250,
    discount: 10,
    duration: "2 Days",
    description:
      "Experience the thrills of Sentosa Island with visits to Universal Studios, S.E.A. Aquarium, and the Skyride.",
    fullDescription:
      "Sentosa Island Adventure offers an exciting mix of thrilling rides, beautiful beaches, and iconic attractions. Enjoy priority access to Universal Studios, get mesmerized by marine life at S.E.A. Aquarium, and capture panoramic views on the Skyride. Perfect for families and adventure seekers!",
    highlights: [
      "Universal Studios Entry",
      "Skyride Experience",
      "S.E.A. Aquarium Visit",
      "Beach Access",
      "Scenic Views",
    ],
    inclusions: [
      "Entry Tickets",
      "Hotel Pickup & Drop",
      "Tour Guide",
      "Welcome Drinks",
    ],
    exclusions: ["Personal Expenses", "Lunch/Dinner", "Insurance"],
    tourGuide: true,
    guidedLanguage: ["English", "Mandarin"],
    visit: "Sentosa Island",
    city: "Singapore",
    tourType: "Adventure",
    minPax: 1,
    maxPax: 20,
    childPrice: 150,
    adultPrice: 250,
    hotelOptions: [
      {
        name: "Sentosa Beach Resort",
        rating: 4.5,
      },
      {
        name: "Ocean View Hotel",
        rating: 4.2,
      },
    ],
  },
  {
    id: 2,
    title: "Marina Bay Marvels",
    images: [
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/marina-bay/marina-bay-01.jpg",
      "https://media.timeout.com/images/105532699/750/422/image.jpg",
      "https://www.marinabaysands.com/etc/designs/imbc/clientlibs/images/mbs-img/marina-bay-hero-1.jpg",
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/marina-bay/marina-bay-02.jpg",
    ],
    price: 300,
    discount: 15,
    duration: "3 Days",
    description:
      "Explore Marina Bay Sands, Gardens by the Bay, and enjoy a river cruise along the Singapore River.",
    fullDescription:
      "Enjoy a luxurious and scenic tour around Marina Bay. Capture breathtaking skyline views from Marina Bay Sands SkyPark, explore futuristic gardens, and unwind with a peaceful river cruise. A perfect blend of luxury and nature!",
    highlights: [
      "Marina Bay Sands SkyPark",
      "Gardens by the Bay",
      "River Cruise",
      "Spectra Light Show",
      "ArtScience Museum",
    ],
    inclusions: ["Entry Tickets", "Guided Tour", "Cruise Tickets"],
    exclusions: ["Meals", "Tips", "Airport Transfer"],
    tourGuide: true,
    guidedLanguage: ["English", "Malay"],
    visit: "Marina Bay",
    city: "Singapore",
    tourType: "Luxury",
    minPax: 2,
    maxPax: 15,
    childPrice: 180,
    adultPrice: 300,
    hotelOptions: [
      {
        name: "Marina Bay Sands Hotel",
        rating: 5,
      },
      {
        name: "Fullerton Hotel",
        rating: 4.8,
      },
    ],
  },
  {
    id: 3,
    title: "Cultural Chinatown Tour",
    images: [
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/chinatown/chinatown-01.jpg",
      "https://media.timeout.com/images/105239764/image.jpg",
      "https://static01.nyt.com/images/2019/02/03/travel/03Singapore1/03Singapore1-superJumbo.jpg",
      "https://www.tripsavvy.com/thmb/WF1UBVKnpr9Hb8ZzmZ5yie8gF2k=/2121x1414/filters:fill(auto,1)/GettyImages-985741662-5c4a0877c9e77c0001fa96ba.jpg",
    ],
    price: 150,
    discount: 5,
    duration: "2 Days",
    description:
      "Dive into the rich heritage of Chinatown with visits to temples, markets, and traditional eateries.",
    fullDescription:
      "Explore Singapore's Chinatown on this immersive tour. From ancient temples to bustling markets and delicious street food, experience the soul of Chinese heritage in the city. A great cultural walk for history buffs and foodies!",
    highlights: [
      "Buddha Tooth Relic Temple",
      "Street Market Walk",
      "Heritage Gallery",
      "Traditional Tea Tasting",
    ],
    inclusions: ["Cultural Guide", "Entry Passes", "Local Snacks"],
    exclusions: ["Hotel Stay", "Dinner", "Transportation"],
    tourGuide: true,
    guidedLanguage: ["English", "Chinese"],
    visit: "Chinatown",
    city: "Singapore",
    tourType: "Cultural",
    minPax: 1,
    maxPax: 25,
    childPrice: 100,
    adultPrice: 150,
    hotelOptions: [
      {
        name: "Chinatown Heritage Inn",
        rating: 4,
      },
      {
        name: "88 Hotel",
        rating: 3.8,
      },
    ],
  },
  {
    id: 4,
    title: "Singapore Zoo Exploration",
    images: [
      "https://assets.tatlerasia.com/production/article/2022/07/26/9e60a6cc-ab13-48ec-9c6e-788b9a6ff59c.jpeg",
      "https://www.nationalgeographic.com/travel/article/singapore-zoo-safari.jpg",
      "https://media.timeout.com/images/105116332/750/422/image.jpg",
      "https://www.zooborns.com/.a/6a010535647bf3970b0120a5c8c12d970b.jpg",
    ],
    price: 200,
    discount: 20,
    duration: "1 Day",
    description:
      "Visit one of the world’s most iconic zoos with guided tours to explore wildlife in naturalistic habitats.",
    fullDescription:
      "Enjoy a day at the renowned Singapore Zoo, known for its naturalistic habitats and wide array of wildlife. With a guided tour, explore the exhibits, watch animal feedings, and learn about conservation efforts.",
    highlights: [
      "Rainforest Walk",
      "Night Safari",
      "Wildlife Interaction",
      "Guided Animal Feedings",
    ],
    inclusions: [
      "Zoo Entry",
      "Guided Tour",
      "Animal Feeding",
      "Transportation",
    ],
    exclusions: ["Food & Drinks", "Souvenirs", "Additional Activities"],
    tourGuide: true,
    guidedLanguage: ["English", "Mandarin"],
    visit: "Singapore Zoo",
    city: "Singapore",
    tourType: "Family",
    minPax: 2,
    maxPax: 30,
    childPrice: 130,
    adultPrice: 200,
    hotelOptions: [
      {
        name: "Mandai Safari Lodge",
        rating: 4.5,
      },
      {
        name: "Forest Lodge Hotel",
        rating: 4.3,
      },
    ],
  },
  {
    id: 5,
    title: "Jurong Bird Park Experience",
    images: [
      "https://www.jurongbirdpark.com/wp-content/uploads/2021/06/Overview-6.jpg",
      "https://www.nationalgeographic.com/travel/article/jurong-bird-park.jpg",
      "https://media.timeout.com/images/105350937/750/422/image.jpg",
      "https://www.jurongbirdpark.com/wp-content/uploads/2021/06/FeedingTime-1.jpg",
    ],
    price: 120,
    discount: 10,
    duration: "1 Day",
    description:
      "A vibrant day at the Jurong Bird Park, home to thousands of birds from around the world.",
    fullDescription:
      "Explore the world of colorful and exotic birds in the Jurong Bird Park. With over 400 species, interactive bird shows, and feeding sessions, this is a must-visit for bird lovers and families.",
    highlights: [
      "Bird Shows",
      "Flamingo Pool",
      "Treetop Walk",
      "Parrot Feeding",
    ],
    inclusions: ["Park Entry", "Guided Bird Show", "Interactive Feeding"],
    exclusions: ["Meals", "Souvenirs", "Additional Bird Encounters"],
    tourGuide: true,
    guidedLanguage: ["English"],
    visit: "Jurong Bird Park",
    city: "Singapore",
    tourType: "Nature",
    minPax: 1,
    maxPax: 25,
    childPrice: 90,
    adultPrice: 120,
    hotelOptions: [
      {
        name: "Jurong Waterfront Hotel",
        rating: 4,
      },
      {
        name: "Lakeview Hotel",
        rating: 3.9,
      },
    ],
  },
  {
    id: 6,
    title: "Night Safari Adventure",
    images: [
      "https://www.singaporeanimalia.com/wp-content/uploads/2017/06/VSF_0131_2.jpg",
      "https://www.singaporeanimalia.com/wp-content/uploads/2017/06/VSF_0661_2.jpg",
      "https://assets.natgeotravel.com/209c370f-df09-4297-b1e9-7800b622adfa.jpg",
      "https://www.nightsafari.com/wp-content/uploads/2017/04/001-hero.jpg",
    ],
    price: 250,
    discount: 15,
    duration: "1 Night",
    description:
      "Experience the thrill of the world’s first nocturnal zoo with a guided tour and wildlife viewing under the stars.",
    fullDescription:
      "Embark on an unforgettable night adventure at the Night Safari, where you will explore the jungle at night and encounter wild animals in their natural, nocturnal habitats. Ideal for nature enthusiasts and night lovers!",
    highlights: [
      "Tram Ride",
      "Nocturnal Animal Viewing",
      "Wildlife Talks",
      "Fire Breathing Show",
    ],
    inclusions: ["Tram Ride", "Park Entry", "Guided Tour", "Night Safari Show"],
    exclusions: ["Meals", "Souvenirs", "Additional Activities"],
    tourGuide: true,
    guidedLanguage: ["English", "Mandarin"],
    visit: "Night Safari",
    city: "Singapore",
    tourType: "Adventure",
    minPax: 2,
    maxPax: 30,
    childPrice: 140,
    adultPrice: 250,
    hotelOptions: [
      {
        name: "Safari Lodge",
        rating: 4.7,
      },
      {
        name: "Mandai Wildlife Resort",
        rating: 4.6,
      },
    ],
  },
  {
    id: 7,
    title: "Singapore Flyer Ride",
    images: [
      "https://www.singaporeflyer.com/wp-content/uploads/2021/06/sgflyer-hero2.jpg",
      "https://media.timeout.com/images/105116881/750/422/image.jpg",
      "https://cdn.theloop.au.com/media/6ec6eb7c-1749-4261-b5b4-7b0a2d7585b3.jpg",
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/singapore-flyer/singapore-flyer-01.jpg",
    ],
    price: 100,
    discount: 5,
    duration: "2 Hours",
    description:
      "Take in panoramic views of Singapore from the top of the Singapore Flyer, one of the world’s largest observation wheels.",
    fullDescription:
      "Enjoy a bird’s-eye view of Singapore as you ride in one of the luxurious glass cabins of the Singapore Flyer. The ride offers a stunning perspective of the skyline, Marina Bay Sands, and beyond.",
    highlights: [
      "360-degree Views",
      "Marina Bay Sands View",
      "Aerial Photography",
    ],
    inclusions: ["Flyer Ride Ticket", "Drink", "Aerial View"],
    exclusions: ["Meals", "Souvenirs"],
    tourGuide: false,
    guidedLanguage: [],
    visit: "Singapore Flyer",
    city: "Singapore",
    tourType: "Sightseeing",
    minPax: 1,
    maxPax: 30,
    childPrice: 50,
    adultPrice: 100,
    hotelOptions: [
      {
        name: "Marina Bay Sands Hotel",
        rating: 5,
      },
      {
        name: "Fullerton Bay Hotel",
        rating: 4.9,
      },
    ],
  },
  {
    id: 8,
    title: "Botanic Gardens Escape",
    images: [
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/botanic-gardens/botanic-gardens-01.jpg",
      "https://media.timeout.com/images/105116804/750/422/image.jpg",
      "https://www.kaichan.com/sites/default/files/styles/full_res/public/2017-06/singapore-botanic-gardens.jpg",
      "https://www.kaichan.com/sites/default/files/styles/full_res/public/2017-06/singapore-botanic-gardens2.jpg",
    ],
    price: 90,
    discount: 10,
    duration: "Half Day",
    description:
      "Stroll through Singapore's lush Botanic Gardens, a UNESCO World Heritage site, and enjoy a peaceful retreat.",
    fullDescription:
      "Discover the tranquil beauty of the Singapore Botanic Gardens, a haven for nature lovers. Visit the National Orchid Garden, admire the tropical rainforest, and experience the lush greenery right in the heart of the city.",
    highlights: [
      "National Orchid Garden",
      "Tropical Rainforest",
      "Swan Lake",
      "Heritage Trees",
    ],
    inclusions: ["Garden Entry", "Guided Tour", "Orchid Garden Visit"],
    exclusions: ["Food & Drinks", "Souvenirs"],
    tourGuide: true,
    guidedLanguage: ["English"],
    visit: "Botanic Gardens",
    city: "Singapore",
    tourType: "Nature",
    minPax: 1,
    maxPax: 20,
    childPrice: 50,
    adultPrice: 90,
    hotelOptions: [
      {
        name: "Botanic Garden View Resort",
        rating: 4.6,
      },
      {
        name: "Garden Hotel",
        rating: 4.2,
      },
    ],
  },
  {
    id: 9,
    title: "Singapore Heritage Tour",
    images: [
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/heritage-tour/heritage-tour.jpg",
      "https://static.microsites.com/sg-tours-heritage.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/1/17/Singapore_river.jpg",
      "https://media.timeout.com/images/105117232/750/422/image.jpg",
    ],
    price: 180,
    discount: 15,
    duration: "2 Days",
    description:
      "A comprehensive cultural and historical experience, exploring Singapore’s heritage sites and districts.",
    fullDescription:
      "Delve into the heart of Singapore’s rich history with this heritage tour. Discover iconic landmarks, explore the colorful streets of Little India, and visit historical museums.",
    highlights: [
      "Little India",
      "Chinatown",
      "Raffles Hotel",
      "National Museum",
    ],
    inclusions: ["Cultural Guide", "Museum Entry", "Heritage Sites"],
    exclusions: ["Meals", "Tips", "Airport Transfer"],
    tourGuide: true,
    guidedLanguage: ["English", "Mandarin"],
    visit: "Singapore Heritage Sites",
    city: "Singapore",
    tourType: "Cultural",
    minPax: 1,
    maxPax: 25,
    childPrice: 120,
    adultPrice: 180,
    hotelOptions: [
      {
        name: "Heritage Hotel",
        rating: 4,
      },
      {
        name: "Cultural Inn",
        rating: 3.9,
      },
    ],
  },
  {
    id: 10,
    title: "Sentosa Beach & Relaxation",
    images: [
      "https://www.sentosa.com.sg/-/media/sentosa/hero-banner/beach.jpg",
      "https://www.visitsingapore.com/content/dam/desktop/global/see-do-singapore/places-to-see/sentosa-beach/sentosa-beach-01.jpg",
      "https://www.singaporeair.com/sg/en/travel-info/sentosa-beach.jpg",
      "https://www.sentosa.com.sg/-/media/sentosa/hero-banner/family.jpg",
    ],
    price: 220,
    discount: 12,
    duration: "3 Days",
    description:
      "Relax and unwind on Sentosa Beach, indulge in a spa experience, and enjoy beautiful sunsets.",
    fullDescription:
      "Spend a few days in paradise with a beach holiday at Sentosa. Unwind with spa treatments, enjoy beach activities, and savor gourmet meals. Ideal for couples and families seeking a relaxing retreat.",
    highlights: [
      "Beach Lounging",
      "Spa Treatment",
      "Water Sports",
      "Sunset Views",
    ],
    inclusions: ["Beach Access", "Spa Voucher", "Water Sports Equipment"],
    exclusions: ["Meals", "Transport"],
    tourGuide: false,
    guidedLanguage: [],
    visit: "Sentosa Beach",
    city: "Singapore",
    tourType: "Relaxation",
    minPax: 1,
    maxPax: 20,
    childPrice: 170,
    adultPrice: 220,
    hotelOptions: [
      {
        name: "Sentosa Beach Resort",
        rating: 4.5,
      },
      {
        name: "Ocean View Hotel",
        rating: 4.3,
      },
    ],
  },
];
export default { data, data2, product,top_things_to_do,best_places_to_visit,historical_places };