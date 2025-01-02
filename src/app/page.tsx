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

  const hoverSequence = [
    { rotate: -90 },
    { scale: 1.15 },
    { rotate: 0 },
    { scale: 1.5 },
  ];

  const leaveSequence = [
    { scale: 1, rotate: 0 },
  ];

  const startFloatingAnimation = () => {
    animateWrapper1(
      [
        { y: -10 },
        { y: 0 },
      ],
      { repeat: Infinity, duration: 4, ease: 'easeInOut' }
    );

    animateWrapper2(
      [
        { y: -10 },
        { y: 0 },
      ],
      { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 2 }
    );
  };

  useEffect(() => {
    startFloatingAnimation();
  }, []);

  const handleHover = async (
    animate: typeof animate1,
    scope: HTMLElement | null,
    cardIndex: number
  ) => {
    setHoveredCard(cardIndex);
    if (scope) {
      for (const step of hoverSequence) {
        await animate(scope, step, { duration: 0.2, ease: 'easeInOut' });
      }
    }
  };

  const handleLeave = async (
    animate: typeof animate1,
    scope: HTMLElement | null
  ) => {
    setHoveredCard(null);
    if (scope) {
      for (const step of leaveSequence) {
        await animate(scope, step, { duration: 0.2, ease: 'easeInOut' });
      }
    }
  };

  const getTitleStyle = (cardIndex: number) => {
    const isHovered = hoveredCard === cardIndex;
    const animationDelay = cardIndex === 1 ? '0s' : '2s';
    const marginLeft = cardIndex === 1 ? '-25%' : '6%';

    return {
      color: isHovered ? '#bb86fc' : 'inherit',
      marginLeft,
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

        <div className="cards-container" style={{ gap: '8%' }}>
          <div
            ref={wrapper1}
            className="wrapper"
            style={{ animation: 'float 4s ease-in-out infinite' }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              handleHover(animate1, scope1.current, 1);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              handleLeave(animate1, scope1.current);
            }}
          >
            <div className="animated-card" ref={scope1}>
              <Link href="/rps" style={{ textDecoration: 'none' }}>
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
            onMouseEnter={(e) => {
              e.stopPropagation();
              handleHover(animate2, scope2.current, 2);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              handleLeave(animate2, scope2.current);
            }}
          >
            <div className="animated-card" ref={scope2}>
              <Link href="/rps" style={{ textDecoration: 'none' }}>
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
          <Link href="/rps" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1
              style={getTitleStyle(1)}
              onMouseEnter={() => handleHover(animate1, scope1.current, 1)}
              onMouseLeave={() => handleLeave(animate1, scope1.current)}
            >
              Rock, Paper, Scissors
            </h1>
          </Link>
          <Link href="/rps" style={{ textDecoration: 'none', color: 'inherit' }}>
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
