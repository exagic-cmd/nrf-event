import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Head from "next/head";
import { MapPin, Clock, Users, BadgeCheck, Navigation, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { getFullImageUrl } from "@/utils/imageService";
import { useRouter } from "next/router";

export default function LandmarkDetailPage({ landmarkData }) {
  const router = useRouter();
  const [landmark, setLandmark] = useState(landmarkData);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!landmark?.images || landmark.images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % landmark.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [landmark, isHovered]);

  if (!landmark) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Landmark Not Found</h2>
          <p className="text-gray-600">We couldn't find the details for this landmark.</p>
        </div>
      </div>
    );
  }

  // Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": landmark.landmark_type_name === "Restaurant" ? "Restaurant" : "TouristAttraction",
    "name": landmark.title,
    "description": landmark.description,
    "image": landmark.images?.map((img) => getFullImageUrl(img)),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": landmark.address,
      "addressLocality": landmark.city_name,
      "addressCountry": landmark.branch_name,
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": landmark.latitude,
      "longitude": landmark.longitude,
    },
    "url": typeof window !== "undefined" ? window.location.href : "",
  };

  const pageTitle = `${landmark.title} - ${landmark.city_name} | Travel Guide`;
  const pageDescription = landmark.description?.slice(0, 160) || "";
  const ogImage = landmark.images?.[0] ? getFullImageUrl(landmark.images[0]) : "";
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
     <Head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />

  <link rel="canonical" href={currentUrl} />

  {/* Open Graph */}
  <meta property="og:type" content="article" />
  <meta property="og:url" content={currentUrl} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:image" content={ogImage} />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content={ogImage} />

  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />
</Head>


      <main className="bg-[#f4f4f4] min-h-screen pb-20 font-sans">
      {/* HERO */}
      <section className="relative h-[60vh] lg:h-[70vh] w-full overflow-hidden">
        <Image
          src={getFullImageUrl(landmark.images?.[0])}
          alt={landmark.title}
          fill
          priority
          sizes="100vw"
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 md:px-8 pb-12 text-white">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-[#D3202D] text-black px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide">
                {landmark.landmark_type_name}
              </span>
              {landmark.certification?.map((cert, idx) => (
                <span
                  key={idx}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 rounded-full text-sm"
                >
                  {cert}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 text-shadow-lg">
              {landmark.title}
            </h1>

            <div className="flex items-center gap-2 text-gray-200 text-lg">
              <MapPin className="w-5 h-5 text-[#D3202D]" />
              <span>
                {landmark.city_name}, {landmark.branch_name}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="container mx-auto px-4 md:px-8 -mt-10 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">

          {/* Video Tour */}
          {landmark.video && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Tour</h2>
              <div className="relative w-full h-56 md:h-96 rounded-2xl overflow-hidden bg-white">
                <VideoPlayer url={landmark.video} />
              </div>
            </div>
          )}

          {/* About */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              About the Place
              <div className="h-1 w-12 bg-[#D3202D] rounded-full ml-2"></div>
            </h2>
            <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line max-w-none">
              {landmark.description}
            </div>
          </div>

          {/* Gallery */}
          {landmark.images?.length > 1 && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
              <div 
                className="relative h-56 md:h-96 w-full rounded-2xl overflow-hidden group bg-gray-100"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Image
                  src={getFullImageUrl(landmark.images[galleryIndex])}
                  alt={`Gallery Image ${galleryIndex + 1}`}
                  fill
                  className="object-cover transition-all duration-500"
                />

                {/* Navigation Buttons */}
                <button
                  onClick={() => setGalleryIndex((prev) => (prev === 0 ? landmark.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setGalleryIndex((prev) => (prev + 1) % landmark.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {landmark.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setGalleryIndex(idx)}
                      className={`h-2 rounded-full transition-all ${idx === galleryIndex ? "w-6 bg-[#D3202D]" : "w-2 bg-white/60"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* How to get */}
          {landmark.how_to_get && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Navigation className="text-[#D3202D]" />
                How to Get There
              </h2>
              <p className="text-gray-600 leading-relaxed">{landmark.how_to_get}</p> via cycling
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
              Quick Information
            </h3>

            <div className="space-y-5">
              <InfoRow
                icon={<MapPin className="w-5 h-5" />}
                label="Address"
                value={landmark.address}
              />
              <InfoRow
                icon={<Clock className="w-5 h-5" />}
                label="Best Time to Visit"
                value={
                  landmark.best_time_to_visit === 1
                    ? "All Day"
                    : landmark.best_time_to_visit
                }
              />
              <InfoRow
                icon={<Users className="w-5 h-5" />}
                label="Avg. Time Spent"
                value={
                  landmark.people_typically_spend
                    ? `${landmark.people_typically_spend} Hours`
                    : null
                }
              />

            {landmark.certification?.length > 0 && (
              <InfoRow
                icon={<BadgeCheck className="w-5 h-5" />}
                label="Certifications"
                value={landmark.certification.join(", ")}
              />
            )}

            {landmark.website && (
              <InfoRow
                icon={<Globe className="w-5 h-5" />}
                label="Website"
                value={
                  <a
                    href={landmark.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#D3202D] hover:underline"
                  >
                    Visit Website
                  </a>
                }
              />
            )}
          </div>

          {/* MAP */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-4">Location</h4>
            <div className="rounded-2xl overflow-hidden shadow-inner h-48 bg-gray-100 relative">
              <iframe
                width="100%"
                height="100%"
                loading="lazy"
                title="map"
                className="absolute inset-0"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${landmark.latitude},${landmark.longitude}&output=embed`}
              />
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${landmark.latitude},${landmark.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="block mt-3 text-center w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Open in Google Maps
            </a>
          </div>
          </div>

        </aside>
        </div>

        {/* Nearby Landmarks Section */}
      </div>
    </main></>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://app.airporttransfers.ai/api";

  try {
    const res = await fetch(`${apiUrl}/landmark/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ landmark_id: id }),
    });

    if (!res.ok) {
      return { props: { landmarkData: null } };
    }

    const data = await res.json();

    // Normalize different possible response shapes
    let lm = data?.data ?? data;
    if (lm?.landmark) lm = lm.landmark;
    if (lm?.landmarks?.data && Array.isArray(lm.landmarks.data)) {
      lm = lm.landmarks.data.find((it) => String(it.id) === String(id)) || lm.landmarks.data[0];
    }

    // Final guard
    if (!lm || (!lm.id && !lm.landmark_id && !lm.LandmarkID)) {
      return { props: { landmarkData: null } };
    }

    return {
      props: { landmarkData: lm },
    };
  } catch (err) {
    console.error("SSR Error:", err);
    return { props: { landmarkData: null } };
  }
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="p-2.5 rounded-xl bg-[#D3202D]/10 text-[#D3202D] shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <div className="text-gray-800 font-medium text-sm leading-snug">
          {value}
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ url }) {
  const getYoutubeId = (link) => {
    if (!link) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = link.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVimeoId = (link) => {
    if (!link) return null;
    const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(?:.*\/)?(\d+)(?:\?.*)?$/;
    const match = link.match(regExp);
    return match ? match[1] : null;
  };

  const youtubeId = getYoutubeId(url);
  const vimeoId = getVimeoId(url);

  if (youtubeId) {
    return (
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1`}
        title="Landmark Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (vimeoId) {
    return (
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1`}
        title="Landmark Video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      src={getFullImageUrl(url)}
      className="absolute top-0 left-0 w-full h-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      controls
    />
  );
}
