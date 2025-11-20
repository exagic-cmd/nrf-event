"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import "@/styles/globals.css";
import LocalizedLink from "@/components/LocalizedLink";
import useLanguageStore from "@/store/useLanguageStore";
import useUserStore from "@/store/useAuthStore";
import { User, ShoppingBag, LogOut } from "lucide-react";

export default function Header() {
  const setLocale = useLanguageStore((state) => state.setLocale);
  const { token, logout } = useUserStore();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    async function loadEvent() {
      const data = await $helpers.getEventData();
      setEvent(data);
    }

    loadEvent();
  }, []);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const router = useRouter();
  const dropdownRef = useRef(null);

  const availableLocales = [
    {
      code: "en",
      name: "English",
      flag: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1753790442/External%20Links/flag.png",
    },
    {
      code: "ja",
      name: "Japanese",
      flag: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1753790442/External%20Links/flag_1.png",
    },
    {
      code: "es",
      name: "Spanish",
      flag: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1753790442/External%20Links/spain.png",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
    setUserMenuOpen(false);
    setLangDropdownOpen(false);
  };

  const renderUserMenu = (isMobile = false) => (
    <div className="relative">
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className={`p-2 rounded-full hover:bg-white/20`}
      >
        <User className={`${isMobile ? "w-5 h-5 sm:w-6 sm:h-6" : "w-6 h-6"} text-white`} />
      </button>
      {userMenuOpen && (
        <div
          className={`absolute right-0 top-12 bg-[#D3202D] shadow-lg rounded-xl py-3 px-4 flex flex-col space-y-3 animate-fadeIn ${
            isMobile ? "w-44" : "w-48"
          }`}
        >
          <Link href="/profile" className="flex items-center space-x-2 hover:text-gray-800">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
          <Link href="/order" className="flex items-center space-x-2 hover:text-gray-800">
            <ShoppingBag className="w-4 h-4" />
            <span>Booking</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text[#D3202D] text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderLanguageDropdown = (isMobile = false) => (
    <div className="relative">
      <button
        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
        className="flex items-center"
      >
        <img
          src={availableLocales.find((loc) => loc.code === router.locale)?.flag}
          alt="Selected language"
          className={`${isMobile ? "w-7 h-7 sm:w-8 sm:h-8" : "w-8 h-8"} rounded-xl object-cover`}
        />
      </button>
      {langDropdownOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-xl z-50 py-2">
          {availableLocales.map((loc) => (
            <button
              key={loc.code}
              onClick={() => {
                setLocale(loc.code);
                router.push(router.pathname, router.asPath, { locale: loc.code });
                setLangDropdownOpen(false);
              }}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 ${
                router.locale === loc.code ? "font-semibold text[#D3202D]" : ""
              }`}
            >
              <img
                src={loc.flag}
                alt={`${loc.name} flag`}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{loc.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-3 sm:px-4 md:px-6 lg:px-8 py-0 bg-white shadow-md z-40">
      {/* Logo */}
      <div className="flex items-center">
        <LocalizedLink href="/">
          <img
            src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763642543/External%20Links/Desktop_red.png"
            alt="Logo"
            className="h-8 md:h-20 w-56 object-contain"
          />
        </LocalizedLink>
      </div>

      {/* RIGHT SIDE: LANGUAGE → LOGIN / USER */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4" ref={dropdownRef}>
        {/* DESKTOP */}
        <nav className="hidden lg:flex items-center gap-4">
          {/* {renderLanguageDropdown()} */}
          {!token ? (
            <Link
              href="/login"
              className="text-white bg-[#D3202D] py-2 px-5 sm:px-4 rounded-full text-sm sm:text-sm font-semibold hover:bg-gray-100 transition"
            >
              Login
            </Link>
          ) : (
            renderUserMenu()
          )}
        </nav>

        {/* MOBILE */}
        <div className="lg:hidden flex items-center gap-3 sm:gap-4">
          {/* {renderLanguageDropdown(true)} */}
          {!token ? (
            <Link
              href="/login"
              className="text-white bg-[#D3202D] md:py-2 py-1.5 px-2 md:px-4 rounded-full text-xs sm:text-sm font-semibold"
            >
              Login
            </Link>
          ) : (
            renderUserMenu(true)
          )}
        </div>
      </div>
    </header>
  );
}
