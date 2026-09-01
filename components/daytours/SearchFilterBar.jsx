"use client"
import { Search, Map, Filter, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useDaytoursStore } from "@/store/useDaytoursStore"
import FilterSidebar from "@/components/daytours/FilterSidebar"
import Image from "next/image"
import Link from "next/link"
import { getFullImageUrl } from "@/utils/imageService"
import MapView from "@/components/daytours/MapView"
import { useLocalizedRouter } from "@/components/localizedRouter";
import SvgLoader2 from "@/components/common/Loader2Svg"
import { useTranslation } from "next-i18next"
import useLanguageStore from "@/store/useLanguageStore";
const SearchFilterBar = ({ onSearchResults, onFilterChange, onApplyFilters, resetKey, currentFilters }) => {
  const { t } = useTranslation('daytour')
  const { languageId, currentLocale } = useLanguageStore();
  const [isSticky, setIsSticky] = useState(false)
  const searchRef = useRef(null)
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)
  const [loadingId, setLoadingId] = useState(null)

  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showMobileMap, setShowMobileMap] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [tempMobileFilters, setTempMobileFilters] = useState({})
  const barRef = useRef(null)

  const { localizedPush } = useLocalizedRouter();

  const { suggestedResults, searchResults, fetchSearchSuggestions, searchProductsByKeyword, setAllResults } =
    useDaytoursStore()

  useEffect(() => {
    if (!submittedQuery) return;

    const performSearch = async () => {
      const result = await searchProductsByKeyword(submittedQuery, languageId);
      const resultsArray = result && result.length ? result : [];
      setAllResults(resultsArray);
      if (onSearchResults) {
        onSearchResults(resultsArray);
      }
    };

    performSearch();
  }, [submittedQuery, languageId, onSearchResults, searchProductsByKeyword, setAllResults]);

  useEffect(() => {
    fetchSearchSuggestions(languageId);
  }, [languageId, fetchSearchSuggestions]);

  const handleFocus = async () => {
    if (suggestedResults.length === 0) {
      await fetchSearchSuggestions(languageId)
    }
    setShowDropdown(true)
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setSubmittedQuery(query)
    setQuery("")
    inputRef.current?.blur()
    setShowDropdown(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch()

      if (showMobileSearch) {
        setShowMobileSearch(false)
      }
    }
  }

  const handleMobileModalSearch = () => {
    if (query.trim()) handleSearch()
  }

  const handleMobileFilterChange = (filterTitle, value, clearAll = false) => {
    if (clearAll) {
      setTempMobileFilters({})
      return
    }
    setTempMobileFilters((prev) => {
      const existing = prev[filterTitle] || []
      const updated = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value]
      const newFilters = { ...prev, [filterTitle]: updated }
      if (updated.length === 0) delete newFilters[filterTitle]
      return newFilters
    })
  }

  const handleApplyMobileFilters = () => {
    Object.entries(tempMobileFilters).forEach(([filterTitle, values]) => {
      values.forEach((value) => onFilterChange(filterTitle, value))
    })
    setTimeout(() => {
      onApplyFilters()
    }, 100)
    setShowMobileFilters(false)
  }

  const handleClearMobileFilters = () => {
    setTempMobileFilters({})
    onFilterChange(null, null, true)
    onApplyFilters()
    setShowMobileFilters(false)
  }

  useEffect(() => {
    if (showMobileFilters) setTempMobileFilters(currentFilters)
  }, [showMobileFilters, currentFilters])

  useEffect(() => {
    if (!barRef.current) return
    const observer = new IntersectionObserver(([entry]) => setIsSticky(!entry.isIntersecting), {
      rootMargin: "-17px 0px 0px 0px",
      threshold: 1.0,
    })
    observer.observe(barRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (showMobileSearch || showMobileMap || showMobileFilters) return
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showMobileSearch, showMobileMap, showMobileFilters])

  const slugify = (text) => {
    if (!text) return "";
    const processedText = text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") 
        .replace(/[^\p{L}\p{N}-]+/gu, "") 
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
    return encodeURIComponent(processedText);
  }

  const filteredSuggestions = query.trim()
    ? suggestedResults.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : suggestedResults.slice(0, 10)

  return (
    <>
      <div
        ref={barRef}
        className={`hidden lg:flex mx-2 md:mx-4 lg:mx-[320px] pl-14 sticky top-4 z-40 shadow-md rounded-full p-4 flex-wrap items-center justify-between gap-3 mt-[-24px] transition-colors duration-300 ${
          isSticky ? "bg-muted border border-1 border-border text-surface-foreground" : "bg-surface"
        }`}
      >
        <div className="relative flex flex-1 gap-2 bg-surface rounded-full p-1 " ref={searchRef}>
          <input
            ref={inputRef}
            type="text"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className="flex-1 md:py-3 px-4 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 text-muted-foreground text-white rounded-full font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Search size={20} />
            {t("search.button")}
          </button>
          {showDropdown && (
            
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl shadow-xl border z-40 overflow-hidden">
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((item) => (
                     <div key={item.id}>
    {loadingId === item.id && (
      <div className="absolute inset-0 bg-surface/80 flex justify-center items-center z-20 rounded-lg">
        <SvgLoader2 />
      </div>
    )}
      <a
  href={`/day-tours/${slugify(item.title)}/${item.id}`}
  onClick={(e) => {
    e.preventDefault();
    setLoadingId(item.id);
    localizedPush(`/day-tours/${slugify(item.title)}/${item.id}`);
  }}
  className="block"
>
                      <div className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                        <Image
                          src={getFullImageUrl(item?.image) || "/placeholder.svg"}
                          alt={item.title}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                          <p className="text-muted-foreground text-xs">Singapore</p>
                        </div>
                      </div>
                    </a>
                    </div>
                  ))
                ) : (
                   <p className="text-center text-sm text-muted-foreground">
    <span className="block">{t("search.notFoundTitle")}</span>
    <span className="text-muted-foreground font-medium">
      {t("search.pressEnter")} <kbd className="...">Enter</kbd> {t("search.enterFor")} <b>{query}</b>.
    </span>
  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile Search Bar */}
      <div className="lg:hidden sticky top-2 z-30 mx-12 mt-[-24px]">
        <div className="bg-surface rounded-xl shadow-lg border p-2">
          <div className={`grid ${searchResults.length > 0 ? "grid-cols-3" : "grid-cols-1"} gap-2`}>
            <button
              onClick={() => setShowMobileSearch(true)}
              className="flex flex-col items-center justify-center rounded-xl p-1 bg-muted hover:bg-muted transition-colors"
            >
              <Search size={24} className="text-muted-foreground mb-2" />
              <span className="text-sm font-medium text-muted-foreground">{t("search.search")}</span>
              {/* <span className="text-[10px] text-muted-foreground mt-1">{t("search.whatTo")}</span> */}
            </button>
            {searchResults.length > 0 && (
              <>
                {/* <button
                  onClick={() => setShowMobileMap(true)}
                  className="flex flex-col items-center justify-center p-1 rounded-xl bg-muted hover:bg-muted transition-colors"
                >
                  <Map size={24} className="text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">{t("search.map")}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">{t("search.viewOnMap")}</span>
                </button> */}
                {/* <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex flex-col items-center justify-center rounded-xl bg-muted hover:bg-muted transition-colors relative"
                >
                  <Filter size={24} className="text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">{t("search.filters")}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">{t("search.refineSearch")}</span>
                
                  {Object.keys(currentFilters).length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-muted0 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {Object.keys(currentFilters).length}
                    </div>
                  )}
                </button> */}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <div className="lg:hidden fixed inset-0 bg-surface z-50">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-surface">
              <h2 className="text-xl font-bold text-foreground">{t("search.searchTours")}</h2>
              <button onClick={() => setShowMobileSearch(false)} className="p-2 rounded-full hover:bg-muted">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
              <div className="space-y-3 relative">
                <div className="flex gap-2 bg-surface rounded-full shadow-lg p-2" ref={searchRef}>
                  <input
                    ref={inputRef}
                    type="text"
                   placeholder={t("search.placeholder")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown} 
                    className="flex-1 py-2 px-4 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {/* Search for Mobile Modal dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl shadow-xl border z-40 overflow-hidden">
                    <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                      {filteredSuggestions.length > 0 ? (
                           filteredSuggestions.map((item) => (
                     <div key={item.id}>
    {loadingId === item.id && (
      <div className="absolute inset-0 bg-surface/80 flex justify-center items-center z-20 rounded-lg">
        <SvgLoader2 />
      </div>
    )}
                        
                         <a
  href={`/day-tours/${slugify(item.title)}/${item.id}`}
  onClick={(e) => {
    e.preventDefault();
    setLoadingId(item.id);
    localizedPush(`/day-tours/${slugify(item.title)}/${item.id}`);
  }}
  className="block"
>
                            <div className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                              <Image
                                src={getFullImageUrl(item?.image) || "/placeholder.svg"}
                                alt={item.title}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                                <p className="text-muted-foreground text-xs">Singapore</p>
                              </div>
                            </div>
                          </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-sm text-muted-foreground">
                          <span className="block">{t("search.notFoundTitle")}</span>
                          <span className="text-muted-foreground font-medium">
                            {t('search.pressEnter')} <kbd className="px-1 py-0.5 bg-secondary rounded text-xs">Enter</kbd> {t('search.enterFor')}{" "}
                            <b>{query}</b>.
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t justify-center flex items-center bg-surface">
              <button
                onClick={handleMobileModalSearch}
                className="w-1/2 py-3 text-muted-foreground text-white rounded-xl text-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                {t('search.searchTours')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Map Modal */}
      {showMobileMap && (
        <div className="lg:hidden fixed inset-0 bg-surface z-50">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b bg-surface">
              <h2 className="text-xl font-bold text-foreground">{t("search.mapView")}</h2>
              <button onClick={() => setShowMobileMap(false)} className="p-2 rounded-full hover:bg-muted">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1">
              <MapView />
            </div>
          </div>
        </div>
      )}
      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-surface z-50">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b bg-surface">
              <h2 className="text-xl font-bold text-foreground">{t('search.filters')}</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-full hover:bg-muted">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar
                onFilterChange={handleMobileFilterChange}
                resetKey={resetKey}
                currentFilters={tempMobileFilters}
              />
            </div>
            <div className="p-4 border-t bg-surface">
              <div className="flex gap-3">
                <button
                  onClick={handleClearMobileFilters}
                  className="flex-1 py-3 bg-secondary text-muted-foreground rounded-xl text-lg font-semibold hover:bg-secondary transition-colors"
                >
<button>{t('search.clearAll')}</button>
                </button>
                <button
                  onClick={handleApplyMobileFilters}
                  className="flex-1 py-3 text-muted-foreground text-white rounded-xl text-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                <button>{t('search.applyFilters')}</button>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SearchFilterBar