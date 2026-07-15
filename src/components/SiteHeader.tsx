// src/components/SiteHeader.tsx

"use client";

import { useEffect, useState } from "react";

const navigationLinks = [
  { href: "#about", label: "The Home" },
  { href: "#gallery", label: "Gallery" },
  { href: "#amenities", label: "Amenities" },
  { href: "#location", label: "Location" },
  { href: "#reviews", label: "Reviews" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header
      className={`site-header ${scrolled ? "site-header-scrolled" : ""}`}
    >
      <div className="container nav-content">
        <a href="#home" className="logo" onClick={closeMenu}>
          Lord St.
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navigationLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a href="#book" className="button button-small desktop-book-button">
            Book Your Stay
          </a>

          <button
            type="button"
            className={`mobile-menu-button ${menuOpen ? "menu-is-open" : ""}`}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        className={`mobile-menu-overlay ${menuOpen ? "mobile-menu-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav
        id="mobile-navigation"
        className={`mobile-navigation ${menuOpen ? "mobile-navigation-open" : ""}`}
        aria-label="Mobile navigation"
      >
        <div className="mobile-navigation-inner">
          <p className="mobile-menu-label">Explore Lord St.</p>

          {navigationLinks.map((link) => (
            <a href={link.href} key={link.href} onClick={closeMenu}>
              {link.label}
              <span aria-hidden="true">→</span>
            </a>
          ))}

          <a
            href="#book"
            className="button button-primary mobile-book-button"
            onClick={closeMenu}
          >
            Book Your Stay
          </a>

          <div className="mobile-platform-links">
            <a
              href="https://airbnb.com/h/lordst"
              target="_blank"
              rel="noopener noreferrer"
            >
              Airbnb
            </a>

            <a
              href="https://vrbo.onelink.me/ItNz/zvaqssef"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vrbo
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}