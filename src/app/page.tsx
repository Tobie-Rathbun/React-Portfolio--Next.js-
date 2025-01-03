'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './globals.css';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [exitingCard, setExitingCard] = useState<number | null>(null);
  const [screenSize, setScreenSize] = useState({
    isSmallScreen: false,
    isMediumScreen: false,
    isLargeScreen: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScreenSize = () => {
      setScreenSize({
        isSmallScreen: window.matchMedia('(max-width: 1090px)').matches,
        isMediumScreen: window.matchMedia('(max-width: 1400px)').matches,
        isLargeScreen: window.matchMedia('(max-width: 2000px)').matches,
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  const handleHover = (cardIndex: number) => {
    setHoveredCard(cardIndex);
    setExitingCard(null); // Reset exiting card
  };

  const handleLeave = (cardIndex: number) => {
    setExitingCard(cardIndex);
    setHoveredCard(null);
  };

  const getTitleStyle = (cardIndex: number) => {
    const { isSmallScreen, isMediumScreen } = screenSize;

    let marginLeft, marginTop;

    if (cardIndex === 1) {
      marginLeft = isSmallScreen ? '-15%' : isMediumScreen ? '-20%' : '-23%';
      marginTop = isSmallScreen ? '10%' : isMediumScreen ? '12%' : '15.5%';
    } else {
      marginLeft = isSmallScreen ? '1%' : isMediumScreen ? '2%' : '3%';
      marginTop = isSmallScreen ? '15%' : isMediumScreen ? '18%' : '20%';
    }

    return {
      marginLeft,
      marginTop,
      cursor: 'pointer',
    };
  };

  return (
    <>
      <div className="-page">
        <h1>
          Howdy <span className="emoji" id="cowboy">&#x1F920;</span>
        </h1>
        <p>
          If you are looking for my qualifications and skillsets, check out my{' '}
          <span className="link">
            <Link href="/about">About</Link>
          </span>{' '}
          page.
        </p>

        <div className="cards-container" style={{ gap: '8%' }}>
          {[1, 2].map((cardIndex) => (
            <div
              key={cardIndex}
              className={`animated-card-wrapper ${cardIndex === 2 ? 'delayed-float' : ''}`}
              onMouseEnter={() => handleHover(cardIndex)}
              onMouseLeave={() => handleLeave(cardIndex)}
            >
              <div className="animated-card">
                <Link href="/rps" style={{ textDecoration: 'none' }}>
                  <div className="card-content">
                    <div className="emoji-container">
                      {cardIndex === 1 ? (
                        <>
                          <div className="emoji" id="rock">
                            <img src="/images/rock-emoji.png" alt="Rock" className="emoji" />
                          </div>
                          <div className="emoji" id="paper">
                            <img src="/images/paper-emoji.png" alt="Paper" className="emoji" />
                          </div>
                          <div className="emoji" id="scissors">
                            <img src="/images/scissors-emoji.png" alt="Scissors" className="emoji" />
                          </div>
                        </>
                      ) : (
                        <h2 className="emoji-flex-container">
                          <span className="emoji">&#9824;&#65039;</span>
                          <span className="emoji" id="heart">&#9829;&#65039;</span>
                          <span className="emoji">&#9827;&#65039;</span>
                        </h2>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="card-title">
          {[1, 2].map((cardIndex) => (
            <Link key={cardIndex} href="/rps" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1
                style={getTitleStyle(cardIndex)}
                className={`${
                  hoveredCard === cardIndex
                    ? 'hovered'
                    : exitingCard === cardIndex
                    ? 'exiting'
                    : ''
                }`}
                onMouseEnter={() => handleHover(cardIndex)}
                onMouseLeave={() => handleLeave(cardIndex)}
              >
                {cardIndex === 1 ? 'Rock, Paper, Scissors' : 'Texas Hold \'Em'}
              </h1>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
