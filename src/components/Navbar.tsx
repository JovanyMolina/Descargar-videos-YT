"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Youtube,
  Menu,
  X,
  Home,
  Download,
  Settings,
  Info,
  Sparkles,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Inicio", icon: Home },
  /*  { href: "/downloads", label: "Descargas", icon: Download }, */
  { href: "/settings", label: "Configuración", icon: Settings, disabled: true },
  { href: "/about", label: "Acerca de", icon: Info, disabled: true },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-youtube-gray/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-youtube-red p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:block">
              YT <span className="text-youtube-red">Downloader</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.disabled ? "#" : link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  link.disabled
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-300 hover:text-white hover:bg-youtube-dark"
                }`}
                onClick={(e) => link.disabled && e.preventDefault()}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
                {link.disabled && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Próximamente
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-youtube-dark transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-800 animate-in slide-in-from-top duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.disabled ? "#" : link.href}
                onClick={(e) => {
                  if (link.disabled) e.preventDefault();
                  else setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  link.disabled
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-300 hover:text-white hover:bg-youtube-dark"
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
                {link.disabled && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Próximamente
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
