import React from 'react';
import { Calendar, Clock, MapPin, Users, BookOpen, Award, CheckCircle } from 'lucide-react';
import { useTranslation } from 'next-i18next';

const AffiliateSections = () => {
  const { t } = useTranslation('affiliateProgram');

  return (
    <div className="bg-surface min-h-screen py-6 px-4 sm:py-12 sm:px-6 md:px-8">
      {/* Section 1 - Mobile First */}
      <div className="max-w-7xl mx-auto mb-12 sm:mb-20">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-[#CC9A55] text-base sm:text-lg font-semibold mb-2">Grow With Us</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            {t("affiliate.webinarTitle")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            {t("affiliate.webinarSubtitle")}
          </p>
        </div>

        <div className="bg-surface rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col lg:grid lg:grid-cols-2">
            {/* Left Content - Mobile First */}
            <div className="px-4 py-6 sm:px-6 sm:py-8 lg:py-12 order-2 lg:order-1">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  {t("affiliate.whatToExpect")}
                </h3>
                <ul className="space-y-3 sm:space-y-4">
                  {["updates", "strategies", "cases", "earlyAccess","qa"].map((key, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-brand-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {t(`affiliate.expect.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Date and Time Info - Mobile Optimized */}
              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="text-[#CC9A55] flex-shrink-0" size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {t("affiliate.nextWebinar")}
                    </p>
                   
                    <span className="font-semibold text-foreground text-sm sm:text-base">29 August 2025 <span className='text-xs text-muted-foreground'>- 7pm(SGT)</span> </span> 
                              
                 </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="text-[#CC9A55] flex-shrink-0" size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {t("affiliate.durationLabel")}
                    </p>
                    <p className="font-semibold text-foreground text-sm sm:text-base">1 hour</p>
                  </div>
                </div>
              </div>

              {/* Zoom Link - Mobile Friendly */}
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg mb-6 sm:mb-8">
                <MapPin className="text-[#CC9A55] flex-shrink-0 mt-1" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    {t("affiliate.locationLabel")}
                  </p>
                  <a 
                    href="https://us05web.zoom.us/j/89248405701?pwd=QT7gaw0sZcvglJKo9kTbahVVcEeuFS.1"
                    className="text-[#CC9A55] hover:text-[#CC9A55] font-medium text-xs sm:text-sm break-all underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Zoom Meeting
                  </a>
                </div>
              </div>
            </div>

            {/* Right Visual Box - Mobile First */}
            <div className="bg-gradient-to-br from-[#CC9A55] via-black-50 to-purple-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center relative order-1 lg:order-2 min-h-[300px] sm:min-h-[400px]">
              <div className="relative z-10 w-full max-w-sm">
                <div className="bg-surface rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden mb-4 sm:mb-6">
                  <img 
                    className='w-full h-32 sm:h-40 md:h-48 object-cover' 
                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/close-up-people-working-from-home-min.jpg`} 
                    alt="People working from home" 
                  />
                </div>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.meetup.com/singapore-affiliate-networks-meetup-group/events/310102454/?eventOrigin=group_upcoming_events"
                  className="block bg-gradient-to-r from-[#CC9A55] to-[#eea644] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white text-center transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
                >
                  <p className="font-bold text-base sm:text-lg mb-2">{t("affiliate.rsvp")}</p>
                  <p className="text-orange-100 text-sm sm:text-base">{t("affiliate.joinNetwork")}</p>
                </a>
              </div>
              {/* Decorative circles - adjusted for mobile */}
              <div className="absolute top-4 right-4 w-16 h-16 sm:w-24 sm:h-24 bg-brand-secondary rounded-full opacity-30"></div>
              <div className="absolute bottom-8 left-4 w-12 h-12 sm:w-20 sm:h-20 bg-brand-secondary rounded-full opacity-40"></div>
              <div className="absolute top-1/2 right-2 w-10 h-10 sm:w-16 sm:h-16 bg-brand-secondary rounded-full opacity-25"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 - Mobile First */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-[#CC9A55] text-base sm:text-lg font-semibold mb-2">
            {t("specialist.getCertified")}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            {t("specialist.programTitle")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            {t("specialist.programSubtitle")}
          </p>
        </div>

        <div className="bg-surface rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col lg:grid lg:grid-cols-2">
            {/* Visual Box - Mobile First */}
            <div className="bg-gradient-to-br from-[#CC9A55] to-black-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center relative min-h-[300px] sm:min-h-[400px] order-1">
              <div className="relative z-10 w-full max-w-sm">
                <div className="bg-surface rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-[#CC9A55] to-teal-500 rounded-2xl overflow-hidden mb-4">
                    <img 
                      className='w-full h-32 sm:h-40 md:h-48 object-cover' 
                      src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/WhatsApp_Image_2025-08-07_at_10.15.44_ab74f60f.jpg`} 
                      alt="Certification program" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                    <div className="bg-brand-secondary rounded-lg sm:rounded-xl p-2 sm:p-3">
                      <p className="text-white font-bold text-lg sm:text-xl">4</p>
                      <p className="text-white text-xs sm:text-sm">{t("specialist.modules")}</p>
                    </div>
                    <div className="bg-brand-secondary rounded-lg sm:rounded-xl p-2 sm:p-3">
                      <p className="text-white font-bold text-lg sm:text-xl">2hrs</p>
                      <p className="text-white text-xs sm:text-sm">{t("specialist.duration")}</p>
                    </div>
                  </div>
                </div>
                <a
                  href="https://www.meetup.com/singapore-affiliate-networks-meetup-group/?eventOrigin=home_groups_you_organize"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-[#CC9A55] to-[#CC9A55] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white text-center transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95"
                >
                  <p className="font-bold text-base sm:text-lg mb-2">{t("specialist.certifiedCTA")}</p>
                  <p className="text-normal text-sm sm:text-base">{t("specialist.joinExperts")}</p>
                </a>
              </div>
              {/* Decorative circles - adjusted for mobile */}
              <div className="absolute top-4 left-4 w-16 h-16 sm:w-24 sm:h-24 bg-brand-secondary rounded-full opacity-30"></div>
              <div className="absolute bottom-8 right-4 w-12 h-12 sm:w-20 sm:h-20 bg-brand-secondary rounded-full opacity-35"></div>
              <div className="absolute top-1/2 left-2 w-10 h-10 sm:w-16 sm:h-16 bg-brand-secondary rounded-full opacity-25"></div>
            </div>

            {/* Right Content - Mobile First */}
            <div className="px-4 py-6 sm:px-6 sm:py-8 lg:py-12 order-2">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                  {t("specialist.whyCert")}
                </h3>
                <ul className="space-y-3 sm:space-y-4">
                  {["attractions", "culture", "authority", "featured"].map((key, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-brand-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {t(`specialist.benefits.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Program Details - Mobile Optimized */}
              <div className="space-y-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <BookOpen className="text-[#CC9A55] flex-shrink-0" size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {t("specialist.formatLabel")}
                    </p>
                    <p className="font-semibold text-foreground text-sm sm:text-base">
                      {t("specialist.formatValue")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Award className="text-[#CC9A55] flex-shrink-0" size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {t("specialist.certificationLabel")}
                    </p>
                    <p className="font-semibold text-foreground text-sm sm:text-base">
                      {t("specialist.certificationValue")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Users className="text-[#CC9A55] flex-shrink-0" size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {t("specialist.recognitionLabel")}
                    </p>
                    <p className="font-semibold text-foreground text-sm sm:text-base">
                      {t("specialist.recognitionValue")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateSections;