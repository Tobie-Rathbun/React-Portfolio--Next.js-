'use client';

import { useState, RefObject } from 'react';
import { useAnimate } from 'framer-motion';
import Link from 'next/link';
import './globals.css';

export default function Home() {
  const [scope1, animate1] = useAnimate();
  const [scope2, animate2] = useAnimate();
  const [cardsContainerScope, animateCardsContainer] = useAnimate();
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

  const floatAnimation = {
    animation: 'float 4s ease-in-out infinite',
  };

  const handleHover = async (
    animate: typeof animate1,
    scope: RefObject<HTMLElement>,
    cardIndex: number
  ) => {
    setHoveredCard(cardIndex);
    if (scope.current) {
      for (const step of hoverSequence) {
        await animate(scope.current, step, { duration: 0.2, ease: 'easeInOut' });
      }
    }
  };

  const handleLeave = async (
    animate: typeof animate1,
    scope: RefObject<HTMLElement>
  ) => {
    setHoveredCard(null);
    if (scope.current) {
      for (const step of leaveSequence) {
        await animate(scope.current, step, { duration: 0.2, ease: 'easeInOut' });
      }
    }
  };

  const handleTitleHover = async (cardIndex: number) => {
    setHoveredCard(cardIndex);
    if (cardIndex === 1 && scope1.current) {
      for (const step of hoverSequence) {
        await animate1(scope1.current, step, { duration: 0.2, ease: 'easeInOut' });
      }
    } else if (cardIndex === 2 && scope2.current) {
      for (const step of hoverSequence) {
        await animate2(scope2.current, step, { duration: 0.2, ease: 'easeInOut' });
      }
    }
  };

  const handleTitleLeave = async () => {
    setHoveredCard(null);
    if (scope1.current) {
      for (const step of leaveSequence) {
        await animate1(scope1.current, step, { duration: 0.2, ease: 'easeInOut' });
      }
    }
    if (scope2.current) {
      for (const step of leaveSequence) {
        await animate2(scope2.current, step, { duration: 0.2, ease: 'easeInOut' });
      }
    }
  };

  const getTitleStyle = (cardIndex: number) => {
    const isHovered = hoveredCard === cardIndex;
    const animationDelay = cardIndex === 1 ? '0s' : '2s';
    const marginLeft = cardIndex === 1 ? '-2.5%' : '6%';

    return {
      color: isHovered ? '#bb86fc' : 'inherit',
      marginLeft,
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

        <div
          className="cards-container"
          ref={cardsContainerScope}
          style={{ animation: 'float 4s ease-in-out infinite' }}
        >
          <div
            className="animated-card"
            ref={scope1}
            onMouseEnter={() => handleHover(animate1, scope1, 1)}
            onMouseLeave={() => handleLeave(animate1, scope1)}
          >
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

          <div
            className="animated-card"
            ref={scope2}
            onMouseEnter={() => handleHover(animate2, scope2, 2)}
            onMouseLeave={() => handleLeave(animate2, scope2)}
          >
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

        <div className="card-title">
          <Link href="/rps" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1
              style={getTitleStyle(1)}
              onMouseEnter={() => handleTitleHover(1)}
              onMouseLeave={handleTitleLeave}
            >
              Rock, Paper, Scissors
            </h1>
          </Link>
          <Link href="/rps" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1
              style={getTitleStyle(2)}
              onMouseEnter={() => handleTitleHover(2)}
              onMouseLeave={handleTitleLeave}
            >
              Texas Hold &#39;Em
            </h1>
          </Link>
        </div>
      </div>
    </>
  );
}
