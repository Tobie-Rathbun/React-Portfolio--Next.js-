'use client';

import { useState, useEffect } from 'react';
import { useAnimate } from 'framer-motion';
import Link from 'next/link';
import './globals.css';

export default function Home() {
  const [wrapper1, animateWrapper1] = useAnimate();
  const [wrapper2, animateWrapper2] = useAnimate();
  const [scope1, animate1] = useAnimate();
  const [scope2, animate2] = useAnimate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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

  const hoverSequence = [
    { rotate: -90, duration: 0.2 },
    { scale: 1.15, duration: 0.25 },
    { rotate: 0, duration: 0.3 },
    { scale: 1.5, duration: 0.35 },
  ];


  const startFloatingAnimation = () => {
    animateWrapper1(
      { y: [-10, 0] },
      { repeat: Infinity, duration: 4, ease: 'easeInOut' }
    );

    animateWrapper2(
      { y: [-10, 0] },
      { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 2 }
    );
  };

  useEffect(() => {
    startFloatingAnimation();
  }, []);

  const applyBackgroundColor = (scope: HTMLElement | null, color: string) => {
    if (scope) {
      scope.style.transition = 'background-color 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      scope.style.backgroundColor = color;
    }
  };

  const handleHover = async (
    animate: typeof animate1,
    scope: HTMLElement | null,
    cardIndex: number
  ) => {
    setHoveredCard(cardIndex);
    applyBackgroundColor(scope, 'var(--highlight-color)');
  
    if (scope) {
      try {
        for (const step of hoverSequence) {
          // Allow animations to complete in sequence
          await animate(scope, step, { duration: step.duration, ease: 'easeInOut' });
        }
      } catch (e) {
        console.warn('Hover animation interrupted:', e);
      }
    }
  };
  
  const handleLeave = async (
    animate: typeof animate1,
    scope: HTMLElement | null
  ) => {
    setHoveredCard(null);
    applyBackgroundColor(scope, 'var(--highlight-color-light)');
  
    if (scope) {
      try {
        // Immediately reset to a neutral state if not already there
        await animate(scope, { scale: 1, rotate: 0 }, { ease: 'easeInOut', duration: 0.2 });
  
        // Play the bounce-out animation
        await animate(scope, { scale: 1.1, y: -10 }, { type: 'spring', stiffness: 300, damping: 15 });
        await animate(scope, { scale: 1, y: 0 }, { duration: 0.2 });
      } catch (e) {
        console.warn('Leave animation interrupted:', e);
      }
    }
  };
  
  
  
  

  const getTitleStyle = (cardIndex: number) => {
    const { isSmallScreen, isMediumScreen, isLargeScreen } = screenSize;
    const isHovered = hoveredCard === cardIndex;
    const animationDelay = cardIndex === 1 ? '0s' : '2s';
  
    let marginLeft;
    let marginTop;
  
    if (cardIndex === 1) {
      marginLeft = isSmallScreen
        ? '-21%'
        : isMediumScreen
        ? '-40%'
        : isLargeScreen
        ? '-38%'
        : '-23%';
      marginTop = isSmallScreen
        ? '12%'
        : isMediumScreen
        ? '12%'
        : isLargeScreen
        ? '4%'
        : '15.5%';
    } else {
      marginLeft = isSmallScreen
        ? '-2%'
        : isMediumScreen
        ? '14%'
        : isLargeScreen
        ? '12%'
        : '3%';
      marginTop = isSmallScreen
        ? '15%'
        : isMediumScreen
        ? '18%'
        : isLargeScreen
        ? '10%'
        : '20%';
    }
  
    return {
      color: isHovered ? '#bb86fc' : 'inherit',
      marginLeft,
      marginTop,
      animation: 'float 4s ease-in-out infinite',
      animationDelay,
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

        <div className="cards-container">
          <div
            ref={wrapper1}
            className="wrapper"
            style={{ animation: 'float 4s ease-in-out infinite' }}
            onMouseEnter={() => handleHover(animate1, scope1.current, 1)}
            onMouseLeave={() => handleLeave(animate1, scope1.current)}
          >
            <div className="animated-card" ref={scope1}>
              <Link href="/rockpaperscissors" style={{ textDecoration: 'none' }}>
                <div className="card-content">
                  <div className="emoji-container">
                    <div className="emoji" id="rock">
                      <img src="/images/rock-emoji.png" alt="Rock" className="emoji" />
                    </div>
                    <div className="emoji" id="paper">
                      <img src="/images/paper-emoji.png" alt="Paper" className="emoji" />
                    </div>
                    <div className="emoji" id="scissors">
                      <img src="/images/scissors-emoji.png" alt="Scissors" className="emoji" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div
            ref={wrapper2}
            className="wrapper"
            style={{ animation: 'float 4s ease-in-out infinite', animationDelay: '2s' }}
            onMouseEnter={() => handleHover(animate2, scope2.current, 2)}
            onMouseLeave={() => handleLeave(animate2, scope2.current)}
          >
            <div className="animated-card" ref={scope2}>
              <Link href="/texasholdem" style={{ textDecoration: 'none' }}>
                <div className="card-content">
                  <h2 className="emoji-flex-container">
                    <span className="emoji">&#9824;&#65039;</span>
                    <span className="emoji" id="heart">&#9829;&#65039;</span>
                    <span className="emoji">&#9827;&#65039;</span>
                  </h2>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="card-title">
          <Link href="/rockpaperscissors" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1
              style={getTitleStyle(1)}
              onMouseEnter={() => handleHover(animate1, scope1.current, 1)}
              onMouseLeave={() => handleLeave(animate1, scope1.current)}
            >
              Rock, Paper, Scissors
            </h1>
          </Link>
          <Link href="/texasholdem" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1
              style={getTitleStyle(2)}
              onMouseEnter={() => handleHover(animate2, scope2.current, 2)}
              onMouseLeave={() => handleLeave(animate2, scope2.current)}
            >
              Texas Hold &#39;Em
            </h1>
          </Link>
        </div>
      </div>
    </>
  );
}
