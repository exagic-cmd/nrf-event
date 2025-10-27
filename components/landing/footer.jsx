import { Globe, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-8 md:py-12">
      {" "}
      {/* Darker background for more contrast */}
      <div className="container px-4 md:px-6 mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and Description */}
        <div className="col-span-full md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Explore Singapore</span>
          </div>
          <p className="text-sm max-w-xs text-gray-400">
            {" "}
            {/* Slightly lighter text for readability */}
            Your AI-powered companion for discovering the best of Singapore, tailored to your interests.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Destinations
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors duration-200">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
          <div className="flex space-x-4">
            <a href="#" aria-label="Facebook" className="hover:text-white transition-colors duration-200">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white transition-colors duration-200">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-white transition-colors duration-200">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors duration-200">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Explore Singapore. All rights reserved.
      </div>
    </footer>
  )
}
