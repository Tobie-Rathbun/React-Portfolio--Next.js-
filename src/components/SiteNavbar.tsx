"use client";

import "../app/globals.css";
import Link from "next/link";
import { usePathname} from "next/navigation";
import { useState, useEffect } from "react";

const SiteNavbar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = event.currentTarget as HTMLAnchorElement;
    const href = target.getAttribute("href");
  
    if (href === pathname) {
      // Force a reload or reset state even when navigating to the same page
      if (href === "/") {
        window.location.href = "/"; // Reload the page
      }
      event.preventDefault();
      setIsDropdownOpen(false);
      console.log("Already on the current page");
      return;
    }
  
    setIsLoading(true);
    setIsDropdownOpen(false); // Close dropdown when a link is clicked
  };
  
  

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    // Simulate the end of loading when the pathname or search params change
    setIsLoading(false); // This ensures the spinner stops after the page renders
  }, [pathname]);

  return (
    <div className="navbar-wrapper">
      <nav className="site-navbar">
        <Link href="/" className="navbar-brand" onClick={handleLinkClick}>
          Tobie Rathbun
        </Link>
        <div>
          <Link href="/" className="nav-link" onClick={handleLinkClick}>
            Home
          </Link>
          <Link href="/about" className="nav-link" onClick={handleLinkClick}>
            About
          </Link>
          <a
            href="https://github.com/Tobie-Rathbun"
            className="nav-link"
            onClick={handleLinkClick}
          >
            GitHub
          </a>
          

          <div className="dropdown">
            <button
              className="dropdown-toggle"
              onClick={handleDropdownToggle}
            >
              Projects
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link href="/rps" className="nav-link" onClick={handleLinkClick}>
                  Rock, Paper, Scissors
                </Link>
                <Link href="/texasholdem" className="nav-link" onClick={handleLinkClick}>
                  Texas Hold &#39;Em
                </Link>
                <Link href="/chord-player" className="nav-link" onClick={handleLinkClick}>
                  Chord Machine 
                </Link>
                <Link href="/pokerfrogs" className="nav-link" onClick={handleLinkClick}>
                  Poker Frogs 3D (Demo)
                </Link>
              </div>
            )}
          </div>

          <Link href="/contact" className="nav-link" onClick={handleLinkClick}>
            Contact
          </Link>
        </div>
      </nav>

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default SiteNavbar;
