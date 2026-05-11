"use client";

import React from "react";
import Link from "next/link";
import { Search, ShoppingBag, Apple, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { name: "Platform", href: "/platform" },
    { name: "Solutions", href: "/solutions" },
    { name: "Resources", href: "/resources" },
    { name: "Pricing", href: "/pricing" },
    { name: "Enterprise", href: "/enterprise" },
  ];

  return (
    <nav className="relative z-[100] w-full bg-surface-black h-11 flex items-center">
      <div className="max-w-[1024px] mx-auto w-full px-4 flex items-center justify-between">
        {/* Apple Logo (InterviewAI Logo Placeholder) */}
        <Link
          href="/"
          className="text-body-on-dark hover:opacity-80 transition-opacity"
        >
          <Apple className="w-4 h-4" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-nav-link font-normal text-body-on-dark/80 hover:text-body-on-dark transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-x-6">
          <button className="text-body-on-dark hover:opacity-80 transition-opacity">
            <Search className="w-4 h-4" />
          </button>
          <Link
            href="/bag"
            className="text-body-on-dark hover:opacity-80 transition-opacity"
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-body-on-dark hover:opacity-80 transition-opacity"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-11 left-0 w-full h-[calc(100vh-44px)] bg-surface-black z-[90] flex flex-col p-10 gap-y-6"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-2xl font-semibold text-body-on-dark hover:opacity-80 transition-opacity"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
