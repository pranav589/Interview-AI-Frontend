"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppleFooter() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Voice AI", href: "#" },
        { name: "Resume Analyzer", href: "#" },
        { name: "JD Matcher", href: "#" },
        { name: "Analytics", href: "#" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { name: "Tech Interviews", href: "#" },
        { name: "Soft Skills", href: "#" },
        { name: "Leadership", href: "#" },
        { name: "Enterprise", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Interview Tips", href: "#" },
        { name: "Success Stories", href: "#" },
        { name: "Blog", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About InterviewAI", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-parchment text-ink-muted-80 py-4 px-4">
      <div className="max-w-[1024px] mx-auto">
        {/* Main Footer Links */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10">
          {footerLinks.map((section) => (
            <div key={section.title} className="flex flex-col gap-y-4">
              <h4 className="text-caption font-semibold text-ink uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="flex flex-col">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-body leading-dense hover:underline transition-all block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div> */}

        {/* Legal Row */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <p className="text-fine-print text-ink-muted-48">
            Copyright © 2026 InterviewAI.
          </p>
          {/* <div className="flex gap-x-6 text-fine-print text-ink-muted-48">
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Terms of Use</Link>
            <Link href="#" className="hover:underline">Sales Policy</Link>
            <Link href="#" className="hover:underline">Legal</Link>
            <Link href="#" className="hover:underline">Site Map</Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
